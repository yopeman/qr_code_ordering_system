import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Restaurant } from "@/lib/models/Restaurant";
import { Menu } from "@/lib/models/Menu";
import { Order, IOrderItem, IOrderFee } from "@/lib/models/Order";
import { sendTelegramOrder } from "@/lib/telegram";

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

    if (restaurant.status !== "active") {
      return NextResponse.json(
        { error: "Restaurant is currently not accepting orders" },
        { status: 403 }
      );
    }

    // Verify item prices securely from the database
    const orderDetails: IOrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const menuItem = await Menu.findOne({
        _id: item.menuId,
        restaurantId: restaurant._id,
      });

      if (!menuItem) continue;

      const unitPrice = menuItem.price;
      const subtotalPrice = Number((unitPrice * quantity).toFixed(2));
      subtotal += subtotalPrice;

      orderDetails.push({
        menuId: menuItem._id,
        name: menuItem.name,
        quantity,
        unitPrice,
        subtotalPrice,
      });
    }

    if (orderDetails.length === 0) {
      return NextResponse.json({ error: "No valid menu items in order" }, { status: 400 });
    }

    subtotal = Number(subtotal.toFixed(2));

    // Calculate restaurant fees (e.g., VAT 15%, Service charge 50 ETB)
    const fees: IOrderFee[] = [];
    let totalFees = 0;

    if (Array.isArray(restaurant.config)) {
      for (const cfg of restaurant.config) {
        if (!cfg.amount || cfg.amount <= 0) continue;

        let feeAmount = 0;
        if (cfg.type === "percent") {
          feeAmount = Number(((subtotal * cfg.amount) / 100).toFixed(2));
        } else {
          feeAmount = Number(Number(cfg.amount).toFixed(2));
        }

        totalFees += feeAmount;
        fees.push({
          feeName: cfg.feeName,
          type: cfg.type,
          rate: cfg.amount,
          calculatedAmount: feeAmount,
        });
      }
    }

    const totalPrice = Number((subtotal + totalFees).toFixed(2));

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
