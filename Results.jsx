import React from 'react';
import { useTest } from '../TestContext';
import { styles } from '../styles';
import TestHeader from './TestHeader';
import { Link } from 'react-router-dom';
import { exitFullscreen } from '../utils/fullscreen'; // Import fullscreen helper

function Results() {
  const { 
    finalScore, // We still need this to know when scoring is done
    isLoadingQuestions 
  } = useTest();

  // Show a loading/calculating message while the backend is scoring
  if (isLoadingQuestions || finalScore === null) {
    return (
      <div style={styles.quizContainer}>
        <TestHeader />
        {/* Use resultsContainer for consistent centering */}
        <div style={styles.resultsContainer}> 
          <h1 style={styles.startTestTitle}>Calculating Results...</h1>
          <p style={{...styles.startTestObjective, fontSize: '1.2em'}}>
            Please wait while we submit your test.
          </p>
          <button style={styles.restartButton} disabled>
            Submitting...
          </button>
        </div>
      </div>
    );
  }

  // --- ★★★ NEW SIMPLIFIED DISPLAY ★★★ ---
  return (
    <div style={styles.quizContainer}>
      <TestHeader />
      {/* Use resultsContainer for consistent centering */}
      <div style={styles.resultsContainer}>
        <h1 style={styles.startTestTitle}>Test Submitted!</h1>
        <p style={{...styles.startTestObjective, fontSize: '1.2em'}}>
          Thank you for participating in Round 1.
          <br />
          Results will be announced soon!
        </p>

        {/* --- Remove the entire Answer Review section --- */}
        
        {/* --- USE LINK TO GO HOME --- */}
        {/* Add onClick handler to exit fullscreen when link is clicked */}
        <Link to="/" style={styles.restartButton} onClick={exitFullscreen}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Results;