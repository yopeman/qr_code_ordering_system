import { NextResponse } from "next/server";
import {
  buildKeyboard,
  buildMessage,
  ORDER_STATUSES,
  type OrderLine,
  type OrderStatus,
} from "@/lib/orders";

async function telegram(
  method: string,
  body: Record<string, unknown>,
  token: string,
) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await response.json()) as {
    ok?: boolean;
    result?: { message_id?: number };
    description?: string;
  };
  if (!response.ok || !data.ok) {
    throw new Error(data.description ?? `Telegram ${method} failed`);
  }
  return data.result;
}

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channel = process.env.TELEGRAM_CHANNEL;

  if (!token || !channel) {
    return NextResponse.json(
      { error: "Telegram is not configured on the server." },
      { status: 500 },
    );
  }

  let payload: {
    table?: string;
    customer?: string;
    notes?: string;
    lines?: OrderLine[];
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const lines = (payload.lines ?? []).filter((line) => line.id && line.quantity > 0);
  if (lines.length === 0) {
    return NextResponse.json({ error: "Your basket is empty." }, { status: 400 });
  }

  const text = buildMessage({
    lines,
    table: payload.table?.trim() || "Table 12",
    customer: payload.customer?.trim() || "Guest",
    notes: payload.notes?.trim() || "",
    status: "pending",
  });

  try {
    const message = await telegram(
      "sendMessage",
      {
        chat_id: channel,
        text,
        parse_mode: "HTML",
        reply_markup: buildKeyboard("pending"),
      },
      token,
    );
    return NextResponse.json({ ok: true, messageId: message?.message_id ?? null });
  } catch (cause) {
    return NextResponse.json(
      {
        error:
          cause instanceof Error ? cause.message : "Could not reach Telegram.",
      },
      { status: 502 },
    );
  }
}

export async function PATCH(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channel = process.env.TELEGRAM_CHANNEL;
  if (!token || !channel) {
    return NextResponse.json(
      { error: "Telegram is not configured on the server." },
      { status: 500 },
    );
  }

  let payload: {
    messageId?: number;
    status?: string;
    table?: string;
    customer?: string;
    notes?: string;
    lines?: OrderLine[];
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { messageId, status } = payload;
  if (!messageId) {
    return NextResponse.json({ error: "messageId is required." }, { status: 400 });
  }
  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Unknown status." }, { status: 400 });
  }

  const lines = (payload.lines ?? []).filter((line) => line.id && line.quantity > 0);
  if (lines.length === 0) {
    return NextResponse.json({ error: "Order lines are required." }, { status: 400 });
  }

  const text = buildMessage({
    lines,
    table: payload.table?.trim() || "Table 12",
    customer: payload.customer?.trim() || "Guest",
    notes: payload.notes?.trim() || "",
    status: status as OrderStatus,
  });

  try {
    await telegram(
      "editMessageText",
      {
        chat_id: channel,
        message_id: messageId,
        text,
        parse_mode: "HTML",
        reply_markup: buildKeyboard(status as OrderStatus),
      },
      token,
    );
    return NextResponse.json({ ok: true });
  } catch (cause) {
    return NextResponse.json(
      {
        error:
          cause instanceof Error ? cause.message : "Could not reach Telegram.",
      },
      { status: 502 },
    );
  }
}
