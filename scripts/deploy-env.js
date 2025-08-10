#!/usr/bin/env node

/**
 * Deploy Environment Variables to Vercel
 * Reads .env.local and creates vercel env add commands
 */

const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

console.log('🚀 Environment Variables for Vercel Deployment\n');
console.log('Copy these values to Vercel Dashboard:\n');
console.log('='.repeat(60));

envLines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    console.log(`${key}: ${value}`);
  }
});

console.log('='.repeat(60));
console.log('\n📋 Instructions:');
console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('2. Add each variable above');
console.log('3. Set Environment: Production, Preview, Development');
console.log('4. Redeploy the application');