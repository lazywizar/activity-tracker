// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { log } = require('./src/utils/logger');
const firebaseAuthRoutes = require('./src/routes/firebaseAuth');
const firebaseActivitiesRoutes = require('./src/routes/firebaseActivities');

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
app.use('/api/auth', firebaseAuthRoutes);
app.use('/api/activities', firebaseActivitiesRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  log('SERVER', '✓ Running on port:', PORT);
});
