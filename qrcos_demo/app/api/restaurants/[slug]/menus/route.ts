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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;
    const cleanSlug = slug.toLowerCase();

    const restaurant = await Restaurant.findOne({ slug: cleanSlug });
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Check if caller is authorized owner or admin
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const restToken = request.cookies.get(RESTAURANT_COOKIE_NAME)?.value;

    const isAdmin = adminToken ? Boolean(verifyAdminToken(adminToken)) : false;
    const isOwner = restToken ? verifyRestaurantToken(restToken)?.slug === cleanSlug : false;

    const filter: Record<string, any> = { restaurantId: restaurant._id };
    if (!isAdmin && !isOwner) {
      // Diners only see public menu items
      filter.visibility = "public";
    }

    const menus = await Menu.find(filter).sort({ category: 1, name: 1 });
    return NextResponse.json({ ok: true, menus, restaurantName: restaurant.name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
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

    const body = await request.json();
    const { category, name, description, price, detail, imgUrls, visibility } = body;

    if (!category || !name || price === undefined) {
      return NextResponse.json(
        { error: "Category, Name, and Price are required" },
        { status: 400 }
      );
    }

    const menu = await Menu.create({
      restaurantId: restaurant._id,
      category: category.trim(),
      name: name.trim(),
      description: description || "",
      price: Number(price) || 0,
      detail: Array.isArray(detail) ? detail : [],
      imgUrls: Array.isArray(imgUrls) ? imgUrls : [],
      visibility: visibility === "private" ? "private" : "public",
    });

    return NextResponse.json({ ok: true, menu }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
