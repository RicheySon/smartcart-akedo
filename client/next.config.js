/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disable static page generation to prevent build errors
    output: 'standalone',
    // For Vercel deployment, API routes are handled by serverless functions in /api
    // For local development, proxy to Express backend
    async rewrites() {
        // Only proxy in development
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    source: '/api/:path*',
                    destination: 'http://localhost:3001/api/:path*',
                },
            ]
        }
        // In production, API routes are handled by Vercel serverless functions
        return []
    },
}

module.exports = nextConfig
