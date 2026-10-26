import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Restaurant } from "@/lib/models/Restaurant";
import { Menu } from "@/lib/models/Menu";
import { Order } from "@/lib/models/Order";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

function checkAdmin(request: NextRequest) {
  const token =
    request.cookies.get(ADMIN_COOKIE_NAME)?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const admin = checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const restaurant = await Restaurant.findById(id).select("-password");
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const menuCount = await Menu.countDocuments({ restaurantId: restaurant._id });
    const orderCount = await Order.countDocuments({ restaurantId: restaurant._id });

    return NextResponse.json({ ok: true, restaurant, stats: { menuCount, orderCount } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const admin = checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    if (body.name !== undefined) restaurant.name = body.name.trim();
    if (body.slug !== undefined) {
      const cleanSlug = body.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      const existing = await Restaurant.findOne({ slug: cleanSlug, _id: { $ne: restaurant._id } });
      if (existing) {
        return NextResponse.json({ error: "Slug is already used by another restaurant" }, { status: 409 });
      }
      restaurant.slug = cleanSlug;
    }
    if (body.description !== undefined) restaurant.description = body.description;
    if (body.detail !== undefined) restaurant.detail = body.detail;
    if (body.logoUrl !== undefined) restaurant.logoUrl = body.logoUrl;
    if (body.expiredAt !== undefined) restaurant.expiredAt = body.expiredAt ? new Date(body.expiredAt) : null;
    if (body.status !== undefined) restaurant.status = body.status;
    if (body.telegramChat !== undefined) restaurant.telegramChat = body.telegramChat;
    if (body.config !== undefined) restaurant.config = body.config;

    await restaurant.save();

    return NextResponse.json({ ok: true, restaurant });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const admin = checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Reset restaurant password to null: allows owner onboarding again
    if (body.action === "reset-password") {
      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
        return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
      }

      restaurant.password = null;
      await restaurant.save();

      return NextResponse.json({
        ok: true,
        message: `Password for "${restaurant.name}" has been reset. Owner can now onboard with a new password.`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const admin = checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const restaurant = await Restaurant.findByIdAndDelete(id);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Clean up menus and orders associated with this restaurant
    await Menu.deleteMany({ restaurantId: restaurant._id });
    await Order.deleteMany({ restaurantId: restaurant._id });

    return NextResponse.json({ ok: true, message: "Restaurant and associated data deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
