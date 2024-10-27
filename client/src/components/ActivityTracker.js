import React, { useState, useEffect } from 'react';
import { Settings, ChevronUp, ChevronDown, Download, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from './Auth/AuthContext';
import '../styles/auth.css';
import '../styles/styles.css';

// Updated Emoji components with color
const SmileEmoji = ({ color }) => (
  <div className="emoji smile" style={{ color }}>😊</div>
);

const MehEmoji = ({ color }) => (
  <div className="emoji meh" style={{ color }}>😐</div>
);

const FrownEmoji = ({ color }) => (
  <div className="emoji frown" style={{ color }}>😟</div>
);

const isPastDay = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

// Add this new function to calculate expected progress
const calculateExpectedProgress = (weekDates) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If we're looking at a past week, expect 100%
  if (weekDates[6] < today) {
    return 100;
  }

  // If we're looking at a future week, expect 0%
  if (weekDates[0] > today) {
    return 0;
  }

  // Count days passed including today
  let daysPassed = 0;
  for (const date of weekDates) {
    date.setHours(0, 0, 0, 0);
    if (date <= today) {
      daysPassed++;
    }
  }

  return (daysPassed / 7) * 100;
};

// Update the getStatusEmoji function
const getStatusEmoji = (actualProgress, expectedProgress) => {
  // Calculate how well we're doing compared to expected progress
  // Add a 10% buffer to account for slight variations
  const progressRatio = actualProgress / (expectedProgress || 1);

  if (progressRatio >= 0.9) {
    // Doing great - on track or ahead
    return <SmileEmoji color="#22c55e" />; // green
  } else if (progressRatio >= 0.6) {
    // Slightly behind but recoverable
    return <MehEmoji color="#eab308" />; // yellow
  } else {
    // Significantly behind
    return <FrownEmoji color="#ef4444" />; // red
  }
};

// Update the getProgressColor function to use the same logic
const getProgressColor = (actualProgress, expectedProgress) => {
  const progressRatio = actualProgress / (expectedProgress || 1);

  if (progressRatio >= 0.9) return 'text-green-600';
  if (progressRatio >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
};

// Activity Settings Modal Component
const ActivitySettingsModal = ({ activity, onSave, onDelete, onClose }) => {
  const [name, setName] = useState(activity.name);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(activity.weeklyGoalHours);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Activity name cannot be empty');
      return;
    }

    if (isNaN(weeklyGoalHours) || weeklyGoalHours <= 0) {
      setError('Please enter a valid goal (greater than 0)');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ ...activity, name, weeklyGoalHours: Number(weeklyGoalHours) });
      setError(null);
    } catch (err) {
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <h2 className="modal-title">Edit Activity</h2>
        {error && (
          <div className="error-message mb-4 text-red-600 text-sm">{error}</div>
        )}
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
              min="0.5"
              step="0.5"
              value={weeklyGoalHours}
              onChange={(e) => setWeeklyGoalHours(e.target.value)}
              className="input"
              required
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              onClick={onDelete}
              className="delete-button"
              disabled={isSubmitting}
            >
              Delete Activity
            </button>
            <div className="modal-buttons">
              <button
                type="button"
                onClick={onClose}
                className="cancel-button"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add these new components after your existing modals
const DateRangeModal = ({ onClose, onDownload }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const twoYearsMs = 2 * 365 * 24 * 60 * 60 * 1000;

    if (end < start) {
      setError('End date must be after start date');
      return;
    }

    if (end - start > twoYearsMs) {
      setError('Date range cannot exceed 2 years');
      return;
    }

    onDownload(start, end);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="modal-title">Export Data Range</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        {error && (
          <div className="error-message mb-4 text-red-600 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
            >
              Download
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const generateDateRange = (startDate, endDate) => {
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

const formatDateForCSV = (date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

function ActivityTracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityGoal, setNewActivityGoal] = useState('');
  const [editingActivity, setEditingActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState({});
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const { user, logout } = useAuth();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchActivities();
    const savedDate = localStorage.getItem('currentDate');
    if (savedDate) {
      setCurrentDate(new Date(savedDate));
    }
  }, []);

  const handleDownloadCSV = (startDate, endDate) => {
    // Generate all dates in range
    const dateRange = generateDateRange(startDate, endDate);

    // Create CSV header
    const headers = ['Activity Name', ...dateRange.map(formatDateForCSV)];

    // Create CSV rows
    const rows = activities.map(activity => {
      const row = [activity.name];

      dateRange.forEach(date => {
        const monthKey = formatMonthKey(date);
        const dayIndex = getDayIndex(date);
        const minutes = activity.history[monthKey]?.days[dayIndex] || 0;
        row.push(minutes);
      });

      return row;
    });
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `activity-data-${formatDateForCSV(startDate)}-to-${formatDateForCSV(endDate)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setShowDateRangeModal(false);
  };

  const fetchActivities = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/activities`);
      setActivities(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities. Please try again.');
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
    localStorage.setItem('currentDate', newDate.toISOString());
  };

  const addActivity = async () => {
    if (!newActivityName.trim()) {
      setError('Activity name cannot be empty');
      return;
    }

    const goalHours = parseFloat(newActivityGoal);
    if (isNaN(goalHours) || goalHours <= 0) {
      setError('Please enter a valid goal (greater than 0)');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      const weekDates = getWeekDates();
      const history = {};

      weekDates.forEach(date => {
        const monthKey = formatMonthKey(date);
        if (!history[monthKey]) {
          history[monthKey] = {
            days: Array(new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()).fill(0)
          };
        }
      });

      const newActivity = {
        name: newActivityName.trim(),
        weeklyGoalHours: goalHours,
        history
      };

      const response = await axios.post(`${API_BASE_URL}/activities`, newActivity);
      setActivities([...activities, response.data]);
      setNewActivityName('');
      setNewActivityGoal('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding activity:', error);
      setError('Failed to add activity. Please try again.');
    } finally {
      setIsSubmitting(false);
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

      // Handle empty string or null specifically
      const parsedMinutes = minutes === '' ? 0 : parseInt(minutes);
      // Only validate if it's not empty
      if (minutes !== '' && (isNaN(parsedMinutes) || parsedMinutes < 0)) {
        return;
      }

      const updatedHistory = {
        ...activity.history,
        [monthKey]: {
          days: activity.history[monthKey]
            ? [...activity.history[monthKey].days]
            : Array(new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()).fill(0)
        }
      };

      updatedHistory[monthKey].days[dayIndex] = parsedMinutes;

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

  const calculateProgress = (activity, dates = getWeekDates()) => {
    let totalMinutes = 0;

    dates.forEach(date => {
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
          <h1 className="title">Mōmentum</h1>

          <div className="month-navigation">
            <button className="nav-button" onClick={() => changeWeek(-1)}>←</button>
            <span className="current-month">{getMonthDisplay()}</span>
            <button className="nav-button" onClick={() => changeWeek(1)}>→</button>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            className="add-button" // reuse the same class as the + button
            onClick={() => setShowDateRangeModal(true)}
            title="Download CSV"
          >
            <Download size={16} />
          </button>
          <button className="add-button" onClick={() => setShowAddForm(!showAddForm)}>+</button>
          <button
            className="text-sm text-gray-600 hover:text-gray-800"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="card error-message">
          <div className="p-4 text-center text-red-600">{error}</div>
        </div>
      )}

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
            min="0.5"
            step="0.5"
          />
          <button
            onClick={addActivity}
            className="save-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
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
          const expectedProgress = calculateExpectedProgress(weekDates);
          const progressColorClass = getProgressColor(progress, expectedProgress);

          const getPastWeekDates = (weeksAgo) => {
            return weekDates.map(date => {
              const newDate = new Date(date);
              newDate.setDate(date.getDate() - (7 * weeksAgo));
              return newDate;
            });
          };

          return (
            <div key={activity._id}>
              <div className="card activity-row">
                <div className="activity-info">
                  <div className="activity-name">{activity.name}</div>
                  <div className="activity-goal">{activity.weeklyGoalHours}h goal/wk</div>
                </div>

                {weekDates.map((date) => {
                  const monthKey = formatMonthKey(date);
                  const dayIndex = getDayIndex(date);
                  const minutes = activity.history[monthKey]?.days[dayIndex] || 0;
                  const isToday = date.toDateString() === today.toDateString();
                  const isPast = isPastDay(new Date(date));

                  return (
                    <div
                      key={date.toISOString()}
                      className={`day-cell
                        ${getProgressColor(minutes, activity.weeklyGoalHours)}
                        ${isToday ? 'today' : ''}
                        ${isPast ? 'past' : ''}`}
                    >
                      <input
                        type="number"
                        value={minutes || ''}
                        onChange={(e) => handleMinutesChange(activityIndex, date, e.target.value)}
                        className="minute-input"
                        placeholder=""
                        min="0"
                        max="999"
                      />
                    </div>
                  );
                })}

                <div className="status-cell">
                  {getStatusEmoji(progress, expectedProgress)}
                  <span className={`progress-text ${progressColorClass}`}>
                    {progress.toFixed(1)}%
                  </span>
                </div>

                <div className="settings-cell flex space-x-2">
                  <button
                    className="settings-button"
                    onClick={() => setExpandedActivities(prev => ({
                      ...prev,
                      [activity._id]: !prev[activity._id]
                    }))}
                  >
                    {expandedActivities[activity._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    className="settings-button"
                    onClick={() => setEditingActivity(activity)}
                  >
                    <Settings size={16} />
                  </button>
                </div>
              </div>

              {/* Past weeks rows */}
              {expandedActivities[activity._id] && [1, 2, 3].map(weeksAgo => {
                  const pastWeekDates = getPastWeekDates(weeksAgo);
                  const weekProgress = calculateProgress(activity, pastWeekDates); // Now passing the correct dates
                  const weekProgressClass = getProgressColor(weekProgress, 100);

                  return (
                    <div key={weeksAgo} className="card activity-row history-row">
                    <div className="activity-info">
                      <div className="activity-goal text-gray-500">
                        {pastWeekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        -
                        {pastWeekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    {pastWeekDates.map((date) => {
                      const monthKey = formatMonthKey(date);
                      const dayIndex = getDayIndex(date);
                      const minutes = activity.history[monthKey]?.days[dayIndex] || 0;
                      const isPast = isPastDay(new Date(date));

                      return (
                        <div
                          key={date.toISOString()}
                          className={`day-cell
                            ${getProgressColor(minutes, activity.weeklyGoalHours)}
                            ${isPast ? 'past' : ''}`}
                        >
                          <input
                            type="number"
                            value={minutes || ''}
                            onChange={(e) => handleMinutesChange(activityIndex, date, e.target.value)}
                            className="minute-input"
                            placeholder=""
                            min="0"
                            max="999"
                          />
                        </div>
                      );
                    })}

                    <div className="status-cell">
                      {getStatusEmoji(weekProgress, 100)}
                      <span className={`progress-text ${weekProgressClass}`}>
                        {weekProgress.toFixed(1)}%
                      </span>
                    </div>

                    <div className="settings-cell">
                      {/* Empty cell to maintain grid alignment */}
                    </div>
                  </div>
                );
              })}
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
      {showDateRangeModal && (
        <DateRangeModal
          onClose={() => setShowDateRangeModal(false)}
          onDownload={handleDownloadCSV}
        />
      )}
    </div>
  );
}

export default ActivityTracker;