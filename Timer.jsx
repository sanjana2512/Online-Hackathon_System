import React from 'react';
import { styles } from '../styles';

// --- Timer component now accepts timeLeft as a prop ---
function Timer({ timeLeft }) {

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const pad = (num) => String(num).padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  };

  // --- STYLES UPDATED TO MATCH THEME ---
  const timerStyle = {
    ...styles.timerDisplay,
    // Check if time is low (10 minutes = 600 seconds)
    ...(timeLeft <= 600 && {
      backgroundColor: styles.startTestWarning.color, // Use theme's bright red
      color: '#ffffff', // Use white text on red
    }),
  };

  return <div style={timerStyle}>{formatTime(timeLeft)}</div>;
}

export default Timer;