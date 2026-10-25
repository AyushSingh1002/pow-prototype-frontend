/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    agentUpgrade: 'security',
  },
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

if (process.env.NODE_ENV === 'production') {
  if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE !== 'false') {
    throw new Error('NEXT_PUBLIC_ENABLE_DEMO_MODE=false is required for production builds.')
  }
  for (const key of [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_PRIVACY_POLICY_URL',
    'NEXT_PUBLIC_CONTACT_DATA_RETENTION_DAYS',
  ]) {
    if (!process.env[key] || /^(replace-me|your-|example|placeholder|changeme)/i.test(process.env[key])) {
      throw new Error(`${key} must be configured with a real value for production builds.`)
    }
  }
}

export default nextConfig
