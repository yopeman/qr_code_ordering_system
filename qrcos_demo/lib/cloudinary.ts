import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export async function uploadMedia(fileDataUriOrUrl: string, folder = "qrcos"): Promise<string> {
  if (isConfigured) {
    try {
      const result = await cloudinary.uploader.upload(fileDataUriOrUrl, {
        folder,
        resource_type: "auto",
      });
      return result.secure_url;
    } catch (err) {
      console.warn("Cloudinary upload failed, using direct payload fallback:", err);
      return fileDataUriOrUrl;
    }
  }

  // Graceful fallback: return the image as-is (e.g. data URI, Unsplash URL, or existing link)
  return fileDataUriOrUrl;
}
