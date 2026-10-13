/**
 * Photos up to 25 MB are accepted from the user, but the Cloudinary plan caps a
 * single image at 10 MB and 25 megapixels. Anything over either limit is
 * scaled down and re-encoded in the browser first, so a phone or camera
 * original uploads instead of being bounced by the gateway.
 */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "25 MB";

/** Kept a little under the provider's limits to leave headroom. */
const PROVIDER_MAX_BYTES = 9.5 * 1024 * 1024;
const PROVIDER_MAX_PIXELS = 24_000_000;

export async function prepareImageForUpload(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // The browser cannot decode it (an unusual AVIF, say). Send it as-is and
    // let Cloudinary decide.
    return file;
  }

  try {
    const pixels = bitmap.width * bitmap.height;
    if (file.size <= PROVIDER_MAX_BYTES && pixels <= PROVIDER_MAX_PIXELS) return file;

    // PNGs may be transparent, so they become WebP; everything else JPEG.
    const type = file.type === "image/png" ? "image/webp" : "image/jpeg";
    const extension = type === "image/webp" ? "webp" : "jpg";
    let scale = Math.min(1, Math.sqrt(PROVIDER_MAX_PIXELS / pixels));

    for (let attempt = 0; attempt < 6; attempt++) {
      const quality = attempt === 0 ? 0.9 : 0.82;
      const blob = await encode(bitmap, scale, type, quality);
      if (blob && blob.size <= PROVIDER_MAX_BYTES) {
        const name = file.name.replace(/\.[^.]+$/, "") + `.${extension}`;
        return new File([blob], name, { type, lastModified: file.lastModified });
      }
      scale *= 0.8;
    }
    return file;
  } finally {
    bitmap.close();
  }
}

function encode(
  bitmap: ImageBitmap,
  scale: number,
  type: string,
  quality: number,
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return Promise.resolve(null);
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}
