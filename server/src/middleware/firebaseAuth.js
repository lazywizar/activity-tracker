const { verifyToken, getUserData } = require('../services/firebase/auth');
const { log } = require('../utils/logger');

const authenticateFirebase = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const idToken = authHeader && authHeader.split(' ')[1];

    if (!idToken) {
      log('AUTH', '✗ No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      // Verify the Firebase ID token
      const decodedToken = await verifyToken(idToken);
      
      // Get user data from Firestore
      const userData = await getUserData(decodedToken.uid);
      
      // Attach user data to request
      req.user = {
        id: decodedToken.uid,
        email: userData.email,
        ...userData
      };

      log('AUTH', '✓ User authenticated:', req.user.email);
      next();
    } catch (error) {
      log('AUTH', '✗ Token verification failed:', error.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    log('AUTH', '✗ Authentication error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  authenticateFirebase
};
