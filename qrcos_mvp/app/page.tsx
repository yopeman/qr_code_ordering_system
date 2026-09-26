"use client";

import { useMemo, useState } from "react";
import { CartPanel, type CartLine } from "@/components/cart-panel";
import { DishCard } from "@/components/dish-card";
import { CategoryNav, FilterBar } from "@/components/menu-controls";
import { ThemeToggle } from "@/components/theme-toggle";
import { CATEGORIES, MENU, type Dish } from "@/lib/menu";

export default function Home() {
  const [category, setCategory] = useState<string>("popular");
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sort, setSort] = useState("popular");
  const [cart, setCart] = useState<Record<string, number>>({});

  const visibleDishes = useMemo(() => {
    const term = query.trim().toLowerCase();

    const filtered = MENU.filter((dish) => {
      const inCategory =
        category === "popular"
          ? dish.tags.includes("popular")
          : dish.category === category;
      const matchesSearch =
        term === "" ||
        dish.name.toLowerCase().includes(term) ||
        dish.description.toLowerCase().includes(term);
      const matchesTags = activeTags.every((tag) => dish.tags.includes(tag as Dish["tags"][number]));
      return inCategory && matchesSearch && matchesTags;
    });

    const sorted = [...filtered];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "fastest":
        sorted.sort((a, b) => a.prepMinutes - b.prepMinutes);
        break;
      default:
        sorted.sort((a, b) => b.sold - a.sold);
    }
    return sorted;
  }, [category, query, activeTags, sort]);

  const cartLines: CartLine[] = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, quantity]) => quantity > 0)
        .map(([id, quantity]) => ({
          dish: MENU.find((dish) => dish.id === id)!,
          quantity,
        })),
    [cart],
  );

  const update = (id: string, delta: number) => {
    setCart((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      if (next === 0) {
        const rest = { ...prev };
        delete rest[id];
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const toggleTag = (tag: string) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const activeCategoryName =
    CATEGORIES.find((c) => c.id === category)?.name ?? "Popular";

  return (
    <div className="min-h-full bg-stone-50 dark:bg-stone-950">
      <header className="border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-xl">
              🍽️
            </span>
            <div>
              <h1 className="text-lg font-bold leading-tight text-stone-900 dark:text-stone-100">
                Verde Kitchen
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Seasonal menu · Open until 22:30 · Prices in ETB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              Table 12
            </span>
            <ThemeToggle />
            <button className="rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800">
              🧾 Order history
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 py-6 lg:grid-cols-[1fr_360px]">
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Browse the menu</h2>
            <CategoryNav
              categories={CATEGORIES}
              active={category}
              onSelect={setCategory}
            />
          </div>

          <FilterBar
            query={query}
            onQueryChange={setQuery}
            activeTags={activeTags}
            onToggleTag={toggleTag}
            sort={sort}
            onSortChange={setSort}
            resultCount={visibleDishes.length}
          />

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
              {activeCategoryName}
            </h3>
            {visibleDishes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white py-16 dark:border-stone-700 dark:bg-stone-900 text-center">
                <p className="text-4xl">🔍</p>
                <p className="mt-3 text-sm font-medium text-stone-600 dark:text-stone-300">
                  No dishes match your filters
                </p>
                <button
                  onClick={() => {
                    setQuery("");
                    setActiveTags([]);
                    setCategory("popular");
                  }}
                  className="mt-3 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600 dark:bg-emerald-600 dark:text-stone-950"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleDishes.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    quantity={cart[dish.id] ?? 0}
                    onAdd={() => update(dish.id, 1)}
                    onDecrement={() => update(dish.id, -1)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <CartPanel
          lines={cartLines}
          onIncrement={(id) => update(id, 1)}
          onDecrement={(id) => update(id, -1)}
          onClear={() => setCart({})}
        />
      </main>
    </div>
  );
}
