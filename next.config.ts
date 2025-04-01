import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix for @prisma/client module resolution
      config.resolve.alias = {
        ...config.resolve.alias,
        '.prisma/client': path.join(__dirname, 'node_modules/.prisma/client'),
        '@prisma/client': path.join(__dirname, 'node_modules/@prisma/client'),
        '@prisma/client/edge': path.join(__dirname, 'node_modules/@prisma/client/edge'),
      };
    }
    return config;
  },
  // Transpile Prisma packages
  transpilePackages: ['@prisma/client', '@prisma/client/edge']
};

export default nextConfig;
