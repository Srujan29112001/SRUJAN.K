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
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // pdfjs-dist references the native 'canvas' package, which is an optional
    // dependency that doesn't install on Vercel's build image. We only use
    // pdfjs for TEXT extraction (never page rendering), so stub it out.
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
