import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so a parent lockfile doesn't get mistaken for it.
  turbopack: {
    root: import.meta.dirname,
  },
  // No next/image usage yet; add remotePatterns here if you start using it.
};

export default nextConfig;