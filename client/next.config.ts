import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: 'http://localhost:5000',
  },
  // Remove rewrites to avoid conflicts - use direct API calls instead
};
