/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
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
    // Disable static optimization for all pages to avoid prerendering issues
    output: 'standalone',
    // When Next.js is inside a monorepo/workspace, set tracing root to repository root
    outputFileTracingRoot: path.join(__dirname, '..'),
}

module.exports = nextConfig
