import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16's Cache Components model. This is how PPR is enabled now —
  // `experimental.ppr`, `dynamicIO` and `useCache` were removed in v16.
  cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "logos-world.net" },
    ],
  },
  serverExternalPackages: ["mongoose", "bcryptjs", "cloudinary", "nodemailer"],
  experimental: {
    // Required for `forbidden()` and `unauthorized()`, which the role guards
    // in lib/auth/guards.ts throw. Without it they fail silently.
    authInterrupts: true,
  },
};

export default nextConfig;
