import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Restaurant } from "@/lib/models/Restaurant";
import { Order } from "@/lib/models/Order";
import { computeOrderPricing } from "@/lib/orderPricing";
import { sendTelegramOrder } from "@/lib/telegram";
import { checkRestaurantAccess } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { restaurantSlug, table, customerName, notes, items } = body;

    if (!restaurantSlug || !table) {
      return NextResponse.json(
        { error: "Restaurant slug and table are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 });
    }

    const restaurant = await Restaurant.findOne({ slug: restaurantSlug.toLowerCase() });
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const access = checkRestaurantAccess(restaurant.status, restaurant.expiredAt);
    if (!access.isOperational) {
      return NextResponse.json(
        { error: access.message },
        { status: 403 }
      );
    }

    // Verify item prices and compute fees securely from the database
    const { orderDetails, fees, subtotal, totalPrice } = await computeOrderPricing(
      restaurant,
      items
    );

    if (orderDetails.length === 0) {
      return NextResponse.json({ error: "No valid menu items in order" }, { status: 400 });
    }

    // Save order in MongoDB
    const order = await Order.create({
      restaurantId: restaurant._id,
      table: String(table).trim(),
      customerName: customerName?.trim() || "Guest",
      notes: notes?.trim() || "",
      details: orderDetails,
      fees,
      subtotal,
      totalPrice,
      status: "pending",
      orderedAt: new Date(),
    });

    // Notify kitchen on Telegram
    const messageId = await sendTelegramOrder(order, restaurant.name, restaurant.telegramChat);
    if (messageId) {
      order.telegramMessageId = messageId;
      await order.save();
    }

    return NextResponse.json({
      ok: true,
      orderId: order._id.toString(),
      order,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
