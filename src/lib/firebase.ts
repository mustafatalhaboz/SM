import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { logger } from './logger';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
};

// Configuration validation
if (process.env.NODE_ENV === 'development') {
  logger.debug('Firebase configuration loaded', {
    operation: 'firebase-init',
    data: {
      projectId: firebaseConfig.projectId,
      hasApiKey: !!firebaseConfig.apiKey,
      hasAuthDomain: !!firebaseConfig.authDomain
    }
  });
  
  if (!firebaseConfig.projectId) {
    logger.error('Firebase projectId is undefined - check environment variables', {
      operation: 'firebase-init',
      error: new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing')
    });
  }
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Firebase initialization completed
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  logger.debug('Firebase initialized in browser', { operation: 'firebase-init' });
}

export default app;