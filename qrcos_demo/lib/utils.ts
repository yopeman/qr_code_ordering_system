/**
 * Converts a restaurant name into a clean, URL-safe slug
 * Example: "Habesha Restaurant & Grill!" -> "habesha-restaurant-grill"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD") // normalize accented characters
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/&/g, "-and-") // replace & with 'and'
    .replace(/[\s\W-]+/g, "-") // replace spaces and non-word characters with single -
    .replace(/^-+/, "") // trim leading -
    .replace(/-+$/, ""); // trim trailing -
}

/**
 * Formats a numeric price to ETB currency string
 * Example: formatETB(450) -> "450.00 ETB"
 */
export function formatETB(amount: number | string | null | undefined): string {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount || 0)) || 0;
  return `${num.toFixed(2)} ETB`;
}
