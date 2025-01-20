// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { log } = require('./src/utils/logger');
const connectDB = require('./src/config/database');
const authRoutes = require('./src/routes/auth');
const activityRoutes = require('./src/routes/activities');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  log('REQUEST', `${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);

// Move the server startup into an async function
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      log('SERVER', '✓ Running on port:', PORT);
    });
  } catch (error) {
    log('SERVER', '✗ Startup error:', error.message);
    process.exit(1);
  }
};

// Initialize the server
startServer();
