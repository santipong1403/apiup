import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // ข้ามข้อผิดพลาด ESLint ระหว่าง Build
  },
};
export default nextConfig;
