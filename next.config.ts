import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // امکان بیلد پروداکشن در پوشه جدا (NEXT_DIST_DIR) بدون تداخل با سرور dev
  distDir: process.env.NEXT_DIST_DIR || ".next",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // حذف وابستگی‌های سنگین unused از bundle نهایی
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
