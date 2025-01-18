import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import MinutesInput from './MinutesInput';
import {
  isPastDay,
  calculateProgress,
  getStatusEmoji,
  getProgressColor,
  formatMonthKey,
  getDayIndex,
  getPastWeekDates,
  formatDateHeader
} from '../utils/activityUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [pastWeeks, setPastWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateChartData = (activityData) => {
    // Get last 90 days
    const dates = [];
    const minutes = [];
    const today = new Date();
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const monthKey = formatMonthKey(date);
      const dayIndex = getDayIndex(date);
      
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      minutes.push(activityData.history[monthKey]?.days[dayIndex] || 0);
    }

    setChartData({
      labels: dates,
      datasets: [
        {
          label: 'Minutes',
          data: minutes,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  const generatePastWeeks = (activityData) => {
    const weeks = [];
    for (let i = 0; i < 12; i++) {
      const weekDates = getPastWeekDates(i);
      const weekProgress = calculateProgress(activityData, weekDates);
      weeks.push({
        dates: weekDates,
        progress: weekProgress
      });
    }
    setPastWeeks(weeks);
  };

  const handleMinutesChange = async (date, value) => {
    const monthKey = formatMonthKey(date);
    const dayIndex = getDayIndex(date);
    
    try {
      const token = localStorage.getItem('token');
      const updatedActivity = {
        ...activity,
        history: {
          ...activity.history,
          [monthKey]: {
            ...activity.history[monthKey],
            days: {
              ...activity.history[monthKey]?.days,
              [dayIndex]: parseInt(value) || 0
            }
          }
        }
      };

      await axios.put(
        `${process.env.REACT_APP_API_URL}/activities/${id}`,
        updatedActivity,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setActivity(updatedActivity);
      generateChartData(updatedActivity);
    } catch (error) {
      console.error('Error updating activity:', error);
      // Optionally show an error message to the user
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Daily Activity Minutes (Last 3 Months)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Minutes'
        }
      }
    }
  };

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/activities/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setActivity(response.data);
        generateChartData(response.data);
        generatePastWeeks(response.data);
      } catch (error) {
        console.error('Error fetching activity:', error);
        setError(error.response?.data?.message || 'Failed to load activity');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading activity data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!activity || !chartData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Activity not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/')}
          className="mr-4 hover:text-gray-600"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">{activity.name}</h1>
      </div>

      {activity.description && (
        <p className="text-gray-600 mb-6">{activity.description}</p>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="space-y-2">
        <div className="week-headers">
          <div className="activity-info">
            {/* Empty space for activity info column */}
          </div>
          {pastWeeks[0].dates.map((date) => {
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

        {pastWeeks.map((week, index) => {
          const weekProgress = week.progress;
          const weekProgressClass = getProgressColor(weekProgress, 100);

          return (
            <div key={index} className="card activity-row history-row">
              <div className="activity-info">
                <div className="activity-goal text-gray-500">
                  {week.dates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  -
                  {week.dates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>

              {week.dates.map((date) => {
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
                    <MinutesInput
                      value={minutes || ''}
                      onChange={(e) => handleMinutesChange(date, e.target.value)}
                      isFirstColumn={false}
                      isToday={false}
                      isHistorical={true}
                    />
                  </div>
                );
              })}

              <div className="status-cell">
                <span className="emoji">{getStatusEmoji(weekProgress, 100)}</span>
                <span className={`progress-text text-progress-${weekProgressClass}`}>
                  {weekProgress.toFixed(0)}%
                </span>
              </div>

              <div className="settings-cell">
                {/* Empty cell to maintain grid alignment */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActivityDetail;
