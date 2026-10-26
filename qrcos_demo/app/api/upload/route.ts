import { NextRequest, NextResponse } from "next/server";
import { uploadMedia } from "@/lib/cloudinary";

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5242880", 10); // default 5MB

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const { image, folder } = await request.json();
      if (!image) {
        return NextResponse.json({ error: "Image data is required" }, { status: 400 });
      }

      // Check estimated base64 size: length * 0.75
      const approxBytes = image.length * 0.75;
      if (approxBytes > MAX_FILE_SIZE) {
        const mb = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(1);
        return NextResponse.json(
          { error: `File size exceeds the limit of ${mb}MB` },
          { status: 400 }
        );
      }

      const url = await uploadMedia(image, folder || "qrcos");
      return NextResponse.json({ ok: true, url });
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const filesFromList = formData.getAll("files") as File[];
      const filesFromSingle = formData.getAll("file") as File[];
      const allFiles = (filesFromList.length > 0 ? filesFromList : filesFromSingle).filter(
        (f): f is File => f instanceof File && f.size > 0
      );

      if (allFiles.length === 0) {
        return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
      }

      const folder = (formData.get("folder") as string) || "qrcos/dishes";
      const mb = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(1);

      // Validate all files first
      for (const file of allFiles) {
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed ${mb}MB` },
            { status: 400 }
          );
        }
      }

      // Upload all files concurrently
      const uploadedUrls = await Promise.all(
        allFiles.map(async (file) => {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const mime = file.type || "image/jpeg";
          const base64 = `data:${mime};base64,${buffer.toString("base64")}`;
          return await uploadMedia(base64, folder);
        })
      );

      return NextResponse.json({
        ok: true,
        url: uploadedUrls[0],
        urls: uploadedUrls,
      });
    }

    return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
  } catch (err: any) {
    console.error("Upload handler error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
