/**
 * Converts a restaurant name into a clean, URL-safe slug
 * Example: "Bistro Delight & Grill!" -> "bistro-delight-grill"
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
