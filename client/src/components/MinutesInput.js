import React from 'react';

const MinutesInput = ({ value, onChange, isFirstColumn = false, isToday = false, isHistorical = false }) => {
  return (
    <div className="relative w-full">
      <input
        type="number"
        value={value}
        onChange={onChange}
        className={`minute-input w-full text-right ${isToday ? 'pr-4' : 'pr-1'} ${isHistorical ? 'text-sm' : ''}`}
        placeholder=""
        min="0"
        max="999"
        aria-label="Duration in minutes"
      />
      {isFirstColumn && !isHistorical && (
        <div className="absolute -top-4 left-0 text-xs text-gray-500 font-medium">
          mins
        </div>
      )}
      {isToday && !isHistorical && (
        <div className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[9px] text-gray-400 pointer-events-none">
          min
        </div>
      )}
    </div>
  );
};

export default MinutesInput;
