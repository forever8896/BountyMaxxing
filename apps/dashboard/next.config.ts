import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow server-side fetches to the local keeper process
  // (no special rewrites needed — API routes act as the proxy)
};

export default nextConfig;
