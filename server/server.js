// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Add at the top after imports
const log = (area, message, data = '') => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${area.padEnd(12)} | ${message} ${data}`);
};

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  log('REQUEST', `${req.method} ${req.path}`);
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/activity-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  log('DATABASE', '✓ Connected to MongoDB');
}).catch((err) => {
  log('DATABASE', '✗ Connection failed:', err.message);
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
  description: { type: String },  // Add this line
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

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
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

app.post('/api/auth/login', async (req, res) => {
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

// Add this with your other activity routes
app.get('/api/activities', authenticateToken, async (req, res) => {
  log('ACTIVITY', '→ Fetching for user:', req.user._id);
  try {
    const activities = await Activity.find({ user: req.user._id });
    log('ACTIVITY', '✓ Found:', `count=${activities?.length || 0}`);
    res.json(activities);
  } catch (error) {
    log('ACTIVITY', '✗ Fetch error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Protected Routes - Activities
app.post('/api/activities', authenticateToken, async (req, res) => {
  try {
    const activity = new Activity({
      name: req.body.name,
      weeklyGoalHours: req.body.weeklyGoalHours,
      history: req.body.history || {},
      user: req.user._id
    });
    const newActivity = await activity.save();
    log('ACTIVITY', '✓ Created:', activity.name);
    res.status(201).json(newActivity);
  } catch (error) {
    log('ACTIVITY', '✗ Create error:', error.message);
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/activities/:id', authenticateToken, async (req, res) => {
  try {
    log('ACTIVITY', '→ Update attempt:', `id=${req.params.id}`);
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!activity) {
      log('ACTIVITY', '✗ Not found:', req.params.id);
      return res.status(404).json({ message: 'Activity not found' });
    }

    activity.name = req.body.name || activity.name;
    activity.weeklyGoalHours = req.body.weeklyGoalHours || activity.weeklyGoalHours;
    activity.description = req.body.description;
    activity.history = req.body.history || activity.history;

    const updatedActivity = await activity.save();
    log('ACTIVITY', '✓ Updated:', activity.name);
    res.json(updatedActivity);
  } catch (error) {
    log('ACTIVITY', '✗ Update error:', error.message);
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

    log('ACTIVITY', '✓ Deleted:', activity.name);
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    log('ACTIVITY', '✗ Delete error:', error.message);
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

app.get('/api/health', (req, res) => {
  log('HEALTH', '✓ Health check ping received');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

// Environment Variables needed in .env file:
// MONGODB_URI=your_mongodb_connection_string
// JWT_SECRET=your_jwt_secret_key
// PORT=5000 (optional)

app.use((err, req, res, next) => {
  log('ERROR', `${req.method} ${req.path}:`, err.message);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));