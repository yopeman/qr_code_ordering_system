import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Admin } from "@/lib/models/Admin";
import {
  hashPassword,
  comparePassword,
  signAdminToken,
  verifyAdminToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const token =
      request.cookies.get(ADMIN_COOKIE_NAME)?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = verifyAdminToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const admin = await Admin.findById(payload.adminId).select("-password");
    if (!admin || admin.status !== "active") {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, admin });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { action } = body;

    // Action: Check Email status
    if (action === "check") {
      const email = body.email?.trim().toLowerCase();
      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      const admin = await Admin.findOne({ email });
      if (!admin) {
        return NextResponse.json({ exists: false });
      }

      return NextResponse.json({
        exists: true,
        needsPasswordSetup: admin.password === null || admin.password === "",
      });
    }

    // Action: Initial Password Setup (when password === null)
    if (action === "setup") {
      const email = body.email?.trim().toLowerCase();
      const newPassword = body.newPassword;

      if (!email || !newPassword || newPassword.length < 4) {
        return NextResponse.json(
          { error: "Valid email and password (min 4 chars) required" },
          { status: 400 }
        );
      }

      const admin = await Admin.findOne({ email });
      if (!admin) {
        return NextResponse.json({ error: "Admin not found" }, { status: 404 });
      }

      if (admin.password !== null && admin.password !== "") {
        return NextResponse.json(
          { error: "Password has already been set. Please log in." },
          { status: 400 }
        );
      }

      admin.password = await hashPassword(newPassword);
      await admin.save();

      const token = signAdminToken(admin);
      const res = NextResponse.json({
        ok: true,
        token,
        admin: { _id: admin._id, email: admin.email, status: admin.status },
      });

      res.cookies.set(ADMIN_COOKIE_NAME, token, {
        path: "/",
        httpOnly: false, // Accessible to client for localStorage & headers
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    // Action: Login
    if (action === "login") {
      const email = body.email?.trim().toLowerCase();
      const password = body.password;

      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
      }

      const admin = await Admin.findOne({ email });
      if (!admin) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      if (admin.status !== "active") {
        return NextResponse.json({ error: "Account is inactive" }, { status: 403 });
      }

      if (admin.password === null || admin.password === "") {
        return NextResponse.json(
          { error: "Initial password setup required", needsPasswordSetup: true },
          { status: 400 }
        );
      }

      const isMatch = await comparePassword(password, admin.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      const token = signAdminToken(admin);
      const res = NextResponse.json({
        ok: true,
        token,
        admin: { _id: admin._id, email: admin.email, status: admin.status },
      });

      res.cookies.set(ADMIN_COOKIE_NAME, token, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    // Action: Change Password (Authenticated modal)
    if (action === "change-password") {
      const token =
        request.cookies.get(ADMIN_COOKIE_NAME)?.value ||
        request.headers.get("authorization")?.replace("Bearer ", "");

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const payload = verifyAdminToken(token);
      if (!payload) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword || newPassword.length < 4) {
        return NextResponse.json(
          { error: "Current and new password (min 4 chars) required" },
          { status: 400 }
        );
      }

      const admin = await Admin.findById(payload.adminId);
      if (!admin) {
        return NextResponse.json({ error: "Admin not found" }, { status: 404 });
      }

      if (admin.password) {
        const isMatch = await comparePassword(currentPassword, admin.password);
        if (!isMatch) {
          return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }
      }

      admin.password = await hashPassword(newPassword);
      await admin.save();

      return NextResponse.json({ ok: true, message: "Password updated successfully" });
    }

    // Action: Logout
    if (action === "logout") {
      const res = NextResponse.json({ ok: true });
      res.cookies.delete(ADMIN_COOKIE_NAME);
      return res;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
