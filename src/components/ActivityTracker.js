import React, { useState, useEffect } from 'react';

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

function ActivityTracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities, setActivities] = useState([
    {
      name: 'Reading',
      weeklyGoalHours: 10,
      history: {}
    },
    {
      name: 'Exercise',
      weeklyGoalHours: 8,
      history: {}
    },
    {
      name: 'Meditation',
      weeklyGoalHours: 5,
      history: {}
    }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityGoal, setNewActivityGoal] = useState('');

  useEffect(() => {
    initializeHistory();
  }, []);

  const initializeHistory = () => {
    const newActivities = activities.map(activity => ({
      ...activity,
      history: {
        ...activity.history,
        [formatMonthKey(currentDate)]: {
          days: Array(getDaysInMonth(currentDate)).fill(0)
        }
      }
    }));
    setActivities(newActivities);
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

  const handleMinutesChange = (activityIndex, dayIndex, minutes) => {
    const newActivities = [...activities];
    const monthKey = formatMonthKey(currentDate);

    if (!newActivities[activityIndex].history[monthKey]) {
      newActivities[activityIndex].history[monthKey] = {
        days: Array(getDaysInMonth(currentDate)).fill(0)
      };
    }

    newActivities[activityIndex].history[monthKey].days[dayIndex] = parseInt(minutes) || 0;
    setActivities(newActivities);
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

  const addActivity = () => {
    if (newActivityName && newActivityGoal) {
      setActivities([
        ...activities,
        {
          name: newActivityName,
          weeklyGoalHours: parseInt(newActivityGoal),
          history: {
            [formatMonthKey(currentDate)]: {
              days: Array(getDaysInMonth(currentDate)).fill(0)
            }
          }
        }
      ]);
      setNewActivityName('');
      setNewActivityGoal('');
      setShowAddForm(false);
    }
  };

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
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActivityTracker;