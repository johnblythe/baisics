/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    }
  },
  images: {
    domains: ['images.unsplash.com'],
  },
}

module.exports = nextConfig 