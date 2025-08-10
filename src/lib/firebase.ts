import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Debug logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase Config Debug:', {
    projectId: firebaseConfig.projectId,
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain
  });
  
  if (!firebaseConfig.projectId) {
    console.error('🔥 Firebase Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID is undefined!');
    console.error('Check if .env.local file exists and contains proper values');
  }
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Force Firebase to use production endpoints (no offline persistence in browser)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔥 Firebase: Using production Firestore in development mode');
}

export default app;