const express = require('express');
const { log } = require('../utils/logger');
const { authenticateFirebase } = require('../middleware/firebaseAuth');
const {
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  updateActivityHistory
} = require('../services/firebase/db');

const router = express.Router();

// Get all activities for a user
router.get('/', authenticateFirebase, async (req, res) => {
  const { id: userId } = req.user;
  log('ACTIVITY', '→ Fetching for user:', userId);
  
  try {
    const activities = await getActivities(userId);
    log('ACTIVITY', '✓ Found:', `count=${activities?.length || 0}`);
    res.json(activities);
  } catch (error) {
    log('ACTIVITY', '✗ Fetch error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Create a new activity
router.post('/', authenticateFirebase, async (req, res) => {
  const { id: userId } = req.user;
  const { name, weeklyGoalHours, description } = req.body;
  
  try {
    const { id: activityId } = await createActivity(userId, {
      name,
      weeklyGoalHours,
      description
    });
    
    const newActivity = await getActivity(userId, activityId);
    log('ACTIVITY', '✓ Created:', name);
    res.status(201).json(newActivity);
  } catch (error) {
    log('ACTIVITY', '✗ Create error:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Update an activity
router.put('/:id', authenticateFirebase, async (req, res) => {
  const { id: userId } = req.user;
  const activityId = req.params.id;
  log('ACTIVITY', '→ Update attempt:', `id=${activityId}`);
  log('ACTIVITY', '→ Request body:', JSON.stringify(req.body));
  
  try {
    const activity = await getActivity(userId, activityId);
    if (!activity) {
      log('ACTIVITY', '✗ Not found:', activityId);
      return res.status(404).json({ message: 'Activity not found' });
    }

    log('ACTIVITY', '→ Current activity:', JSON.stringify(activity));
    await updateActivity(userId, activityId, req.body);
    const updatedActivity = await getActivity(userId, activityId);
    log('ACTIVITY', '✓ Updated activity:', JSON.stringify(updatedActivity));
    res.json(updatedActivity);
  } catch (error) {
    log('ACTIVITY', '✗ Update error:', error.message);
    log('ACTIVITY', '✗ Update error stack:', error.stack);
    res.status(400).json({ message: error.message });
  }
});

// Delete an activity
router.delete('/:id', authenticateFirebase, async (req, res) => {
  const { id: userId } = req.user;
  const activityId = req.params.id;
  log('ACTIVITY', '→ Delete attempt:', `id=${activityId}`);
  
  try {
    const activity = await getActivity(userId, activityId);
    if (!activity) {
      log('ACTIVITY', '✗ Not found:', activityId);
      return res.status(404).json({ message: 'Activity not found' });
    }

    log('ACTIVITY', '→ Request body:', JSON.stringify(activity));
    await deleteActivity(userId, activityId);
    log('ACTIVITY', '✓ Deleted:', activityId);
    return res.status(200).json({ message: 'Activity deleted' });
  } catch (error) {
    log('ACTIVITY', '✗ Delete error:', error.message);
    return res.status(500).json({ message: error.message });
  }
});

// Update activity history
router.put('/:id/history', authenticateFirebase, async (req, res) => {
  const { id: userId } = req.user;
  const activityId = req.params.id;
  const { yearWeek, days } = req.body;
  
  log('ACTIVITY', '→ History update:', `id=${activityId}, week=${yearWeek}`);
  
  try {
    const activity = await getActivity(userId, activityId);
    if (!activity) {
      log('ACTIVITY', '✗ Not found:', activityId);
      return res.status(404).json({ message: 'Activity not found' });
    }

    await updateActivityHistory(userId, activityId, yearWeek, days);
    const updatedActivity = await getActivity(userId, activityId);
    
    log('ACTIVITY', '✓ History updated:', `id=${activityId}, week=${yearWeek}`);
    res.json(updatedActivity);
  } catch (error) {
    log('ACTIVITY', '✗ History update error:', error.message);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
