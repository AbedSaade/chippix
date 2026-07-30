import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cbu01.alicdn.com" },
      { protocol: "https", hostname: "cms2.devback.website" },
      { protocol: "https", hostname: "chibox.app" },
    ],
  },
};

export default nextConfig;
