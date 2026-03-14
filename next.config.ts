import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 同じ Wi‑Fi の他端末（例: 192.168.3.192）から開発サーバーにアクセスするために必要
  allowedDevOrigins: ["192.168.3.192", "localhost"],
};

export default nextConfig;
