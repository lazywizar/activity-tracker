import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Debug logs for Firebase configuration
console.log('Firebase Environment Variables:');
console.log('API_KEY:', process.env.REACT_APP_FIREBASE_API_KEY);
console.log('AUTH_DOMAIN:', process.env.REACT_APP_FIREBASE_AUTH_DOMAIN);
console.log('PROJECT_ID:', process.env.REACT_APP_FIREBASE_PROJECT_ID);
console.log('STORAGE_BUCKET:', process.env.REACT_APP_FIREBASE_STORAGE_BUCKET);
console.log('MESSAGING_SENDER_ID:', process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID);
console.log('APP_ID:', process.env.REACT_APP_FIREBASE_APP_ID);
console.log('MEASUREMENT_ID:', process.env.REACT_APP_FIREBASE_MEASUREMENT_ID);

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Debug log for final config
console.log('Final Firebase Config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
