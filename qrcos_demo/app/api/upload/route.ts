import { NextRequest, NextResponse } from "next/server";
import { uploadMedia } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const { image, folder } = await request.json();
      if (!image) {
        return NextResponse.json({ error: "Image data is required" }, { status: 400 });
      }
      const url = await uploadMedia(image, folder || "qrcos");
      return NextResponse.json({ ok: true, url });
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mime = file.type || "image/jpeg";
      const base64 = `data:${mime};base64,${buffer.toString("base64")}`;

      const url = await uploadMedia(base64, "qrcos");
      return NextResponse.json({ ok: true, url });
    }

    return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
