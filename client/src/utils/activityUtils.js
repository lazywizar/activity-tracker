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

  if (weekDates[6] < today) {
    return 100;
  }

  if (weekDates[0] > today) {
    return 0;
  }

  let daysPassed = 0;
  for (const date of weekDates) {
    date.setHours(0, 0, 0, 0);
    if (date <= today) {
      daysPassed++;
    }
  }

  return (daysPassed / 7) * 100;
};

export const getStatusEmoji = (progress, expectedProgress) => {
  const progressRatio = progress / (expectedProgress || 1);

  if (progressRatio >= 0.9) {
    return <SmileEmoji color="#22c55e" />; // green
  } else if (progressRatio >= 0.6) {
    return <MehEmoji color="#eab308" />; // yellow
  } else {
    return <FrownEmoji color="#ef4444" />; // red
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
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

export const formatDateForCSV = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
