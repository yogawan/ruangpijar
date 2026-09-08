// app/api/upload/route.ts
import { getCloudinary } from "@/lib/cloudinary";
import { handleApiError, jsonError } from "@/lib/http";
import { getCurrentUserId } from "@/lib/session";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// Only avatar uploads today, so this is scoped to that: one Cloudinary
// asset per user (public_id keyed on their id, overwritten on re-upload)
// rather than a generic multi-purpose upload API.
export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return jsonError("Missing file", 400);
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return jsonError("Unsupported file type", 400);
  }

  if (file.size > MAX_FILE_BYTES) {
    return jsonError("File too large (max 5MB)", 400);
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await getCloudinary().uploader.upload(dataUri, {
      folder: "ruangpijar/avatars",
      public_id: userId,
      overwrite: true,
      resource_type: "image",
    });

    return Response.json({ url: result.secure_url });
  } catch (error) {
    return handleApiError(error);
  }
}
