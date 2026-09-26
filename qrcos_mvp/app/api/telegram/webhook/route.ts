import { NextResponse } from "next/server";
import { ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from "@/lib/orders";

type Update = {
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

function replaceStatusLine(text: string, next: OrderStatus) {
  const current = Object.values(STATUS_LABELS).find((line) =>
    text.includes(line),
  );
  const line = STATUS_LABELS[next];
  return current ? text.replace(current, line) : `${text}\n${line}`;
}

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ error: "Invalid secret token." }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Telegram is not configured." }, { status: 500 });
  }

  const update = (await request.json()) as Update;
  const query = update.callback_query;
  if (!query?.data || !query.message) {
    return NextResponse.json({ ok: true });
  }

  const requested = query.data.replace(/^ord:/, "") as OrderStatus;
  if (!ORDER_STATUSES.includes(requested)) {
    return NextResponse.json({ ok: true });
  }

  const call = (method: string, body: Record<string, unknown>) =>
    fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

  const text = query.message.text;
  await call("answerCallbackQuery", { callback_query_id: query.id }).catch(
    () => undefined,
  );

  await call("editMessageText", {
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    text: text ? replaceStatusLine(text, requested) : STATUS_LABELS[requested],
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        ORDER_STATUSES.map((option) => ({
          text: `${STATUS_LABELS[option]}${option === requested ? " ✓" : ""}`,
          callback_data: `ord:${option}`,
        })),
      ],
    },
  });

  return NextResponse.json({ ok: true, status: requested });
}
