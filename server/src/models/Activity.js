const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
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

module.exports = mongoose.model('Activity', activitySchema);
