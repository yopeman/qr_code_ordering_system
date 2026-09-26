import {
  SERVICE_FEE_RATE,
  TAX_RATE,
  formatPrice,
  MENU,
  type Dish,
} from "@/lib/menu";

export const ORDER_STATUSES = ["pending", "preparing", "completed"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "🕒 Pending",
  preparing: "👨‍🍳 Preparing",
  completed: "✅ Completed",
};

export const STATUS_BUTTONS: Record<OrderStatus, string> = {
  pending: "🕒 Pending",
  preparing: "👨‍🍳 Preparing",
  completed: "✅ Completed",
};

export type OrderLine = { id: string; quantity: number };

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

export function resolveLines(lines: OrderLine[]) {
  const dishes = new Map<string, Dish>(MENU.map((dish) => [dish.id, dish]));
  return lines.flatMap((line) => {
    const dish = dishes.get(line.id);
    return dish ? [{ dish, quantity: line.quantity }] : [];
  });
}

export function totals(lines: OrderLine[]) {
  const subtotal = lines.reduce((sum, line) => {
    const dish = MENU.find((item) => item.id === line.id);
    return dish ? sum + dish.price * line.quantity : sum;
  }, 0);
  const service = subtotal * SERVICE_FEE_RATE;
  const tax = subtotal * TAX_RATE;
  return { subtotal, service, tax, total: subtotal + service + tax };
}

export function buildMessage({
  lines,
  table,
  customer,
  notes,
  status,
}: {
  lines: OrderLine[];
  table: string;
  customer: string;
  notes: string;
  status: OrderStatus;
}) {
  const items = resolveLines(lines)
    .map(
      ({ dish, quantity }) =>
        `• ${escapeHtml(dish.name)} × ${quantity} — ${formatPrice(
          dish.price * quantity,
        )}`,
    )
    .join("\n");

  const { subtotal, service, tax, total } = totals(lines);

  return [
    `🧾 <b>New order</b> · ${escapeHtml(table)}`,
    customer ? `👤 ${escapeHtml(customer)}` : "",
    "",
    items || "No items",
    "",
    `Subtotal: ${formatPrice(subtotal)}`,
    `Service fee: ${formatPrice(service)}`,
    `Tax: ${formatPrice(tax)}`,
    `<b>Total: ${formatPrice(total)}</b>`,
    notes ? `\n📝 ${escapeHtml(notes)}` : "",
    `\n${STATUS_LABELS[status]}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildKeyboard(status: OrderStatus) {
  return {
    inline_keyboard: [
      ORDER_STATUSES.map((option) => ({
        text: `${STATUS_BUTTONS[option]}${option === status ? " ✓" : ""}`,
        callback_data: `ord:${option}`,
      })),
    ],
  };
}
