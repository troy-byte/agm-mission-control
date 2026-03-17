/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/agm-mission-control',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
