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

  if (progressRatio >= 1.0) {
    return '🏆'; // Trophy for achieving goal
  } else if (progressRatio >= 0.75) {
    return '🌳'; // Full tree for great progress
  } else if (progressRatio >= 0.5) {
    return '🌿'; // Leafy plant for good progress
  } else if (progressRatio > 0) {
    return '🌱'; // Seedling for started
  } else {
    return '🌰'; // Seed for no progress
  }
};

export const getProgressColor = (actualProgress, expectedProgress) => {
  const progressRatio = actualProgress / (expectedProgress || 1);

  if (progressRatio >= 1.0) return 'text-green-600';
  if (progressRatio >= 0.75) return 'text-green-500';
  if (progressRatio >= 0.5) return 'text-yellow-600';
  if (progressRatio > 0) return 'text-yellow-500';
  return 'text-gray-400';
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
