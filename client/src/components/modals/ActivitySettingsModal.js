import React, { useState } from 'react';

const ActivitySettingsModal = ({ activity, onSave, onDelete, onClose }) => {
  const [name, setName] = useState(activity.name);
  const [description, setDescription] = useState(activity.description || '');
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
      await onSave({ ...activity, name, description, weeklyGoalHours: Number(weeklyGoalHours) });
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
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[80px] resize-y"
              placeholder="Add a description for this activity..."
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

export default ActivitySettingsModal;
