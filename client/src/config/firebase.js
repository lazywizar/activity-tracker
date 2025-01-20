import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Function to partially redact a string
const redactString = (str) => {
  if (!str) return 'undefined';
  if (str.length <= 8) return '***';
  return str.substring(0, 4) + '...' + str.substring(str.length - 4);
};

// Debug: Log all environment variables
console.log('Environment Variables Check:', {
  NODE_ENV: process.env.NODE_ENV,
  all_env_keys: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')),
  api_key_exists: !!process.env.REACT_APP_FIREBASE_API_KEY,
  api_key_length: process.env.REACT_APP_FIREBASE_API_KEY?.length
});

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.REACT_APP_FIREBASE_APP_ID?.trim(),
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID?.trim()
};

// Validate required config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Missing required Firebase configuration:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId
  });
  throw new Error('Invalid Firebase configuration: Missing required fields');
}

// Debug log for Firebase configuration
console.log('Firebase Config Loading State:', {
  config_keys: Object.keys(firebaseConfig),
  has_api_key: !!firebaseConfig.apiKey,
  has_project_id: !!firebaseConfig.projectId,
  api_key_type: typeof firebaseConfig.apiKey,
  project_id_type: typeof firebaseConfig.projectId
});

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
