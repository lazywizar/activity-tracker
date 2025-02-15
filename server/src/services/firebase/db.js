const { admin } = require('../../config/firebase-config');
const db = admin.firestore();

// User Operations
const createUser = async (userId, userData) => {
  await db.collection('users').doc(userId).set({
    email: userData.email,
    createdAt: new Date()
  });
};

const getUser = async (userId) => {
  const doc = await db.collection('users').doc(userId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

// Activity Operations
const createActivity = async (userId, activityData) => {
  const activityRef = db
    .collection('users')
    .doc(userId)
    .collection('activities')
    .doc();

  await activityRef.set({
    name: activityData.name,
    description: activityData.description || '',
    weeklyGoalHours: activityData.weeklyGoalHours,
    history: {},
    createdAt: new Date()
  });

  return { id: activityRef.id };
};

const getActivities = async (userId) => {
  const snapshot = await db
    .collection('users')
    .doc(userId)
    .collection('activities')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

const getActivity = async (userId, activityId) => {
  const doc = await db
    .collection('users')
    .doc(userId)
    .collection('activities')
    .doc(activityId)
    .get();

  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

const updateActivity = async (userId, activityId, activityData) => {
  console.log('DB: Updating activity', {
    userId,
    activityId,
    activityData
  });

  try {
    const activityRef = db
      .collection('users')
      .doc(userId)
      .collection('activities')
      .doc(activityId);

    // Get current activity data
    const currentActivity = await activityRef.get();
    const currentData = currentActivity.data() || {};
    console.log('DB: Current activity data:', currentData);

    // If history is being updated, handle it carefully
    let updates = { ...activityData };
    if (activityData.history) {
      // For history updates, merge at the month level
      const mergedHistory = { ...currentData.history };
      Object.entries(activityData.history).forEach(([monthKey, monthData]) => {
        mergedHistory[monthKey] = {
          days: monthData.days
        };
      });
      updates.history = mergedHistory;
    }

    // Add updatedAt timestamp
    updates.updatedAt = new Date();

    console.log('DB: Merged updates:', updates);

    // Update the activity with merge: true to preserve other fields
    await activityRef.set(updates, { merge: true });
    console.log('DB: Update successful');

    return { id: activityId };
  } catch (error) {
    console.error('DB: Error updating activity:', error);
    throw error;
  }
};

const deleteActivity = async (userId, activityId) => {
  console.log('DB: Deleting activity', { userId, activityId });
  
  try {
    const activityRef = db
      .collection('users')
      .doc(userId)
      .collection('activities')
      .doc(activityId);

    await activityRef.delete();
    console.log('DB: Successfully deleted activity', activityId);
    
    // Verify deletion
    const doc = await activityRef.get();
    if (!doc.exists) {
      console.log('DB: Verified activity no longer exists');
    } else {
      console.error('DB: Activity still exists after deletion!');
    }
  } catch (error) {
    console.error('DB: Error deleting activity:', error);
    throw error;
  }
};

const updateActivityHistory = async (userId, activityId, yearWeek, days) => {
  try {
    // First get the current activity to preserve existing history
    const activityRef = db
      .collection('users')
      .doc(userId)
      .collection('activities')
      .doc(activityId);

    const activity = await activityRef.get();
    const currentData = activity.data() || {};
    const currentHistory = currentData.history || {};

    // Update the history for the specific yearWeek
    const updatedHistory = {
      ...currentHistory,
      [yearWeek]: days
    };

    // Update the document with the new history
    await activityRef.update({
      history: updatedHistory
    });
  } catch (error) {
    console.error('Error updating activity history:', error);
    throw error;
  }
};

module.exports = {
  // User operations
  createUser,
  getUser,
  // Activity operations
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  updateActivityHistory
};
