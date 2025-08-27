#!/bin/bash

# BetMe App Deployment Script
# This script helps you deploy your app to Vercel

echo "🚀 BetMe App Deployment Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Please create one from env.example:"
    echo "cp env.example .env"
    echo "Then edit it with your Supabase credentials"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
else
    echo "✅ Vercel CLI already installed"
fi

# Build the app
echo "🔨 Building the app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors and try again"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "Note: You'll need to configure your project on first run"
echo ""

vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo "Your app should now be live at the URL shown above"
echo ""
echo "Next steps:"
echo "1. Test your live app"
echo "2. Share the URL with friends"
echo "3. Monitor for any issues"
echo ""
echo "Happy betting! 🎯💰"
