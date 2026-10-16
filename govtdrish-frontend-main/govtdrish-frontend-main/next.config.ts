import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep trailing slashes intact: Django's canonical URLs end with "/" and the
  // /api bridge must forward them unchanged (Next's auto-308 would loop with
  // Django's APPEND_SLASH redirect).
  skipTrailingSlashRedirect: true,
  // Pin the workspace root so a parent lockfile doesn't get mistaken for it.
  turbopack: {
    root: import.meta.dirname,
  },
  // No next/image usage yet; add remotePatterns here if you start using it.
};

export default nextConfig;