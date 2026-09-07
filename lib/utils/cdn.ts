/**
 * Rewrites a Cloudinary delivery URL with sizing and automatic format/quality.
 * Non-Cloudinary URLs (seeded Unsplash images) pass through untouched.
 *
 * Kept out of `lib/services/cloudinary.ts` deliberately: this is a pure string
 * transform that client components need, and importing it from there would drag
 * the Node-only Cloudinary SDK into the browser bundle.
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
