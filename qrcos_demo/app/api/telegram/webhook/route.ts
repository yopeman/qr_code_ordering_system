import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order, OrderStatus } from "@/lib/models/Order";
import { Restaurant } from "@/lib/models/Restaurant";
import {
  ORDER_STATUSES,
  updateTelegramOrderStatus,
  answerTelegramCallbackQuery,
} from "@/lib/telegram";

type TelegramUpdate = {
  callback_query?: {
    id: string;
    data?: string;
    message?: {
      message_id: number;
      chat: { id: number | string };
      text?: string;
    };
  };
};

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret) {
      const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
      if (headerSecret !== secret) {
        return NextResponse.json({ error: "Invalid secret token" }, { status: 401 });
      }
    }

    const update: TelegramUpdate = await request.json();
    const query = update.callback_query;

    if (!query?.data || !query.message) {
      return NextResponse.json({ ok: true });
    }

    // Expected format: "ord:<status>:<orderId>" or "ord:<status>"
    const parts = query.data.split(":");
    if (parts[0] !== "ord" || !parts[1]) {
      return NextResponse.json({ ok: true });
    }

    const targetStatus = parts[1] as OrderStatus;
    if (!ORDER_STATUSES.includes(targetStatus)) {
      return NextResponse.json({ ok: true });
    }

    await connectDB();

    let order = null;
    const orderId = parts[2];

    if (orderId) {
      order = await Order.findById(orderId);
    }

    // Fallback: search by messageId
    if (!order && query.message.message_id) {
      order = await Order.findOne({ telegramMessageId: query.message.message_id });
    }

    if (!order) {
      await answerTelegramCallbackQuery(query.id, "Order not found");
      return NextResponse.json({ ok: true, error: "Order not found" });
    }

    // Update status and timestamps
    order.status = targetStatus;
    if (targetStatus === "preparing" && !order.startPreparingAt) {
      order.startPreparingAt = new Date();
    } else if (targetStatus === "completed" && !order.completedAt) {
      order.completedAt = new Date();
    }
    await order.save();

    // Answer callback query so Telegram spinner stops
    await answerTelegramCallbackQuery(
      query.id,
      `Status updated to ${targetStatus.toUpperCase()}`
    );

    // Refresh Telegram message with updated buttons & checkmark
    const restaurant = await Restaurant.findById(order.restaurantId);
    if (restaurant) {
      await updateTelegramOrderStatus(
        query.message.chat.id,
        query.message.message_id,
        order,
        restaurant.name
      );
    }

    return NextResponse.json({ ok: true, status: targetStatus });
  } catch (err: any) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
