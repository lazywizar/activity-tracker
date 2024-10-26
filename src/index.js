import React from 'react';
import { createRoot } from 'react-dom/client';
import ActivityTracker from './components/ActivityTracker';
import './styles/styles.css';

const root = createRoot(document.getElementById('root'));
root.render(<ActivityTracker />);