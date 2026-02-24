import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Redirect /dev playground routes to home in production (inaccessible but harmless)
  async redirects() {
    if (process.env.NODE_ENV === "production") {
      return [
        {
          source: "/dev/:path*",
          destination: "/",
          permanent: false,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
