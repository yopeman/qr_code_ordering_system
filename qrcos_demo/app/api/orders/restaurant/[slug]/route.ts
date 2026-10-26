import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Restaurant } from "@/lib/models/Restaurant";
import { Order } from "@/lib/models/Order";

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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query: Record<string, any> = { restaurantId: restaurant._id };
    if (status && status !== "all") {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(100);

    return NextResponse.json({
      ok: true,
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        logoUrl: restaurant.logoUrl,
      },
      orders,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
