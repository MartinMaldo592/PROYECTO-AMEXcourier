import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-dcb2789e802043768fa5c6c649f9c405.r2.dev",
      },
    ],
  },
};

export default nextConfig;
