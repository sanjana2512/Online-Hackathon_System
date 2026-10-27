import React from 'react';
import { useRound2Test } from '../Round2TestContext';
import { styles } from '../styles';
import TestHeader from './TestHeader';
import { Link } from 'react-router-dom';
import { exitFullscreen } from '../utils/fullscreen'; // Import fullscreen helper

function Round2Results() {
  const { 
    finalScore, // We still need this to know when scoring is done
    isLoadingQuestions 
  } = useRound2Test();

  // Show a loading/calculating message while the backend is scoring
  if (isLoadingQuestions || finalScore === null) {
    return (
      <div style={styles.quizContainer}>
        {/* Use a custom title for the header */}
        <TestHeader title="Hackathon Round 2" /> 
        <div style={styles.resultsContainer}>
          <h1 style={styles.startTestTitle}>Calculating Round 2 Results...</h1>
          <p style={{...styles.startTestObjective, fontSize: '1.2em'}}>
            Please wait while we submit your test.
          </p>
          {/* Use restartButton style for consistency */}
          <button style={styles.restartButton} disabled>
            Submitting...
          </button>
        </div>
      </div>
    );
  }

  // --- 3. NEW SIMPLIFIED DISPLAY ---
  return (
    <div style={styles.quizContainer}>
      <TestHeader title="Hackathon Round 2" />
      <div style={styles.resultsContainer}>
        <h1 style={styles.startTestTitle}>Test Submitted!</h1>
        {/* Use theme text colors */}
        <p style={{...styles.startTestObjective, fontSize: '1.2em'}}>
          Thank you for participating in Round 2.
          <br />
          Finalists for Round 3 will be announced soon!
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

export default Round2Results;