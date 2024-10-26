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

  const formatMonthKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getDayIndex = (date) => {
    return date.getDate() - 1;
  };

  const getWeekDates = () => {
    const dates = [];
    const curr = new Date(currentDate);
    // Get Monday of current week
    const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);
    curr.setDate(first);

    // Get all days of the week
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const formatDateHeader = (date) => {
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate()
    };
  };

  const getMonthDisplay = () => {
    const weekDates = getWeekDates();
    const firstDate = weekDates[0];
    const lastDate = weekDates[6];

    if (firstDate.getMonth() === lastDate.getMonth()) {
      return firstDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    if (firstDate.getFullYear() === lastDate.getFullYear()) {
      return `${firstDate.toLocaleString('default', { month: 'short' })} - ${lastDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
    }

    return `${firstDate.toLocaleString('default', { month: 'short', year: 'numeric' })} - ${lastDate.toLocaleString('default', { month: 'short', year: 'numeric' })}`;
  };

  const changeWeek = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (delta * 7));
    setCurrentDate(newDate);
  };

  const addActivity = async () => {
    if (newActivityName && newActivityGoal) {
      try {
        const weekDates = getWeekDates();
        const history = {};

        // Initialize history for all months in the current week
        weekDates.forEach(date => {
          const monthKey = formatMonthKey(date);
          if (!history[monthKey]) {
            history[monthKey] = {
              days: Array(new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()).fill(0)
            };
          }
        });

        const newActivity = {
          name: newActivityName,
          weeklyGoalHours: parseInt(newActivityGoal),
          history
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

  const handleMinutesChange = async (activityIndex, date, minutes) => {
    try {
      const activity = activities[activityIndex];
      const monthKey = formatMonthKey(date);
      const dayIndex = getDayIndex(date);

      // Initialize month if it doesn't exist
      const updatedHistory = {
        ...activity.history,
        [monthKey]: {
          days: activity.history[monthKey]
            ? [...activity.history[monthKey].days]
            : Array(new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()).fill(0)
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

  const calculateProgress = (activity) => {
    const weekDates = getWeekDates();
    let totalMinutes = 0;

    weekDates.forEach(date => {
      const monthKey = formatMonthKey(date);
      const dayIndex = getDayIndex(date);
      if (activity.history[monthKey]?.days[dayIndex]) {
        totalMinutes += activity.history[monthKey].days[dayIndex];
      }
    });

    const weekHours = totalMinutes / 60;
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

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="p-4 text-center">Loading activities...</div>
        </div>
      </div>
    );
  }

  const weekDates = getWeekDates();
  const today = new Date();

  return (
    <div className="container">
      <div className="header">
        <div className="title-section">
          <h1 className="title">Activities</h1>
          <div className="month-navigation">
            <button className="nav-button" onClick={() => changeWeek(-1)}>←</button>
            <span className="current-month">{getMonthDisplay()}</span>
            <button className="nav-button" onClick={() => changeWeek(1)}>→</button>
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
          {weekDates.map((date) => {
            const { day, date: dateNum } = formatDateHeader(date);
            return (
              <div key={date.toISOString()} className="day-header">
                <div>{day}</div>
                <div>{dateNum}</div>
              </div>
            );
          })}
          <div className="status-header">Status</div>
          <div className="settings-header"></div>
        </div>

        {activities.map((activity, activityIndex) => {
          const progress = calculateProgress(activity);

          return (
            <div key={activity._id} className="card activity-row">
              <div className="activity-info">
                <div className="activity-name">{activity.name}</div>
                <div className="activity-goal">{activity.weeklyGoalHours}h goal</div>
              </div>

              {weekDates.map((date) => {
                const monthKey = formatMonthKey(date);
                const dayIndex = getDayIndex(date);
                const minutes = activity.history[monthKey]?.days[dayIndex] || 0;
                const isToday = date.toDateString() === today.toDateString();

                return (
                  <div
                    key={date.toISOString()}
                    className={`day-cell ${getProgressColor(minutes, activity.weeklyGoalHours)}
                              ${isToday ? 'today' : ''}`}
                  >
                    <input
                      type="number"
                      value={minutes || ''}
                      onChange={(e) => handleMinutesChange(activityIndex, date, e.target.value)}
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