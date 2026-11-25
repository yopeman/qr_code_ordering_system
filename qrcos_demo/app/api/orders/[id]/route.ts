import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order, OrderStatus } from "@/lib/models/Order";
import { Restaurant } from "@/lib/models/Restaurant";
import {
  updateTelegramOrderStatus,
  deleteTelegramMessage,
  ORDER_STATUSES,
} from "@/lib/telegram";
import { computeOrderPricing } from "@/lib/orderPricing";
import { checkRestaurantAccess } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id).populate("restaurantId", "name slug logoUrl");
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      order: {
        _id: order._id,
        restaurant: order.restaurantId,
        table: order.table,
        customerName: order.customerName,
        notes: order.notes,
        details: order.details,
        fees: order.fees,
        subtotal: order.subtotal,
        totalPrice: order.totalPrice,
        status: order.status,
        orderedAt: order.orderedAt,
        startPreparingAt: order.startPreparingAt,
        completedAt: order.completedAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const newStatus = status as OrderStatus;
    order.status = newStatus;

    if (newStatus === "preparing" && !order.startPreparingAt) {
      order.startPreparingAt = new Date();
    } else if (newStatus === "completed" && !order.completedAt) {
      order.completedAt = new Date();
    }

    await order.save();

    // Sync status change to Telegram message
    const restaurant = await Restaurant.findById(order.restaurantId);
    if (restaurant && order.telegramMessageId && restaurant.telegramChat?.trim()) {
      await updateTelegramOrderStatus(
        restaurant.telegramChat.trim(),
        order.telegramMessageId,
        order,
        restaurant.name
      );
    }

    return NextResponse.json({ ok: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { table, customerName, notes, items } = body;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending orders can be edited." },
        { status: 409 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    const restaurant = await Restaurant.findById(order.restaurantId);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const access = checkRestaurantAccess(restaurant.status, restaurant.expiredAt);
    if (!access.isOperational) {
      return NextResponse.json({ error: access.message }, { status: 403 });
    }

    const { orderDetails, fees, subtotal, totalPrice } = await computeOrderPricing(
      restaurant,
      items
    );

    if (orderDetails.length === 0) {
      return NextResponse.json(
        { error: "No valid menu items in order" },
        { status: 400 }
      );
    }

    if (typeof table === "string" && table.trim()) {
      order.table = table.trim();
    }
    if (typeof customerName === "string") {
      order.customerName = customerName.trim() || "Guest";
    }
    if (typeof notes === "string") {
      order.notes = notes.trim();
    }
    order.details = orderDetails;
    order.fees = fees;
    order.subtotal = subtotal;
    order.totalPrice = totalPrice;

    await order.save();

    if (order.telegramMessageId && restaurant.telegramChat?.trim()) {
      await updateTelegramOrderStatus(
        restaurant.telegramChat.trim(),
        order.telegramMessageId,
        order,
        restaurant.name
      );
    }

    return NextResponse.json({ ok: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending orders can be cancelled." },
        { status: 409 }
      );
    }

    const restaurant = await Restaurant.findById(order.restaurantId);

    await Order.findByIdAndDelete(id);

    if (restaurant && order.telegramMessageId && restaurant.telegramChat?.trim()) {
      await deleteTelegramMessage(
        restaurant.telegramChat.trim(),
        order.telegramMessageId
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
