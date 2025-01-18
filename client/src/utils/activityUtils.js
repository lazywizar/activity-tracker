import { SmileEmoji, MehEmoji, FrownEmoji } from '../components/icons/EmojiIcons';

export const isPastDay = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

export const calculateExpectedProgress = (weekDates) => {
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

export const getStatusEmoji = (progress, goal) => {
  if (progress >= goal) {
    return '🏆'; // Trophy for achieving goal
  } else if (progress >= goal * 0.8) {
    return '🌳'; // Full tree with fruits
  } else if (progress >= goal * 0.5) {
    return '🌿'; // Leafy plant with multiple leaves
  } else if (progress >= goal * 0.01) {
    return '🌱'; // Sprouting seed
  } else {
    return '🌰'; // Seed
  }
};

export const getProgressColor = (actualProgress, expectedProgress) => {
  const progressRatio = actualProgress / (expectedProgress || 1);

  if (progressRatio >= 0.9) return 'text-green-600';
  if (progressRatio >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
};

export const generateDateRange = (startDate, endDate) => {
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

export const formatDateForCSV = (date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatMonthKey = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const getDayIndex = (date) => {
  return date.getDate() - 1;
};

export const getPastWeekDates = (weeksAgo) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate the start of the week weeksAgo weeks ago
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (today.getDay() + 7 * weeksAgo));

  // Generate dates for that week
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }

  return dates;
};

export const calculateProgress = (activity, weekDates) => {
  if (!activity || !weekDates) return 0;

  let totalMinutes = 0;
  weekDates.forEach(date => {
    const monthKey = formatMonthKey(date);
    const dayIndex = getDayIndex(date);
    totalMinutes += activity.history[monthKey]?.days[dayIndex] || 0;
  });

  return (totalMinutes / (activity.weeklyGoalHours * 60)) * 100;
};

export const formatDateHeader = (date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    day: days[date.getDay()],
    date: date.getDate()
  };
};
