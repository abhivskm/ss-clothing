import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Required in Next.js 16: the image qualities the optimizer may produce.
    qualities: [75],
    // When product photos move to Cloudinary (see README), allow that host here:
    // remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  turbopack: {
    // Pin the project root (a stray package-lock.json on the Desktop confuses root detection)
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
