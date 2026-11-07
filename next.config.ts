import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "cloudflare:workers": path.resolve(process.cwd(), "lib/cloudflare-shim.ts"),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "cloudflare:workers": "./lib/cloudflare-shim.ts",
    },
  },
};

export default nextConfig;
