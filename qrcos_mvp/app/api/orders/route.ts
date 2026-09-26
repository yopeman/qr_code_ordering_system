import { NextResponse } from "next/server";
import { formatPrice, MENU, type Dish } from "@/lib/menu";

type OrderLine = { id: string; quantity: number };

type OrderPayload = {
  table?: string;
  customer?: string;
  notes?: string;
  lines?: OrderLine[];
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]!,
  );

function buildMessage(
  lines: OrderLine[],
  table: string,
  customer: string,
  notes: string,
) {
  const dishes = new Map<string, Dish>(MENU.map((dish) => [dish.id, dish]));

  const items = lines
    .map((line) => {
      const dish = dishes.get(line.id);
      if (!dish) return null;
      return `• ${escapeHtml(dish.name)} × ${line.quantity} — ${formatPrice(
        dish.price * line.quantity,
      )}`;
    })
    .filter(Boolean)
    .join("\n");

  const subtotal = lines.reduce((sum, line) => {
    const dish = dishes.get(line.id);
    return dish ? sum + dish.price * line.quantity : sum;
  }, 0);
  const service = subtotal * 0.08;
  const tax = subtotal * 0.09;

  return [
    `🧾 <b>New order</b> · ${escapeHtml(table)}`,
    customer ? `👤 ${escapeHtml(customer)}` : "",
    "",
    items || "No items",
    "",
    `Subtotal: ${formatPrice(subtotal)}`,
    `Service fee: ${formatPrice(service)}`,
    `Tax: ${formatPrice(tax)}`,
    `<b>Total: ${formatPrice(subtotal + service + tax)}</b>`,
    notes ? `\n📝 ${escapeHtml(notes)}` : "",
  ]
    .filter((part) => part !== "")
    .join("\n");
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

  let payload: OrderPayload;
  try {
    payload = (await request.json()) as OrderPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const lines = (payload.lines ?? []).filter(
    (line) => line.id && line.quantity > 0,
  );
  if (lines.length === 0) {
    return NextResponse.json({ error: "Your basket is empty." }, { status: 400 });
  }

  const text = buildMessage(
    lines,
    payload.table?.trim() || "Table 12",
    payload.customer?.trim() || "Guest",
    payload.notes?.trim() || "",
  );

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: channel,
          text,
          parse_mode: "HTML",
        }),
        cache: "no-store",
      },
    );
    const data = (await response.json()) as {
      ok?: boolean;
      description?: string;
    };

    if (!response.ok || !data.ok) {
      return NextResponse.json(
        { error: data.description ?? "Telegram rejected the message." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not reach Telegram." },
      { status: 502 },
    );
  }
}
