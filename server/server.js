// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const debugLog = (area, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = {
    timestamp,
    area,
    message,
    ...(data && { data })
  };
  console.log(JSON.stringify(logMessage, null, 2));
};

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  debugLog('Request', 'Incoming request', {
    method: req.method,
    path: req.path,
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/activity-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  debugLog('Database', 'Successfully connected to MongoDB', {
    uri: process.env.MONGODB_URI ? 'Production URI' : 'Local URI'
  });
}).catch((err) => {
  debugLog('Database', 'MongoDB connection error', {
    error: err.message,
    stack: err.stack
  });
});

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: {
    type: String
  },
  resetTokenExpiry: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Activity Schema
const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  weeklyGoalHours: { type: Number, required: true },
  history: {
    type: Map,
    of: {
      days: [Number]
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const User = mongoose.model('User', userSchema);
const Activity = mongoose.model('Activity', activitySchema);

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  debugLog('Auth', 'Starting token authentication', {
    headers: req.headers
  });

  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      debugLog('Auth', 'No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    debugLog('Auth', 'Verifying JWT token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    debugLog('Auth', 'Token decoded successfully', { userId: decoded.userId });

    const user = await User.findById(decoded.userId);
    if (!user) {
      debugLog('Auth', 'User not found for token', { userId: decoded.userId });
      return res.status(401).json({ message: 'User not found' });
    }

    debugLog('Auth', 'Authentication successful', { userId: user._id });
    req.user = user;
    next();
  } catch (error) {
    debugLog('Auth', 'Token authentication failed', {
      error: error.message,
      stack: error.stack
    });
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  debugLog('Register', 'Registration attempt', {
    email: req.body.email
  });

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      debugLog('Register', 'Missing required fields', {
        hasEmail: !!email,
        hasPassword: !!password
      });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    debugLog('Register', 'Checking for existing user');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      debugLog('Register', 'Email already registered', { email });
      return res.status(400).json({ message: 'Email already registered' });
    }

    debugLog('Register', 'Hashing password');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    debugLog('Register', 'Creating new user');
    const user = new User({
      email,
      password: hashedPassword
    });

    await user.save();
    debugLog('Register', 'User created successfully', { userId: user._id });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    debugLog('Register', 'JWT token generated');

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    debugLog('Register', 'Registration failed', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  debugLog('Login', 'Login attempt', {
    email: req.body.email
  });

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      debugLog('Login', 'Missing required fields', {
        hasEmail: !!email,
        hasPassword: !!password
      });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    debugLog('Login', 'Finding user');
    const user = await User.findOne({ email });
    if (!user) {
      debugLog('Login', 'User not found', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    debugLog('Login', 'Verifying password');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      debugLog('Login', 'Invalid password', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    debugLog('Login', 'Generating JWT token');
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    debugLog('Login', 'Login successful', { userId: user._id });
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    debugLog('Login', 'Login failed', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: error.message });
  }
});

// Protected Routes - Activities
app.get('/api/activities', authenticateToken, async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/activities', authenticateToken, async (req, res) => {
  const activity = new Activity({
    name: req.body.name,
    weeklyGoalHours: req.body.weeklyGoalHours,
    history: req.body.history || {},
    user: req.user._id
  });

  try {
    const newActivity = await activity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/activities/:id', authenticateToken, async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    activity.name = req.body.name || activity.name;
    activity.weeklyGoalHours = req.body.weeklyGoalHours || activity.weeklyGoalHours;
    activity.history = req.body.history || activity.history;

    const updatedActivity = await activity.save();
    res.json(updatedActivity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/activities/:id', authenticateToken, async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json({ message: 'Activity deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if email doesn't exist for security
      return res.json({ message: 'If an account exists, a password reset link will be sent' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In a real application, you would:
    // 1. Save the reset token to the user record with an expiration
    // 2. Send an email with a link containing the token
    // 3. Create a reset password page that verifies the token

    res.json({ message: 'If an account exists, a password reset link will be sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal whether the email exists or not
      return res.json({
        message: 'If an account exists with this email, a password reset link will be sent.'
      });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In a real production app, you would:
    // 1. Save the reset token to the user record
    // 2. Send an email with the reset link
    // For now, we'll just console log the token
    console.log('Reset token for', email, ':', resetToken);

    // Send response
    res.json({
      message: 'If an account exists with this email, a password reset link will be sent.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      message: 'An error occurred while processing your request.'
    });
  }
});

app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    // Token is already verified in authenticateToken middleware
    // Just return the user data
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Environment Variables needed in .env file:
// MONGODB_URI=your_mongodb_connection_string
// JWT_SECRET=your_jwt_secret_key
// PORT=5000 (optional)

app.use((err, req, res, next) => {
  debugLog('Error', 'Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));