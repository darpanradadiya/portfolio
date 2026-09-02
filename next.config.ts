import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  typescript: {
    // Type errors must fail the build. CI also runs `typecheck` separately.
    ignoreBuildErrors: false,
  },
  eslint: {
    // Lint is run explicitly in CI; keep it enforced at build time too.
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
