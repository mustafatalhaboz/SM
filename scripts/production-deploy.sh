#!/bin/bash

# SuperM Production Deployment Script

set -e  # Exit on any error

echo "🚀 Starting SuperM Production Deployment..."
echo "=================================================="

# 1. Environment Check
echo "📋 Step 1: Environment Check"
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    exit 1
fi

# Check if we're on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
    echo "⚠️  Warning: You're not on main branch (current: $BRANCH)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# 2. Build Test
echo "📋 Step 2: Production Build Test"
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors before deployment."
    exit 1
fi

# 3. Environment Variables Check
echo "📋 Step 3: Environment Variables Check"
node scripts/check-env.js

# 4. Git Status Check
echo "📋 Step 4: Git Status Check"
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes"
    git status --short
    read -p "Continue with uncommitted changes? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# 5. Deploy to Vercel
echo "📋 Step 5: Deploying to Vercel"
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Check your application at: https://superm-q75i5k4k0-rng-s-team.vercel.app"
    
    # 6. Post-deployment verification
    echo "📋 Step 6: Post-deployment verification"
    echo "Please manually verify:"
    echo "  - ✓ Projects load correctly"
    echo "  - ✓ Task creation works"
    echo "  - ✓ Real-time updates function"
    echo "  - ✓ No console errors"
else
    echo "❌ Deployment failed!"
    exit 1
fi

echo "=================================================="
echo "🎉 Production deployment complete!"