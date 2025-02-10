import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, ChevronUp, ChevronDown, Download, X, LogOut, MoreVertical } from 'lucide-react';
import axios from 'axios';
import { useAuth } from './Auth/AuthContext';
import '../styles/auth.css';
import '../styles/styles.css';
import BrandText from './BrandText';
import { debounce } from 'lodash';
import ActivitySettingsModal from './modals/ActivitySettingsModal';
import DateRangeModal from './modals/DateRangeModal';
import {
  isPastDay,
  calculateExpectedProgress,
  getStatusEmoji,
  getProgressColor,
  generateDateRange,
  formatDateForCSV
} from '../utils/activityUtils';

function ActivityTracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityDescription, setNewActivityDescription] = useState('');
  const [newActivityWeeklyGoalHours, setNewActivityWeeklyGoalHours] = useState('');
  const [editingActivity, setEditingActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState({});
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  const { user, logout } = useAuth();
  const [pendingUpdates, setPendingUpdates] = useState(new Set());
  const pendingChangesRef = useRef({});
  const saveAttemptsRef = useRef({});  // Track save attempts

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const updateActivity = async (activityId, updatedHistory, source = 'direct') => {
    // Don't update if the activity is being deleted
    if (!activities.find(a => a.id === activityId)) {
      console.log(`🚫 [${source}] Skipping update for deleted activity ${activityId}`);
      return;
    }

    console.log(`🔄 [${source}] Attempting to save activity ${activityId}`, {
      pendingUpdates: Array.from(pendingUpdates),
      history: JSON.stringify(updatedHistory),
      attempts: saveAttemptsRef.current[activityId] || 0
    });

    try {
      // Increment save attempts
      saveAttemptsRef.current[activityId] = (saveAttemptsRef.current[activityId] || 0) + 1;

      console.log('📤 Sending PUT request:', {
        url: `${API_BASE_URL}/activities/${activityId}`,
        body: { history: updatedHistory }
      });

      const response = await axios.put(
        `${API_BASE_URL}/activities/${activityId}`,
        {
          history: updatedHistory
        }
      );

      // Check if activity still exists before updating state
      if (activities.find(a => a.id === activityId)) {
        console.log(`✅ [${source}] Successfully saved activity ${activityId}`, {
          responseData: JSON.stringify(response.data),
          attempts: saveAttemptsRef.current[activityId]
        });

        // Update local state with the response
        const newActivities = activities.map(a =>
          a.id === activityId ? response.data : a
        );
        setActivities(newActivities);

        // Clear pending state for this activity
        setPendingUpdates(prev => {
          const newSet = new Set(prev);
          newSet.delete(activityId);
          return newSet;
        });
        delete pendingChangesRef.current[activityId];
        delete saveAttemptsRef.current[activityId];
      } else {
        console.log(`🚫 [${source}] Activity ${activityId} no longer exists, skipping state update`);
      }
    } catch (error) {
      console.error(`❌ [${source}] Failed to save activity ${activityId}`, {
        error: error.message,
        stack: error.stack,
        attempts: saveAttemptsRef.current[activityId]
      });
      setError('Failed to save changes. Please try again.');

      // If we've tried less than 3 times and the activity still exists, retry the save
      if (saveAttemptsRef.current[activityId] < 3 && activities.find(a => a.id === activityId)) {
        console.log(`🔄 Retrying save for activity ${activityId} (Attempt ${saveAttemptsRef.current[activityId]})`);
        setTimeout(() => updateActivity(activityId, updatedHistory, 'retry'), 1000);
      }
    }
  };

  // Create a debounced version with longer timeout
  const debouncedUpdate = useCallback(
    debounce((activityId, updatedHistory) => {
      updateActivity(activityId, updatedHistory, 'debounced');
    }, 1500), // Increased to 1.5 seconds to ensure enough typing time
    []
  );

  const handleMinutesChange = (activityIndex, date, minutes) => {
    try {
      const activity = activities[activityIndex];
      const monthKey = formatMonthKey(date);
      const dayIndex = getDayIndex(date);

      // Update local state immediately for responsive UI
      const updatedActivities = [...activities];
      const updatedActivity = { ...activity };

      if (!updatedActivity.history[monthKey]) {
        updatedActivity.history[monthKey] = {
          days: Array(getDaysInMonth(date)).fill(0)
        };
      }

      // Handle empty string or null specifically
      if (minutes === '') {
        updatedActivity.history[monthKey].days[dayIndex] = 0;
      } else {
        const parsedMinutes = parseInt(minutes);
        if (isNaN(parsedMinutes) || parsedMinutes < 0) {
          console.log('❌ Invalid minutes value:', minutes);
          return;
        }
        updatedActivity.history[monthKey].days[dayIndex] = parsedMinutes;
      }

      updatedActivities[activityIndex] = updatedActivity;
      setActivities(updatedActivities);

      // Only trigger save if the value is a complete number and not empty
      if (minutes !== '') {
        // Track pending update
        setPendingUpdates(prev => new Set(prev).add(activity.id));
        pendingChangesRef.current[activity.id] = updatedActivity.history;

        // Trigger debounced update
        debouncedUpdate(activity.id, updatedActivity.history);
      }

    } catch (error) {
      console.error('❌ Error in handleMinutesChange:', error);
      setError('Failed to update minutes. Please try again.');
    }
  };

  // NEW: Extracted DayCell component to render a day cell.
  const DayCell = ({
    date,
    minutes,
    weeklyGoalHours,
    isToday,
    isPast,
    onChange,
    showTodayIndicator
  }) => {
    // Keep local state for the input value, show empty string if minutes is 0
    const [inputValue, setInputValue] = useState(minutes === 0 ? '' : minutes.toString());
    const [isTyping, setIsTyping] = useState(false);
    
    // Update local value when minutes prop changes and we're not typing
    useEffect(() => {
      if (!isTyping) {
        setInputValue(minutes === 0 ? '' : minutes.toString());
      }
    }, [minutes]);

    const handleInputChange = (e) => {
      const val = e.target.value;
      // Only allow numbers and empty string, max 3 digits
      if (val === '' || /^\d{0,3}$/.test(val)) {
        setInputValue(val);
        setIsTyping(true);
      }
    };

    const handleBlur = () => {
      setIsTyping(false);
      // Only trigger onChange if the value has actually changed
      if (inputValue !== (minutes === 0 ? '' : minutes.toString())) {
        onChange(inputValue);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.target.blur();
      }
    };

    return (
      <div
        className={`day-cell ${showTodayIndicator ? 'relative' : ''} ${getProgressColor(
          minutes,
          weeklyGoalHours
        )} ${isToday && showTodayIndicator ? 'today' : ''} ${isPast ? 'past' : ''}`}
      >
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="minute-input"
          placeholder=""
        />
        {isToday && showTodayIndicator && (
          <span className="absolute right-[2px] bottom-[1px] text-[0.5rem] opacity-50 text-gray-500 pointer-events-none select-none">
            min
          </span>
        )}
      </div>
    );
  };

  // Save pending changes before unload
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      if (pendingUpdates.size > 0) {
        console.log('💾 Saving pending changes before unload', {
          pendingUpdates: Array.from(pendingUpdates),
          pendingChanges: pendingChangesRef.current
        });

        // Cancel any pending debounced updates
        debouncedUpdate.cancel();

        // Save all pending changes
        const promises = Array.from(pendingUpdates).map(activityId => {
          const changes = pendingChangesRef.current[activityId];
          if (changes) {
            return updateActivity(activityId, changes, 'unload');
          }
        });

        try {
          await Promise.all(promises);
          console.log('✅ Successfully saved all pending changes before unload');
        } catch (error) {
          console.error('❌ Error saving pending changes before unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also clean up any pending debounced calls
      debouncedUpdate.cancel();
    };
  }, [pendingUpdates]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      day: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      date: date.getDate()
    };
  };

  const getMonthDisplay = () => {
    const weekDates = getWeekDates();
    const firstDate = weekDates[0];
    const lastDate = weekDates[6];

    const formatYear = (date) => {
      return `'${date.getFullYear().toString().slice(2)}`;
    };

    if (firstDate.getMonth() === lastDate.getMonth()) {
      return `${firstDate.toLocaleString('default', { month: 'short' })} ${formatYear(firstDate)}`;
    }

    if (firstDate.getFullYear() === lastDate.getFullYear()) {
      return `${firstDate.toLocaleString('default', { month: 'short' })} - ${lastDate.toLocaleString('default', { month: 'short' })} ${formatYear(firstDate)}`;
    }

    return `${firstDate.toLocaleString('default', { month: 'short' })} ${formatYear(firstDate)} - ${lastDate.toLocaleString('default', { month: 'short' })} ${formatYear(lastDate)}`;
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

    const goalHours = parseFloat(newActivityWeeklyGoalHours);
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
            days: Array(getDaysInMonth(date)).fill(0)
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
      setNewActivityWeeklyGoalHours('');
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
        `${API_BASE_URL}/activities/${editingActivity.id}`,
        updatedActivity
      );
      const newActivities = activities.map(a =>
        a.id === editingActivity.id ? response.data : a
      );
      setActivities(newActivities);
      setEditingActivity(null);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const handleDeleteActivity = async () => {
    if (!editingActivity) return;
    
    try {
      const activityId = editingActivity.id;
      
      // Clear any pending updates for this activity
      setPendingUpdates(prev => {
        const newSet = new Set(prev);
        newSet.delete(activityId);
        return newSet;
      });
      delete pendingChangesRef.current[activityId];
      delete saveAttemptsRef.current[activityId];
      
      // Delete the activity
      await axios.delete(`${API_BASE_URL}/activities/${activityId}`);
      
      // Update local state
      const newActivities = activities.filter(a => a.id !== activityId);
      setActivities(newActivities);
      setEditingActivity(null);
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  // Add periodic check for stuck updates
  useEffect(() => {
    const checkStuckUpdates = () => {
      if (pendingUpdates.size > 0) {
        console.log('🔍 Checking for stuck updates', {
          pendingUpdates: Array.from(pendingUpdates),
          pendingChanges: pendingChangesRef.current
        });

        // Force save any updates that have been pending for too long
        Array.from(pendingUpdates).forEach(activityId => {
          const changes = pendingChangesRef.current[activityId];
          if (changes) {
            updateActivity(activityId, changes, 'stuck-check');
          }
        });
      }
    };

    const interval = setInterval(checkStuckUpdates, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [pendingUpdates]);

  // Clean up debounced function on component unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

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

  const isPendingSave = pendingUpdates.size > 0;
  return (
    <div className="container">
      <div className="header">
        <div className="title-section">
          <BrandText size="large" />
        </div>
        <div className="flex items-center gap-3">
          <button
            className="add-button"
            onClick={() => setShowDateRangeModal(true)}
            title="Download CSV"
          >
            <Download size={16} />
          </button>
          <button className="add-button" onClick={() => setShowAddForm(!showAddForm)}>
            +
          </button>
          <button
            className="text-sm text-gray-600 hover:text-gray-800"
            onClick={logout}
          >
            <LogOut className="text-sm text-gray-600 hover:text-gray-800" size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="card error-message">
          <div className="p-4 text-center text-red-600">{error}</div>
        </div>
      )}

      {showAddForm && (
        <>
          <div className="card mb-2">
            <div className="w-full text-center">
              <h2 className="text-xl font-medium bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                Add New Activity
              </h2>
            </div>
          </div>
          <div className="card add-form">
            <div className="flex space-x-3 w-full">
              <input
                type="text"
                placeholder={isMobile ? "name" : "Activity Name"}
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                className="block w-[40%] py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <input
                type="text"
                placeholder={isMobile ? "desc." : "Description"}
                value={newActivityDescription}
                onChange={(e) => setNewActivityDescription(e.target.value)}
                className="block w-[35%] py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <input
                type="number"
                placeholder={isMobile ? "hr/wk" : "Hours per week"}
                value={newActivityWeeklyGoalHours}
                onChange={(e) => setNewActivityWeeklyGoalHours(e.target.value)}
                className="block w-[15%] py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                min="0"
                step="0.5"
              />
              <button
                onClick={addActivity}
                disabled={isSubmitting}
                className="block w-[10%] py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-center text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '...' : 'Add'}
              </button>
            </div>
          </div>
        </>
      )}

      {!loading && activities.length === 0 && !showAddForm && (
        <div className="text-center py-8 px-4">
          <div className="text-lg font-medium mb-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">Welcome to Momentum!</div>
          <div className="text-sm text-gray-500 mb-8">A place to track and manage your weekly activities</div>
          <div className="text-gray-600">Click the <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text font-bold">+</span> button top right to add your first activity</div>
        </div>
      )}

      {(activities.length > 0 || loading) && (
        <div className="activities-grid">
          <div className="week-headers">
            <div className="month-navigation">
                <button className="nav-button" onClick={() => changeWeek(-1)}>←</button>
                <span className="current-month">{getMonthDisplay()}</span>
                <button className="nav-button" onClick={() => changeWeek(1)}>→</button>
            </div>
            {/* <div className="activity-header"></div> */}
            {weekDates.map((date) => {
              const { day, date: dateNum } = formatDateHeader(date);
              return (
                <div key={date.toISOString()} className="day-header">
                  <div>{day}</div>
                  <div>{dateNum}</div>
                </div>
              );
            })}
            <div className="status-header"></div>
            <div className="settings-header"></div>
          </div>

          {activities.map((activity, activityIndex) => {
            const progress = calculateProgress(activity);
            const expectedProgress = calculateExpectedProgress(weekDates);
            const progressColorClass = getProgressColor(progress, 100);

            const getPastWeekDates = (weeksAgo) => {
              return weekDates.map(date => {
                const newDate = new Date(date);
                newDate.setDate(date.getDate() - (7 * weeksAgo));
                return newDate;
              });
            };

            return (
              <div key={activity.id}>
                <div className="card activity-row">
                  <div className="activity-info">
                    <div className="activity-name-container">
                      <div className="activity-name">{activity.name}</div>
                      {activity.description && (
                        <div className="activity-tooltip">
                          {activity.description}
                        </div>
                      )}
                    </div>
                    <div className="activity-goal">
                      <span className="goal-text">goal </span>{activity.weeklyGoalHours} hr / wk
                    </div>
                  </div>

                  {/* --- Current week day cells using DayCell component --- */}
                  {weekDates.map((date) => {
                    const monthKey = formatMonthKey(date);
                    const dayIndex = getDayIndex(date);
                    const minutes = activity.history[monthKey]?.days[dayIndex] || 0;
                    const isToday = date.toDateString() === today.toDateString();
                    const isPast = isPastDay(new Date(date));

                    return (
                      <DayCell
                        key={date.toISOString()}
                        date={date}
                        minutes={minutes}
                        weeklyGoalHours={activity.weeklyGoalHours}
                        isToday={isToday}
                        isPast={isPast}
                        onChange={(newVal) => handleMinutesChange(activityIndex, date, newVal)}
                        showTodayIndicator={true}
                      />
                    );
                  })}

                  <div className="status-cell">
                    {getStatusEmoji(progress, 100)}
                    <span className={`progress-text `}>
                      {Math.ceil(progress)}%
                    </span>
                  </div>
                  <div className="settings-cell">
                  <button
                      className="settings-button expand-button"
                      onClick={() => setExpandedActivities(prev => ({
                        ...prev,
                        [activity.id]: !prev[activity.id]
                      }))}
                    >
                      {expandedActivities[activity.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button
                      className="settings-button"
                      onClick={() => setEditingActivity(activity)}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                {/* --- Past weeks rows using DayCell component --- */}
                {expandedActivities[activity.id] && [1, 2, 3].map(weeksAgo => {
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
                          <DayCell
                            key={date.toISOString()}
                            date={date}
                            minutes={minutes}
                            weeklyGoalHours={activity.weeklyGoalHours}
                            isToday={false}
                            isPast={isPast}
                            onChange={(newVal) => handleMinutesChange(activityIndex, date, newVal)}
                            showTodayIndicator={false}
                          />
                        );
                      })}

                      <div className="status-cell">
                        {getStatusEmoji(weekProgress, 100)}
                        <span className={`progress-text`}>
                          {Math.ceil(weekProgress)}%
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
      )}

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