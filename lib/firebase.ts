import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { GooglePlace } from '@/types/note';

// Your web app's Firebase configuration
// Get this from Firebase Console -> Project Settings
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
};

// Initialize Firebase only on client side
const app = typeof window !== "undefined" ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Add Google Places script to the page
let googlePlacesScriptPromise: Promise<void> | null = null;

export const loadGooglePlacesScript = (): Promise<void> => {
  if (googlePlacesScriptPromise) {
    return googlePlacesScriptPromise;
  }

  googlePlacesScriptPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'));
      return;
    }

    if (window.google?.maps?.places) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps?.places) {
        resolve();
      } else {
        reject(new Error('Google Places API failed to load'));
      }
    };
    script.onerror = (error) => reject(error);
    document.head.appendChild(script);
  });

  return googlePlacesScriptPromise;
}; 