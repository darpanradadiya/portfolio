import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Cross-document view transitions on route change. The animation itself is
    // defined in globals.css behind a prefers-reduced-motion guard.
    viewTransition: true,
  },
  poweredByHeader: false,
  async redirects() {
    return [
      // /code was the coding-profile page. Every figure on it came off the site,
      // which left two outbound links and no reason for a route. The links moved
      // to the foot of /about. Permanent, because the page is not coming back.
      { source: '/code', destination: '/about', permanent: true },
    ];
  },
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
