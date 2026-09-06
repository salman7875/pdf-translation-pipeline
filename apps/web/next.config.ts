import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "in.pinterest.com",
        port: "",
        pathname: "*",
      },
    ],
  },
};

export default nextConfig;
