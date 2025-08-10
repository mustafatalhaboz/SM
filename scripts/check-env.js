#!/usr/bin/env node

/**
 * Environment Variables Check Script
 * Checks if all required Firebase environment variables are set
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
];

console.log('🔥 Firebase Environment Variables Check\n');

let allPresent = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const isPresent = !!value;
  const displayValue = isPresent ? `${value.substring(0, 10)}...` : 'MISSING';
  
  console.log(`${isPresent ? '✅' : '❌'} ${varName}: ${displayValue}`);
  
  if (!isPresent) {
    allPresent = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPresent) {
  console.log('✅ All Firebase environment variables are present!');
  process.exit(0);
} else {
  console.log('❌ Some Firebase environment variables are missing!');
  console.log('\nTo fix this:');
  console.log('1. Copy values from .env.local');
  console.log('2. Add them to Vercel dashboard or using vercel env add');
  process.exit(1);
}