#!/bin/bash

# Add all Firebase environment variables to Vercel

echo "🚀 Adding Firebase Environment Variables to Vercel..."

# Read .env.local and add each variable
while IFS= read -r line; do
  # Skip empty lines and comments
  if [[ -z "$line" || "$line" == \#* ]]; then
    continue
  fi
  
  # Extract key and value
  key=$(echo "$line" | cut -d'=' -f1)
  value=$(echo "$line" | cut -d'=' -f2-)
  
  echo "Adding $key..."
  echo "$value" | vercel env add "$key" production
  echo "$value" | vercel env add "$key" preview  
  echo "$value" | vercel env add "$key" development
  
done < .env.local

echo "✅ All environment variables added to Vercel!"
echo "🔄 Triggering new deployment..."
vercel --prod