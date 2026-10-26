import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  experimental: {
    // Media upload max 50MB (+ multipart overhead). Default is 1MB.
    serverActions: {
      bodySizeLimit: "51mb",
    },
    // Upload posts to /new, which runs through proxy; default buffer is 10MB.
    proxyClientMaxBodySize: "51mb",
  },
};

export default nextConfig;
