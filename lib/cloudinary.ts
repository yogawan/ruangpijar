// lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

let configured = false;

// Lazily configured (and cached) rather than at module load: importing this
// file must not throw for code paths that never actually upload anything.
export function getCloudinary() {
  if (!configured) {
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;

    if (!cloud_name || !api_key || !api_secret) {
      throw new Error(
        "Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET environment variable",
      );
    }

    cloudinary.config({ cloud_name, api_key, api_secret });
    configured = true;
  }

  return cloudinary;
}
