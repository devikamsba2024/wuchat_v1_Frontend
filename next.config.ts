import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  generateBuildId: async () => {
    return 'wuchat-build-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  },
  // Disable caching in development to help with debugging
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
