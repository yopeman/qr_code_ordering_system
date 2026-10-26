import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Restaurant } from "@/lib/models/Restaurant";
import {
  hashPassword,
  comparePassword,
  signRestaurantToken,
  verifyRestaurantToken,
  RESTAURANT_COOKIE_NAME,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const token =
      request.cookies.get(RESTAURANT_COOKIE_NAME)?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = verifyRestaurantToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const restaurant = await Restaurant.findById(payload.restaurantId).select("-password");
    if (!restaurant) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, restaurant });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { action, slug } = body;

    const normalizedSlug = slug?.trim().toLowerCase();
    if (!normalizedSlug && action !== "logout") {
      return NextResponse.json({ error: "Restaurant slug is required" }, { status: 400 });
    }

    // Action: Check restaurant password status
    if (action === "check") {
      const restaurant = await Restaurant.findOne({ slug: normalizedSlug });
      if (!restaurant) {
        return NextResponse.json({ exists: false, error: "Restaurant not found" }, { status: 404 });
      }

      return NextResponse.json({
        exists: true,
        restaurantName: restaurant.name,
        status: restaurant.status,
        needsPasswordSetup: restaurant.password === null || restaurant.password === "",
      });
    }

    // Action: Initial Password Setup (when password === null)
    if (action === "setup") {
      const newPassword = body.newPassword;
      if (!newPassword || newPassword.length < 4) {
        return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
      }

      const restaurant = await Restaurant.findOne({ slug: normalizedSlug });
      if (!restaurant) {
        return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
      }

      if (restaurant.password !== null && restaurant.password !== "") {
        return NextResponse.json(
          { error: "Password already configured. Please log in." },
          { status: 400 }
        );
      }

      restaurant.password = await hashPassword(newPassword);
      await restaurant.save();

      const token = signRestaurantToken(restaurant);
      const res = NextResponse.json({
        ok: true,
        token,
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
          status: restaurant.status,
        },
      });

      res.cookies.set(RESTAURANT_COOKIE_NAME, token, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    // Action: Login
    if (action === "login") {
      const password = body.password;
      if (!password) {
        return NextResponse.json({ error: "Password is required" }, { status: 400 });
      }

      const restaurant = await Restaurant.findOne({ slug: normalizedSlug });
      if (!restaurant) {
        return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
      }

      if (restaurant.status === "suspended") {
        return NextResponse.json({ error: "Restaurant account is suspended" }, { status: 403 });
      }

      if (restaurant.password === null || restaurant.password === "") {
        return NextResponse.json(
          { error: "Initial password setup required", needsPasswordSetup: true },
          { status: 400 }
        );
      }

      const isMatch = await comparePassword(password, restaurant.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
      }

      const token = signRestaurantToken(restaurant);
      const res = NextResponse.json({
        ok: true,
        token,
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
          status: restaurant.status,
        },
      });

      res.cookies.set(RESTAURANT_COOKIE_NAME, token, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    // Action: Change Password
    if (action === "change-password") {
      const token =
        request.cookies.get(RESTAURANT_COOKIE_NAME)?.value ||
        request.headers.get("authorization")?.replace("Bearer ", "");

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const payload = verifyRestaurantToken(token);
      if (!payload || payload.slug !== normalizedSlug) {
        return NextResponse.json({ error: "Forbidden: session mismatch" }, { status: 403 });
      }

      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword || newPassword.length < 4) {
        return NextResponse.json(
          { error: "Current and new password (min 4 characters) required" },
          { status: 400 }
        );
      }

      const restaurant = await Restaurant.findById(payload.restaurantId);
      if (!restaurant) {
        return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
      }

      if (restaurant.password) {
        const isMatch = await comparePassword(currentPassword, restaurant.password);
        if (!isMatch) {
          return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }
      }

      restaurant.password = await hashPassword(newPassword);
      await restaurant.save();

      return NextResponse.json({ ok: true, message: "Password updated successfully" });
    }

    // Action: Logout
    if (action === "logout") {
      const res = NextResponse.json({ ok: true });
      res.cookies.delete(RESTAURANT_COOKIE_NAME);
      return res;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
