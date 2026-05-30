import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow reading local data/ JSON files in API routes
  serverExternalPackages: ["yahoo-finance2"],
};

export default nextConfig;
