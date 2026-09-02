import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Required for AWS Amplify SSR and container-based deployments
  output: "standalone",
};

export default nextConfig;
