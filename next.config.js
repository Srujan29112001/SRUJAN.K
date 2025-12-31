/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true,
  },
  transpilePackages: ['three'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
