const TAGS = ["vegetarian", "vegan", "gluten-free", "spicy"] as const;

const TAG_LABELS: Record<(typeof TAGS)[number], string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "gluten-free": "Gluten-free",
  spicy: "Spicy",
};

export function CategoryNav({
  categories,
  active,
  onSelect,
}: {
  categories: readonly { id: string; name: string; emoji: string }[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav
      aria-label="Menu categories"
      className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {categories.map((category) => {
        const isActive = category.id === active;
        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            aria-current={isActive ? "true" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                : "border-stone-200 bg-white text-stone-600 hover:border-emerald-300 hover:text-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-emerald-600 dark:hover:text-emerald-300"
            }`}
          >
            <span aria-hidden>{category.emoji}</span>
            {category.name}
          </button>
        );
      })}
    </nav>
  );
}

export function FilterBar({
  query,
  onQueryChange,
  activeTags,
  onToggleTag,
  sort,
  onSortChange,
  resultCount,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  activeTags: string[];
  onToggleTag: (tag: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  resultCount: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500">
            <svg
              viewBox="0 0 24 24"
              width={16}
              height={16}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </span>
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search dishes, ingredients…"
            aria-label="Search menu"
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-emerald-500"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort menu"
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
        >
          <option value="popular">Most popular</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
          <option value="fastest">Fastest prep</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TAGS.map((tag) => {
          const isActive = activeTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              aria-pressed={isActive}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "border-amber-400 bg-amber-100 text-amber-800 dark:border-amber-500 dark:bg-amber-950/60 dark:text-amber-200"
                  : "border-stone-200 bg-white text-stone-500 hover:border-amber-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:hover:border-amber-600"
              }`}
            >
              {TAG_LABELS[tag]}
            </button>
          );
        })}
        <span className="ml-auto text-xs text-stone-400 dark:text-stone-500">
          {resultCount} dish{resultCount === 1 ? "" : "es"}
        </span>
      </div>
    </div>
  );
}
