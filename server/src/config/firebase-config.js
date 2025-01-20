const admin = require('firebase-admin');
require('dotenv').config();

// Debug environment variables
console.log('Firebase Config:', {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY
});

// Initialize Firebase Admin SDK
try {
  const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  };

  console.log('Service Account:', {
    project_id: serviceAccount.project_id,
    client_email: serviceAccount.client_email,
    has_private_key: !!serviceAccount.private_key
  });

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  throw error;
}

module.exports = {
  admin
};
