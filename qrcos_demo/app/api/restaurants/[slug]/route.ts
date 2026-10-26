import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Restaurant } from "@/lib/models/Restaurant";
import { verifyRestaurantToken, RESTAURANT_COOKIE_NAME } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;
    const cleanSlug = slug.toLowerCase();

    const restaurant = await Restaurant.findOne({ slug: cleanSlug }).select("-password");
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, restaurant });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;
    const cleanSlug = slug.toLowerCase();

    const token =
      request.cookies.get(RESTAURANT_COOKIE_NAME)?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyRestaurantToken(token);
    if (!payload || payload.slug !== cleanSlug) {
      return NextResponse.json({ error: "Forbidden: session mismatch" }, { status: 403 });
    }

    const restaurant = await Restaurant.findOne({ slug: cleanSlug });
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const body = await request.json();

    // Owner can manage details, description, logo, config, telegramChat
    // But CANNOT update expiredAt or status (per specification)
    if (body.name !== undefined) restaurant.name = body.name.trim();
    if (body.description !== undefined) restaurant.description = body.description;
    if (body.detail !== undefined) restaurant.detail = body.detail;
    if (body.logoUrl !== undefined) restaurant.logoUrl = body.logoUrl;
    if (body.telegramChat !== undefined) restaurant.telegramChat = body.telegramChat;
    if (body.config !== undefined) restaurant.config = body.config;

    await restaurant.save();

    return NextResponse.json({ ok: true, restaurant });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
