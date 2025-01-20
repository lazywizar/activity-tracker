const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { log } = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      log('AUTH', '✗ No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      log('AUTH', '✗ User not found for token:', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }

    log('AUTH', '✓ User authenticated:', user.email);
    req.user = user;
    next();
  } catch (error) {
    log('AUTH', '✗ Invalid token:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { authenticateToken };
