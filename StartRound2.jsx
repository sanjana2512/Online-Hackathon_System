import React from 'react';
import { useRound2Test } from '../Round2TestContext'; 
import { useAuth } from '../AuthContext';
import { styles } from '../styles';
import TestHeader from './TestHeader';
import { enterFullscreen } from '../utils/fullscreen'; // Import fullscreen helper

function StartRound2() {
  const { startTest, testStarted } = useRound2Test();
  const { user } = useAuth();

  // New handler to trigger fullscreen before starting the test
  const handleStartTestR2 = async () => {
    enterFullscreen(); // Trigger fullscreen
    await startTest(); // Then, run the original startTest logic
  };

  if (testStarted) {
    return (
      <div style={styles.quizContainer}>
        <TestHeader />
        <div style={styles.startTestContainer}>
          <p>Round 2 Test is already running...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.quizContainer}>
      <TestHeader />
      <div style={styles.startTestContainer}>
        {/* --- UPDATE TEXT FOR R2 --- */}
        <h1 style={styles.startTestTitle}>Hackathon Round 2</h1>
        <p style={styles.startTestObjective}>
          Objective: Solve advanced problem statements based on coding and AI/ML application.
        </p>
        <p style={styles.startTestInfo}>Mode: Online</p>
        <p style={styles.startTestInfo}>Date: February 2026 (First week)</p>
        <p style={styles.startTestWarning}>
          This is the final online round. Good luck!
        </p>

        {/* --- CHECK THE R2 COMPLETED FLAG --- */}
        {user?.round2TestCompleted ? (
          // Use theme color for warning
          <p style={{ color: styles.startTestWarning.color, fontWeight: 'bold', marginTop: '20px' }}>
            You have already completed Round 2. You cannot take it again.
          </p>
        ) : (
          <button onClick={handleStartTestR2} style={styles.startButton}> {/* Use the new handler */}
            Start Round 2 Test
          </button>
        )}

        <p style={styles.startTestTimerInfo}>
          You will have 2 hours to complete this section.
        </p>
      </div>
    </div>
  );
}

export default StartRound2;