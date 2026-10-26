import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order, OrderStatus } from "@/lib/models/Order";
import { Restaurant } from "@/lib/models/Restaurant";
import { updateTelegramOrderStatus, ORDER_STATUSES } from "@/lib/telegram";

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
    if (restaurant && order.telegramMessageId) {
      const channel = restaurant.telegramChat || process.env.TELEGRAM_CHANNEL;
      if (channel) {
        await updateTelegramOrderStatus(
          channel,
          order.telegramMessageId,
          order,
          restaurant.name
        );
      }
    }

    return NextResponse.json({ ok: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
