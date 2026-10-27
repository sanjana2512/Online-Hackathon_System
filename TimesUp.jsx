import React from 'react';
import { styles } from '../styles';
import TestHeader from './TestHeader';
import { Link } from 'react-router-dom';
import { exitFullscreen } from '../utils/fullscreen'; // Import fullscreen helper

function TimesUp() {
  return (
    <div style={styles.quizContainer}>
      {/* 1. Add the TestHeader */}
      <TestHeader />
      
      {/* This div will now correctly fill the space */}
      <div style={styles.timesUpContainer}>
        <h1 style={styles.timesUpTitle}>⏰ Time's Up! ⏰</h1>
        <p style={styles.timesUpMessage}>
          Your Round 1 test has been automatically submitted.
          <br />
          Results will be announced soon!
        </p>
        
        {/* 2. Change button to a Link and add onClick */}
        <Link 
          to="/" 
          style={styles.restartButton} 
          onClick={exitFullscreen}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default TimesUp;