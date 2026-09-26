import { formatPrice, type Dish } from "@/lib/menu";

const TAG_STYLES: Record<string, string> = {
  vegetarian: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  vegan: "bg-lime-50 text-lime-700 ring-lime-200",
  "gluten-free": "bg-sky-50 text-sky-700 ring-sky-200",
  spicy: "bg-rose-50 text-rose-700 ring-rose-200",
  popular: "bg-amber-50 text-amber-700 ring-amber-200",
};

const TAG_LABELS: Record<string, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "gluten-free": "GF",
  spicy: "Spicy",
  popular: "Bestseller",
};

export function DishCard({
  dish,
  quantity,
  onAdd,
  onDecrement,
}: {
  dish: Dish;
  quantity: number;
  onAdd: () => void;
  onDecrement: () => void;
}) {
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white transition ${
        dish.available
          ? "border-stone-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-900/5 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-emerald-600"
          : "border-stone-200 opacity-70 dark:border-stone-800"
      }`}
    >
      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-stone-800 dark:to-stone-900">
        <span className="text-6xl drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
          {dish.image}
        </span>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {dish.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${TAG_STYLES[tag]}`}
            >
              {TAG_LABELS[tag]}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">{dish.name}</h3>
          <span className="shrink-0 rounded-lg bg-stone-900 px-2 py-1 text-sm font-bold text-white dark:bg-emerald-500 dark:text-stone-950">
            {formatPrice(dish.price)}
          </span>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          {dish.description}
        </p>

        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-stone-500 dark:text-stone-400">
          <span className="inline-flex items-center gap-1">
            <span className="text-amber-500">★</span>
            {dish.rating.toFixed(1)}
          </span>
          <span>{dish.sold} ordered</span>
          <span className="inline-flex items-center gap-1">
            <svg
              viewBox="0 0 24 24"
              width={12}
              height={12}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" strokeLinecap="round" />
            </svg>
            {dish.prepMinutes} min
          </span>
        </div>

        {quantity > 0 ? (
          <div className="mt-1 flex items-center justify-between rounded-xl bg-emerald-50 p-1.5 dark:bg-emerald-950/60">
            <button
              onClick={onDecrement}
              aria-label={`Remove one ${dish.name}`}
              className="h-9 w-9 rounded-lg bg-white text-lg font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900"
            >
              −
            </button>
            <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
              {quantity} in cart
            </span>
            <button
              onClick={onAdd}
              aria-label={`Add one more ${dish.name}`}
              className="h-9 w-9 rounded-lg bg-emerald-600 text-lg font-bold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={onAdd}
            disabled={!dish.available}
            className="mt-1 w-full rounded-xl bg-stone-900 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 dark:bg-emerald-600 dark:text-stone-950 dark:hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 dark:disabled:bg-stone-800 dark:disabled:text-stone-500"
          >
            {dish.available ? "Add to order" : "Sold out today"}
          </button>
        )}
      </div>
    </article>
  );
}
