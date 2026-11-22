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

export type RestaurantStatus = "active" | "inactive" | "suspended";

export interface RestaurantAccessCheck {
  isOperational: boolean; // true ONLY if active AND not expired
  isExpired: boolean;
  status: RestaurantStatus;
  statusLabel: string;
  badgeVariant: "active" | "inactive" | "suspended" | "expired";
  reason?: "inactive" | "suspended" | "expired";
  message: string;
}

export function isRestaurantExpired(expiredAt: Date | string | null | undefined): boolean {
  if (!expiredAt) return false;
  return new Date(expiredAt).getTime() < Date.now();
}

export function checkRestaurantAccess(
  status: string = "active",
  expiredAt?: Date | string | null
): RestaurantAccessCheck {
  const isExpired = isRestaurantExpired(expiredAt);
  const normStatus = (status || "active") as RestaurantStatus;

  if (normStatus === "suspended") {
    return {
      isOperational: false,
      isExpired,
      status: normStatus,
      statusLabel: "Suspended",
      badgeVariant: "suspended",
      reason: "suspended",
      message: "This restaurant is currently suspended by the platform administrator.",
    };
  }

  if (isExpired) {
    const dateStr = expiredAt ? new Date(expiredAt).toLocaleDateString() : "";
    return {
      isOperational: false,
      isExpired: true,
      status: normStatus,
      statusLabel: "Subscription Expired",
      badgeVariant: "expired",
      reason: "expired",
      message: `This restaurant's subscription expired on ${dateStr}.`,
    };
  }

  if (normStatus === "inactive") {
    return {
      isOperational: false,
      isExpired: false,
      status: normStatus,
      statusLabel: "Inactive",
      badgeVariant: "inactive",
      reason: "inactive",
      message: "This restaurant is currently inactive and not accepting orders.",
    };
  }

  return {
    isOperational: true,
    isExpired: false,
    status: "active",
    statusLabel: "Active",
    badgeVariant: "active",
    message: "Open for orders",
  };
}
