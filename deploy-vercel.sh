#!/bin/bash
# Quick Vercel Deployment Script
# Run this script to deploy SmartCart to Vercel

echo "🚀 SmartCart Vercel Deployment Script"
echo "======================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Logging in to Vercel..."
    vercel login
fi

# Build locally to check for errors
echo "🔨 Building project..."
cd client
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi
cd ..

# Deploy
echo "📤 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app should be live at: https://smartcart-akedo.vercel.app"

