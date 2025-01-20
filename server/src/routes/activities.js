const express = require('express');
const Activity = require('../models/Activity');
const { authenticateToken } = require('../middleware/auth');
const { log } = require('../utils/logger');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
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

router.post('/', authenticateToken, async (req, res) => {
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

router.put('/:id', authenticateToken, async (req, res) => {
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

router.delete('/:id', authenticateToken, async (req, res) => {
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

module.exports = router;
