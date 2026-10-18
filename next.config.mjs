/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL ||
      (process.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:5000')
    if (!backendUrl) {
      throw new Error('BACKEND_INTERNAL_URL must be configured for production builds.')
    }
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig

