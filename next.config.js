/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    // Ignore ESLint errors during the build process
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig;
