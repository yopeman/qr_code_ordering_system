"use client";

import { useState } from "react";
import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  SERVICE_FEE_RATE,
  TAX_RATE,
  type Dish,
  formatPrice,
} from "@/lib/menu";

export type CartLine = { dish: Dish; quantity: number };

export function CartPanel({
  lines,
  onIncrement,
  onDecrement,
  onClear,
}: {
  lines: CartLine[];
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onClear: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  const placeOrder = async () => {
    if (lines.length === 0) return;
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: "Table 12",
          lines: lines.map((line) => ({
            id: line.dish.id,
            quantity: line.quantity,
          })),
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Order failed");
      setStatus("sent");
      onClear();
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Order failed");
    }
  };

  const subtotal = lines.reduce(
    (sum, line) => sum + line.dish.price * line.quantity,
    0,
  );
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const service = subtotal * SERVICE_FEE_RATE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + delivery + service + tax;
  const toFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return (
    <aside className="sticky top-24 flex max-h-[calc(100vh-7rem)] flex-col rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-900/5 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 dark:border-stone-800">
        <div>
          <h2 className="font-semibold text-stone-900 dark:text-stone-100">Your Order</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {lines.reduce((n, l) => n + l.quantity, 0)} items · Table 12
          </p>
        </div>
        {lines.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-semibold text-rose-500 transition hover:text-rose-600"
          >
            Clear
          </button>
        )}
      </div>

      {toFreeDelivery > 0 && subtotal > 0 && (
        <div className="border-b border-stone-100 bg-amber-50 px-5 py-2.5 text-xs font-medium text-amber-800 dark:text-amber-200 dark:border-stone-800 dark:bg-amber-950/50 dark:text-amber-200">
          Add {formatPrice(toFreeDelivery)} more for free delivery
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-3">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="text-4xl">🧺</span>
            <p className="text-sm font-medium text-stone-600 dark:text-stone-300">Your basket is empty</p>
            <p className="text-xs text-stone-400">
              Tap “Add to order” to start your meal.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {lines.map(({ dish, quantity }) => (
              <li key={dish.id} className="flex items-center gap-3">
                <span className="text-2xl">{dish.image}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-200">
                    {dish.name}
                  </p>
                  <p className="text-xs text-stone-400 dark:text-stone-500">
                    {formatPrice(dish.price)} each
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-0.5 dark:bg-stone-800">
                  <button
                    onClick={() => onDecrement(dish.id)}
                    aria-label={`Remove one ${dish.name}`}
                    className="h-7 w-7 rounded-md bg-white dark:bg-stone-700 text-sm font-bold text-stone-600 transition hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-stone-800 dark:text-stone-100">
                    {quantity}
                  </span>
                  <button
                    onClick={() => onIncrement(dish.id)}
                    aria-label={`Add one ${dish.name}`}
                    className="h-7 w-7 rounded-md bg-white dark:bg-stone-700 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 dark:bg-stone-700 dark:text-emerald-300 dark:hover:bg-emerald-900"
                  >
                    +
                  </button>
                </div>
                <span className="w-14 text-right text-sm font-semibold text-stone-800 dark:text-stone-100">
                  {formatPrice(dish.price * quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-stone-100 px-5 py-4 dark:border-stone-800">
        <dl className="flex flex-col gap-1.5 text-sm dark:text-stone-400">
          <Row label="Subtotal" value={formatPrice(subtotal)} />
          <Row
            label="Delivery"
            value={delivery === 0 ? "Free" : formatPrice(delivery)}
            accent={delivery === 0}
          />
          <Row label="Service fee" value={formatPrice(service)} />
          <Row label="Tax" value={formatPrice(tax)} />
        </dl>
        <div className="mt-3 flex items-baseline justify-between border-t border-dashed border-stone-200 pt-3">
          <span className="font-semibold text-stone-900 dark:text-stone-100">Total</span>
          <span className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {formatPrice(total)}
          </span>
        </div>
        <button
          onClick={placeOrder}
          disabled={lines.length === 0 || status === "sending"}
          className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-600 dark:text-stone-950 dark:hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 dark:disabled:bg-stone-800 dark:disabled:text-stone-500"
        >
          {lines.length === 0
            ? "Add items to continue"
            : status === "sending"
              ? "Sending to kitchen…"
              : status === "sent"
                ? "Order sent ✓"
                : "Place order"}
        </button>
        {status === "error" && (
          <p className="mt-2 text-center text-[11px] font-medium text-rose-500">
            {error}
          </p>
        )}
        <p className="mt-2 text-center text-[11px] text-stone-400 dark:text-stone-500">
          {status === "sent"
            ? "The kitchen has your order"
            : "Sent to the kitchen via Telegram"}
        </p>
      </div>
    </aside>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between text-stone-500">
      <dt>{label}</dt>
      <dd className={accent ? "font-semibold text-emerald-600" : "text-stone-700 dark:text-stone-200"}>
        {value}
      </dd>
    </div>
  );
}
