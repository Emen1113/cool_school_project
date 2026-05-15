import sharp from "sharp";
import { ALLOWED_IMAGE_TYPES, MAX_AVATAR_SIZE_BYTES } from "@/lib/constants";

export async function processAvatarImage(buffer: Buffer): Promise<{
  buffer: Buffer;
  contentType: string;
  extension: string;
}> {
  const processed = await sharp(buffer)
    .resize(512, 512, { fit: "cover", position: "centre" })
    .webp({ quality: 85 })
    .toBuffer();

  return {
    buffer: processed,
    contentType: "image/webp",
    extension: "webp",
  };
}

export function validateImageFile(
  file: File
): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: "Only JPEG, PNG, WebP, or GIF allowed" };
  }
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return { valid: false, error: "Image must be under 2MB" };
  }
  return { valid: true };
}
