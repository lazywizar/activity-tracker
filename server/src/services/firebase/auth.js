const { admin } = require('../../config/firebase-config');
const { createUser, getUser } = require('./db');
const { log } = require('../../utils/logger');

// Verify Firebase ID token
const verifyToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    log('AUTH', '✗ Token verification failed:', error.message);
    throw error;
  }
};

// Create a new user in Firestore after successful Firebase Auth registration
const handleNewUser = async (user) => {
  try {
    const { uid, email } = user;
    await createUser(uid, { email });
    log('AUTH', '✓ New user created in Firestore:', email);
  } catch (error) {
    log('AUTH', '✗ Error creating user in Firestore:', error.message);
    throw error;
  }
};

// Get user data from Firestore
const getUserData = async (uid) => {
  try {
    const userData = await getUser(uid);
    if (!userData) {
      log('AUTH', '✗ User not found in Firestore:', uid);
      throw new Error('User not found');
    }
    log('AUTH', '✓ User data retrieved:', uid);
    return userData;
  } catch (error) {
    log('AUTH', '✗ Error getting user data:', error.message);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email) => {
  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    log('AUTH', '✓ Password reset email sent to:', email);
    return link;
  } catch (error) {
    log('AUTH', '✗ Error sending password reset email:', error.message);
    throw error;
  }
};

// Send email verification
const sendEmailVerification = async (email) => {
  try {
    const link = await admin.auth().generateEmailVerificationLink(email);
    log('AUTH', '✓ Email verification sent to:', email);
    return link;
  } catch (error) {
    log('AUTH', '✗ Error sending email verification:', error.message);
    throw error;
  }
};

// Update user profile
const updateUserProfile = async (uid, updates) => {
  try {
    await admin.auth().updateUser(uid, updates);
    log('AUTH', '✓ User profile updated:', uid);
  } catch (error) {
    log('AUTH', '✗ Error updating user profile:', error.message);
    throw error;
  }
};

module.exports = {
  verifyToken,
  handleNewUser,
  getUserData,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateUserProfile
};
