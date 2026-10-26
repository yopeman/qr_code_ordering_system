import { IOrder, OrderStatus } from "./models/Order";

export const ORDER_STATUSES: OrderStatus[] = ["pending", "preparing", "completed"];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "⏳ Pending",
  preparing: "👨‍🍳 Preparing",
  completed: "✅ Completed",
};

export function buildInlineKeyboard(orderId: string, currentStatus: OrderStatus) {
  return {
    inline_keyboard: [
      ORDER_STATUSES.map((status) => ({
        text: `${STATUS_LABELS[status]}${status === currentStatus ? " ✓" : ""}`,
        callback_data: `ord:${status}:${orderId}`,
      })),
    ],
  };
}

export function buildOrderReceipt(order: IOrder, restaurantName: string): string {
  const dateStr = new Date(order.orderedAt || Date.now()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const lines = (order.details || []).map((item) => {
    return `• <b>${item.name}</b> x${item.quantity} — $${(item.subtotalPrice || item.unitPrice * item.quantity).toFixed(2)}`;
  });

  let feesBlock = "";
  if (order.fees && order.fees.length > 0) {
    feesBlock =
      "\n" +
      order.fees
        .map((f) => `• <i>${f.feeName}</i>: $${Number(f.calculatedAmount).toFixed(2)}`)
        .join("\n");
  }

  const notesBlock = order.notes?.trim() ? `\n📝 <b>Note:</b> <i>${escapeHtml(order.notes)}</i>\n` : "";

  return [
    `🔔 <b>NEW ORDER — ${escapeHtml(restaurantName.toUpperCase())}</b>`,
    `📍 <b>Table:</b> <code>${escapeHtml(order.table)}</code>`,
    `👤 <b>Guest:</b> ${escapeHtml(order.customerName || "Guest")}`,
    `🕒 <b>Time:</b> ${dateStr}`,
    notesBlock,
    `🍽 <b>Items:</b>`,
    ...lines,
    feesBlock,
    `────────────────────`,
    `💵 <b>Total:</b> $${Number(order.totalPrice).toFixed(2)}`,
    `📌 <b>Status:</b> ${STATUS_LABELS[order.status] || order.status}`,
    `🆔 <code>${order._id.toString()}</code>`,
  ]
    .filter(Boolean)
    .join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendTelegramOrder(
  order: IOrder,
  restaurantName: string,
  chatOverride?: string
): Promise<number | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channel = chatOverride?.trim() || process.env.TELEGRAM_CHANNEL;

  if (!token || !channel) {
    console.warn("Telegram bot token or channel not configured.");
    return null;
  }

  const text = buildOrderReceipt(order, restaurantName);
  const reply_markup = buildInlineKeyboard(order._id.toString(), order.status);

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: channel,
        text,
        parse_mode: "HTML",
        reply_markup,
      }),
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      console.error("Telegram sendMessage error:", data);
      return null;
    }

    return data.result?.message_id ?? null;
  } catch (err) {
    console.error("Failed to post order to Telegram:", err);
    return null;
  }
}

export async function updateTelegramOrderStatus(
  chatId: string | number,
  messageId: number,
  order: IOrder,
  restaurantName: string
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId || !messageId) {
    return false;
  }

  const text = buildOrderReceipt(order, restaurantName);
  const reply_markup = buildInlineKeyboard(order._id.toString(), order.status);

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: "HTML",
        reply_markup,
      }),
      cache: "no-store",
    });

    const data = await response.json();
    return Boolean(data.ok);
  } catch (err) {
    console.error("Failed to edit Telegram message:", err);
    return false;
  }
}

export async function answerTelegramCallbackQuery(callbackQueryId: string, text?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || "Order status updated",
      }),
      cache: "no-store",
    });
  } catch (err) {
    console.error("Failed to answer callback query:", err);
  }
}
