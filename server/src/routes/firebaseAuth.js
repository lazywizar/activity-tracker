const express = require('express');
const { log } = require('../utils/logger');
const { 
  handleNewUser, 
  sendPasswordResetEmail, 
  sendEmailVerification,
  updateUserProfile,
  getUserData
} = require('../services/firebase/auth');
const { authenticateFirebase } = require('../middleware/firebaseAuth');

const router = express.Router();

// Handle new user creation in Firestore after Firebase Auth registration
router.post('/create-user', async (req, res) => {
  const { user } = req.body;
  log('CREATE-USER', '→ Attempt:', user.email);

  try {
    await handleNewUser(user);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    log('CREATE-USER', '✗ Error:', error.message);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Send password reset email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  log('FORGOT-PASSWORD', '→ Attempt:', email);

  try {
    const resetLink = await sendPasswordResetEmail(email);
    res.json({ 
      message: 'Password reset email sent',
      resetLink // Only in development, remove in production
    });
  } catch (error) {
    log('FORGOT-PASSWORD', '✗ Error:', error.message);
    res.status(400).json({ message: 'Error sending reset email' });
  }
});

// Send email verification
router.post('/verify-email', authenticateFirebase, async (req, res) => {
  const { email } = req.user;
  log('VERIFY-EMAIL', '→ Attempt:', email);

  try {
    const verificationLink = await sendEmailVerification(email);
    res.json({ 
      message: 'Verification email sent',
      verificationLink // Only in development, remove in production
    });
  } catch (error) {
    log('VERIFY-EMAIL', '✗ Error:', error.message);
    res.status(400).json({ message: 'Error sending verification email' });
  }
});

// Update user profile
router.put('/profile', authenticateFirebase, async (req, res) => {
  const { id: uid } = req.user;
  const updates = req.body;
  log('UPDATE-PROFILE', '→ Attempt:', uid);

  try {
    await updateUserProfile(uid, updates);
    const updatedUser = await getUserData(uid);
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    log('UPDATE-PROFILE', '✗ Error:', error.message);
    res.status(400).json({ message: 'Error updating profile' });
  }
});

// Get current user data
router.get('/me', authenticateFirebase, async (req, res) => {
  const { id: uid } = req.user;
  log('GET-PROFILE', '→ Attempt:', uid);

  try {
    const userData = await getUserData(uid);
    res.json({ user: userData });
  } catch (error) {
    log('GET-PROFILE', '✗ Error:', error.message);
    res.status(400).json({ message: 'Error getting user data' });
  }
});

module.exports = router;
