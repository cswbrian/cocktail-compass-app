import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// Get this from Firebase Console -> Project Settings
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
};

// Initialize Firebase only on client side
const app = typeof window !== "undefined" ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null; 