import { v2 as cloudinary } from "cloudinary";

const cloudinaryUrl = process.env.CLOUDINARY_URL;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(cloudinaryUrl || (cloudName && apiKey && apiSecret));

if (isConfigured) {
  if (cloudinaryUrl) {
    cloudinary.config({
      cloudinary_url: cloudinaryUrl,
      secure: true,
    });
  } else {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }
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
      console.warn("Cloudinary upload failed, falling back to original payload:", err);
      return fileDataUriOrUrl;
    }
  }

  // Graceful fallback: return the image data as-is if no Cloudinary keys
  return fileDataUriOrUrl;
}
