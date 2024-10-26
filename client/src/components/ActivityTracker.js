import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import axios from 'axios';

// Emoji components
const SmileEmoji = () => (
  <div className="emoji smile">☺</div>
);

const MehEmoji = () => (
  <div className="emoji meh">😐</div>
);

const FrownEmoji = () => (
  <div className="emoji frown">☹</div>
);

// Activity Settings Modal Component
const ActivitySettingsModal = ({ activity, onSave, onDelete, onClose }) => {
  const [name, setName] = useState(activity.name);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(activity.weeklyGoalHours);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...activity, name, weeklyGoalHours: Number(weeklyGoalHours) });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <h2 className="modal-title">Edit Activity</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Activity Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="goal">Weekly Goal (hours)</label>
            <input
              id="goal"
              type="number"
              min="0"
              step="0.5"
              value={weeklyGoalHours}
              onChange={(e) => setWeeklyGoalHours(e.target.value)}
              className="input"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onDelete} className="delete-button">
              Delete Activity
            </button>
            <div className="modal-buttons">
              <button type="button" onClick={onClose} className="cancel-button">
                Cancel
              </button>
              <button type="submit" className="save-button">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};


function ActivityTracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityGoal, setNewActivityGoal] = useState('');
  const [editingActivity, setEditingActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/activities`);
      setActivities(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false);
    }
  };

  const addActivity = async () => {
    if (newActivityName && newActivityGoal) {
      try {
        const newActivity = {
          name: newActivityName,
          weeklyGoalHours: parseInt(newActivityGoal),
          history: {
            [formatMonthKey(currentDate)]: {
              days: Array(getDaysInMonth(currentDate)).fill(0)
            }
          }
        };

        const response = await axios.post(`${API_BASE_URL}/activities`, newActivity);
        setActivities([...activities, response.data]);
        setNewActivityName('');
        setNewActivityGoal('');
        setShowAddForm(false);
      } catch (error) {
        console.error('Error adding activity:', error);
      }
    }
  };

  const handleEditActivity = async (updatedActivity) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/activities/${editingActivity._id}`,
        updatedActivity
      );
      const newActivities = activities.map(a =>
        a._id === editingActivity._id ? response.data : a
      );
      setActivities(newActivities);
      setEditingActivity(null);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const handleDeleteActivity = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/activities/${editingActivity._id}`);
      const newActivities = activities.filter(a => a._id !== editingActivity._id);
      setActivities(newActivities);
      setEditingActivity(null);
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const handleMinutesChange = async (activityIndex, dayIndex, minutes) => {
    try {
      const activity = activities[activityIndex];
      const monthKey = formatMonthKey(currentDate);

      const updatedHistory = {
        ...activity.history,
        [monthKey]: {
          days: activity.history[monthKey]
            ? [...activity.history[monthKey].days]
            : Array(getDaysInMonth(currentDate)).fill(0)
        }
      };
      updatedHistory[monthKey].days[dayIndex] = parseInt(minutes) || 0;

      const response = await axios.put(
        `${API_BASE_URL}/activities/${activity._id}`,
        {
          ...activity,
          history: updatedHistory
        }
      );

      const newActivities = [...activities];
      newActivities[activityIndex] = response.data;
      setActivities(newActivities);
    } catch (error) {
      console.error('Error updating minutes:', error);
    }
  };

  const formatMonthKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getWeekDates = () => {
    const dates = [];
    const curr = new Date(currentDate);
    curr.setDate(curr.getDate() - curr.getDay());

    for (let i = 0; i < 7; i++) {
      dates.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const calculateProgress = (activity) => {
    const monthKey = formatMonthKey(currentDate);
    const currentDay = currentDate.getDate();
    const weekStart = Math.max(0, currentDay - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1));
    const history = activity.history[monthKey]?.days || Array(getDaysInMonth(currentDate)).fill(0);
    const weekMinutes = history.slice(weekStart, weekStart + 7).reduce((sum, min) => sum + (min || 0), 0);
    const weekHours = weekMinutes / 60;
    return (weekHours / activity.weeklyGoalHours) * 100;
  };

  const getStatusEmoji = (percentage) => {
    if (percentage >= 90) return <SmileEmoji />;
    if (percentage >= 50) return <MehEmoji />;
    return <FrownEmoji />;
  };

  const getProgressColor = (minutes, goalHours) => {
    const dailyGoalMinutes = (goalHours * 60) / 7;
    const percentage = (minutes / dailyGoalMinutes) * 100;
    if (percentage >= 90) return 'good';
    if (percentage >= 50) return 'medium';
    if (percentage > 0) return 'poor';
    return '';
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="p-4 text-center">Loading activities...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div className="title-section">
          <h1 className="title">Activities</h1>
          <div className="month-navigation">
            <button className="nav-button" onClick={() => changeMonth(-1)}>←</button>
            <span className="current-month">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button className="nav-button" onClick={() => changeMonth(1)}>→</button>
          </div>
        </div>
        <button className="add-button" onClick={() => setShowAddForm(!showAddForm)}>+</button>
      </div>

      {showAddForm && (
        <div className="card add-form">
          <input
            placeholder="Activity Name"
            value={newActivityName}
            onChange={(e) => setNewActivityName(e.target.value)}
            className="input"
          />
          <input
            type="number"
            placeholder="Weekly Goal (hours)"
            value={newActivityGoal}
            onChange={(e) => setNewActivityGoal(e.target.value)}
            className="input"
          />
          <button onClick={addActivity} className="save-button">Add</button>
        </div>
      )}

      <div className="activities-grid">
        <div className="week-headers">
          <div className="activity-header">Activity</div>
          {getWeekDates().map((date) => (
            <div key={date} className="day-header">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
          ))}
          <div className="status-header">Status</div>
          <div className="settings-header"></div>
        </div>

        {activities.map((activity, activityIndex) => {
          const currentDay = currentDate.getDate();
          const weekStart = Math.max(0, currentDay - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1));
          const progress = calculateProgress(activity);

          return (
            <div key={activity.name} className="card activity-row">
              <div className="activity-info">
                <div className="activity-name">{activity.name}</div>
                <div className="activity-goal">{activity.weeklyGoalHours}h goal</div>
              </div>

              {Array.from({ length: 7 }).map((_, dayOffset) => {
                const dayIndex = weekStart + dayOffset;
                const monthKey = formatMonthKey(currentDate);
                const minutes = activity.history[monthKey]?.days[dayIndex] || 0;
                const isToday = dayOffset === new Date().getDay() - 1 &&
                               currentDate.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={dayOffset}
                    className={`day-cell ${getProgressColor(minutes, activity.weeklyGoalHours)}
                              ${isToday ? 'today' : ''}`}
                  >
                    <input
                      type="number"
                      value={minutes || ''}
                      onChange={(e) => handleMinutesChange(activityIndex, dayIndex, e.target.value)}
                      className="minute-input"
                      placeholder="0"
                    />
                  </div>
                );
              })}

              <div className="status-cell">
                {getStatusEmoji(progress)}
                <span className="progress-text">{progress.toFixed(1)}%</span>
              </div>

              <div className="settings-cell">
                <button
                  className="settings-button"
                  onClick={() => setEditingActivity(activity)}
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingActivity && (
        <ActivitySettingsModal
          activity={editingActivity}
          onSave={handleEditActivity}
          onDelete={handleDeleteActivity}
          onClose={() => setEditingActivity(null)}
        />
      )}
    </div>
  );
}

export default ActivityTracker;