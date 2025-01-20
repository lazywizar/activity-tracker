import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Function to partially redact a string
const redactString = (str) => {
  if (!str) return 'undefined';
  if (str.length <= 8) return '***';
  return str.substring(0, 4) + '...' + str.substring(str.length - 4);
};

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Debug log for Firebase configuration
console.log('Firebase Config (Redacted):', {
  apiKey: redactString(firebaseConfig.apiKey),
  authDomain: redactString(firebaseConfig.authDomain),
  projectId: redactString(firebaseConfig.projectId),
  storageBucket: redactString(firebaseConfig.storageBucket),
  messagingSenderId: redactString(firebaseConfig.messagingSenderId),
  appId: redactString(firebaseConfig.appId),
  measurementId: redactString(firebaseConfig.measurementId)
});

let auth;

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.error('Firebase initialization error:', error.message);
  console.log('Failed Firebase Config (Redacted):', {
    apiKey: redactString(firebaseConfig.apiKey),
    authDomain: redactString(firebaseConfig.authDomain),
    projectId: redactString(firebaseConfig.projectId)
  });
  throw error;
}

export { auth };
