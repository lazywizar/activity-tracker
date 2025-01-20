const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { log } = require('../utils/logger');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  log('REGISTER', '→ Attempt:', email);

  try {
    if (!email || !password) {
      log('REGISTER', '✗ Missing fields');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      log('REGISTER', '✗ Email exists:', email);
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    log('REGISTER', '✓ Success:', email);

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email }
    });
  } catch (error) {
    log('REGISTER', '✗ Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  log('LOGIN', '→ Attempt:', email);

  try {
    if (!email || !password) {
      log('LOGIN', '✗ Missing fields');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      log('LOGIN', '✗ User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      log('LOGIN', '✗ Invalid password:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    log('LOGIN', '✓ Success:', email);

    res.json({
      token,
      user: { id: user._id, email: user.email }
    });
  } catch (error) {
    log('LOGIN', '✗ Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save reset token and expiry
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // In a real app, send email with reset link
    // For demo, just return the token
    res.json({ 
      message: 'Password reset initiated',
      resetToken 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetToken,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
