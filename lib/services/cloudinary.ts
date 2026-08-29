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

export interface SignedUpload {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadUrl: string;
}

/**
 * Produces credentials for a direct browser → Cloudinary upload. The file never
 * touches our server, and the secret never leaves it.
 */
export function signUpload(folder: UploadFolder, scopeId: string): SignedUpload {
  const timestamp = Math.round(Date.now() / 1000);
  const fullFolder = `${env.CLOUDINARY_FOLDER}/${folder}/${scopeId}`;

  const signature = client().utils.api_sign_request(
    { timestamp, folder: fullFolder },
    env.CLOUDINARY_API_SECRET,
  );

  return {
    signature,
    timestamp,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    folder: fullFolder,
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
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

/**
 * Rewrites a Cloudinary delivery URL with sizing and automatic format/quality.
 * Non-Cloudinary URLs (seeded Unsplash images) pass through untouched.
 */
export function cdn(url: string, width: number, height?: number): string {
  if (!url.includes("/res.cloudinary.com/") || !url.includes("/upload/")) return url;
  const transform = [
    `w_${width}`,
    height ? `h_${height}` : null,
    height ? "c_fill" : "c_limit",
    "f_auto",
    "q_auto",
  ]
    .filter(Boolean)
    .join(",");
  return url.replace("/upload/", `/upload/${transform}/`);
}
