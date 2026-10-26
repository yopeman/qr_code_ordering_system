import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Restaurant } from "@/lib/models/Restaurant";
import { Menu } from "@/lib/models/Menu";
import {
  verifyRestaurantToken,
  verifyAdminToken,
  RESTAURANT_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    await connectDB();
    const { slug, id } = await params;
    const cleanSlug = slug.toLowerCase();

    const token =
      request.cookies.get(RESTAURANT_COOKIE_NAME)?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    const isAdmin = adminToken ? Boolean(verifyAdminToken(adminToken)) : false;
    const isOwner = token ? verifyRestaurantToken(token)?.slug === cleanSlug : false;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await Restaurant.findOne({ slug: cleanSlug });
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const menu = await Menu.findOne({ _id: id, restaurantId: restaurant._id });
    if (!menu) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    const body = await request.json();
    if (body.category !== undefined) menu.category = body.category.trim();
    if (body.name !== undefined) menu.name = body.name.trim();
    if (body.description !== undefined) menu.description = body.description;
    if (body.price !== undefined) menu.price = Number(body.price);
    if (body.detail !== undefined) menu.detail = body.detail;
    if (body.imgUrls !== undefined) menu.imgUrls = body.imgUrls;
    if (body.visibility !== undefined) menu.visibility = body.visibility;

    await menu.save();

    return NextResponse.json({ ok: true, menu });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    await connectDB();
    const { slug, id } = await params;
    const cleanSlug = slug.toLowerCase();

    const token =
      request.cookies.get(RESTAURANT_COOKIE_NAME)?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    const isAdmin = adminToken ? Boolean(verifyAdminToken(adminToken)) : false;
    const isOwner = token ? verifyRestaurantToken(token)?.slug === cleanSlug : false;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await Restaurant.findOne({ slug: cleanSlug });
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const menu = await Menu.findOneAndDelete({ _id: id, restaurantId: restaurant._id });
    if (!menu) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Menu item deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
