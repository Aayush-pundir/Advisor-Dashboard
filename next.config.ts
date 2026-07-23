import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    serverActions: {
      // Asset kit uploads can be videos — raise the default 1MB cap.
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
