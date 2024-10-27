// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/activity-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
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
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));