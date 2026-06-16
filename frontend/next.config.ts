import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone", // Removed for Firebase Web Frameworks compatibility
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
