import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export optimized for Cloudflare Workers & Cloudflare Pages edge distribution
  output: "export",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
