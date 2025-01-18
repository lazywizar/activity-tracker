import React, { useState } from 'react';
import { X } from 'lucide-react';

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

export default DateRangeModal;
