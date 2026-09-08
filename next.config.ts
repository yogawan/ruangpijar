import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Google-account sign-ins store their Google profile photo as
      // avatarUrl (see auth.ts's jwt callback) — served from lh[1-6],
      // hence the wildcard rather than pinning to lh3.
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
