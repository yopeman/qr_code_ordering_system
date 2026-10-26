import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "qrcos-default-secret-jwt-key";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface AdminTokenPayload {
  adminId: string;
  email: string;
  role: "admin";
}

export interface RestaurantTokenPayload {
  restaurantId: string;
  slug: string;
  role: "restaurant";
}

export function signAdminToken(admin: { _id: string | object; email: string }): string {
  const payload: AdminTokenPayload = {
    adminId: admin._id.toString(),
    email: admin.email,
    role: "admin",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function signRestaurantToken(restaurant: { _id: string | object; slug: string }): string {
  const payload: RestaurantTokenPayload = {
    restaurantId: restaurant._id.toString(),
    slug: restaurant.slug,
    role: "restaurant",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    if (decoded.role === "admin") {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export function verifyRestaurantToken(token: string): RestaurantTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as RestaurantTokenPayload;
    if (decoded.role === "restaurant") {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

// Token storage key constants
export const ADMIN_COOKIE_NAME = "qrcos-admin-token";
export const RESTAURANT_COOKIE_NAME = "qrcos-restaurant-token";
