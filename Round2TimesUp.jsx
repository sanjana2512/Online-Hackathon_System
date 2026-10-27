import React from 'react';
import { styles } from '../styles';
import TestHeader from './TestHeader';
import { Link } from 'react-router-dom';
import { exitFullscreen } from '../utils/fullscreen'; // Import fullscreen helper

function Round2TimesUp() {
  return (
    <div style={styles.quizContainer}>
      {/* Use a custom title for the header */}
      <TestHeader title="Hackathon Round 2" />
      
      {/* This div will now correctly fill the space */}
      <div style={styles.timesUpContainer}>
        <h1 style={styles.timesUpTitle}>⏰ Round 2 Time's Up! ⏰</h1>
        <p style={styles.timesUpMessage}>
          Your Round 2 test has been automatically submitted.
          <br />
          Finalists for Round 3 will be announced soon.
        </p>
        
        {/* --- USE LINK TO GO HOME --- */}
        {/* Add onClick handler to exit fullscreen when link is clicked */}
        <Link to="/" style={styles.restartButton} onClick={exitFullscreen}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Round2TimesUp;