import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle under .next/standalone so the
  // production Docker image only needs that directory + static assets.
  output: "standalone",
};

export default nextConfig;
