#!/bin/bash

# Fix Vercel Environment Variables - Remove hidden characters

echo "🔧 Fixing Vercel Environment Variables..."

# Clean environment variables (no newlines)
printf "AIzaSyBvczI3NVtBEBj1N388crfIFbSwVJJZiEA" | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY_CLEAN production
printf "sm07-1540b.firebaseapp.com" | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_CLEAN production  
printf "sm07-1540b" | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID_CLEAN production
printf "sm07-1540b.firebasestorage.app" | vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_CLEAN production
printf "685817011823" | vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_CLEAN production
printf "1:685817011823:web:46a7bc11e43bdf1a9ff79a" | vercel env add NEXT_PUBLIC_FIREBASE_APP_ID_CLEAN production
printf "G-TKHFHLTE33" | vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID_CLEAN production

echo "✅ Clean environment variables added!"
echo "🔄 Please remove old variables from Vercel dashboard and rename these CLEAN versions"