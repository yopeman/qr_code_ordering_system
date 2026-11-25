import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminToken,
  verifyRestaurantToken,
  ADMIN_COOKIE_NAME,
  RESTAURANT_COOKIE_NAME,
} from "@/lib/auth";
import { sendTelegramTestMessage } from "@/lib/telegram";

function isAuthorized(request: NextRequest): boolean {
  const adminToken =
    request.cookies.get(ADMIN_COOKIE_NAME)?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  if (adminToken && verifyAdminToken(adminToken)) {
    return true;
  }

  const restToken =
    request.cookies.get(RESTAURANT_COOKIE_NAME)?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  if (restToken && verifyRestaurantToken(restToken)) {
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { chatId, restaurantName } = body || {};

    const result = await sendTelegramTestMessage(
      typeof chatId === "string" ? chatId : "",
      typeof restaurantName === "string" ? restaurantName : undefined
    );

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "Test message sent! Check your Telegram chat/channel.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to test Telegram connection" },
      { status: 500 }
    );
  }
}
