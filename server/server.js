// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/activity-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
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
  }
});

const Activity = mongoose.model('Activity', activitySchema);

// Routes
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.find();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/activities', async (req, res) => {
  const activity = new Activity({
    name: req.body.name,
    weeklyGoalHours: req.body.weeklyGoalHours,
    history: req.body.history || {}
  });

  try {
    const newActivity = await activity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
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

app.delete('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    await activity.remove();
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));