/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [];
  },
  server: {
    port: 3001
  }
}

module.exports = nextConfig 