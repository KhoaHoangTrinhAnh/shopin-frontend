import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-imgix.headout.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ijgcycxbnduntvguabis.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Cache duration for optimized images (in seconds)
    minimumCacheTTL: 60,
    // Add image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },
  // Optimize compilation
  swcMinify: true,
  // Reduce build time
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select'],
  },
};

export default nextConfig;
