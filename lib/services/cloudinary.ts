import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";

let configured = false;

function client() {
  if (!configured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export type UploadFolder = "hotels" | "rooms" | "kyc" | "avatars";

/**
 * Formats Cloudinary will accept, per folder. This is signed into the request,
 * so a browser cannot widen it by editing the form data — the `accept`
 * attribute on the file input is a convenience, this is the actual rule.
 *
 * Verification documents are photos of a document, never a PDF: the image
 * endpoint happily ingests PDFs otherwise, and the reviewers' gallery cannot
 * display one.
 */
const ALLOWED_FORMATS: Record<UploadFolder, string> = {
  hotels: "jpg,jpeg,png,webp,avif",
  rooms: "jpg,jpeg,png,webp,avif",
  avatars: "jpg,jpeg,png,webp,avif",
  kyc: "jpg,jpeg,png,webp",
};

export interface SignedUpload {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadUrl: string;
  /**
   * Every signed parameter. The upload must forward these verbatim — dropping
   * or changing one invalidates the signature.
   */
  params: Record<string, string>;
}

/**
 * Produces credentials for a direct browser → Cloudinary upload. The file never
 * touches our server, and the secret never leaves it.
 */
export function signUpload(folder: UploadFolder, scopeId: string): SignedUpload {
  const timestamp = Math.round(Date.now() / 1000);
  const fullFolder = `${env.CLOUDINARY_FOLDER}/${folder}/${scopeId}`;

  const params: Record<string, string> = {
    timestamp: String(timestamp),
    folder: fullFolder,
    allowed_formats: ALLOWED_FORMATS[folder],
  };

  const signature = client().utils.api_sign_request(params, env.CLOUDINARY_API_SECRET);

  return {
    signature,
    timestamp,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    folder: fullFolder,
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    params,
  };
}

/** Removes an asset. Failures are logged, not thrown — a stale asset is not worth a 500. */
export async function deleteAsset(publicId: string): Promise<boolean> {
  if (!publicId || publicId.startsWith("seed/")) return false;
  try {
    const result = await client().uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("[cloudinary] delete failed for", publicId, error);
    return false;
  }
}

/** Re-exported so existing server callers keep their import path. */
export { cdn } from "@/lib/utils/cdn";
