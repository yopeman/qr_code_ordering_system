import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Restaurant } from "@/lib/models/Restaurant";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

function checkAdmin(request: NextRequest) {
  const token =
    request.cookies.get(ADMIN_COOKIE_NAME)?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const admin = checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurants = await Restaurant.find().sort({ createdAt: -1 }).select("-password");
    return NextResponse.json({ ok: true, restaurants });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const admin = checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, detail, logoUrl, expiredAt, status, telegramChat, config } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and Slug are required" }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const existing = await Restaurant.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json({ error: "A restaurant with this slug already exists" }, { status: 409 });
    }

    const restaurant = await Restaurant.create({
      name: name.trim(),
      slug: cleanSlug,
      password: null, // Null initially as per spec, to prompt owner onboarding
      description: description || "",
      detail: Array.isArray(detail) ? detail : [],
      logoUrl: logoUrl || "",
      expiredAt: expiredAt ? new Date(expiredAt) : null,
      status: status || "active",
      telegramChat: telegramChat || "",
      config: Array.isArray(config) ? config : [],
    });

    return NextResponse.json({ ok: true, restaurant }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
