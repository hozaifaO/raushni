/** @type {import('next').NextConfig} */
const nextPwa = require('next-pwa');
const pwaPlugin = (nextPwa.default || nextPwa)({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  turbopack: {},

  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'api.raushni.com' },
      { protocol: 'https', hostname: 'cms.raushni.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async rewrites() {
    const apiUrl = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';
    const cmsUrl = process.env.CMS_INTERNAL_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://strapi:1337';

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: '/cms/api/:path*',
        destination: `${cmsUrl}/api/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons', 'date-fns'],
  },

  // next-pwa v2 injects a webpack hook; keep only the supported key.
  webpack: pwaPlugin.webpack,
};

module.exports = nextConfig;
