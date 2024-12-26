/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  // Enable proper routing and auth handling
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,
  compiler: {
    removeConsole: false,
  },
};

module.exports = nextConfig;
