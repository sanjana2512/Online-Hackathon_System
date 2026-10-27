import React, { useState, useEffect } from 'react';
import { useTest } from '../TestContext';
import { useAuth } from '../AuthContext';
import { styles } from '../styles';
import axios from 'axios';
import TestHeader from './TestHeader';
import { enterFullscreen } from '../utils/fullscreen'; // Import fullscreen helper

const API_URL = 'https://hackathonwebsite-2bxd.onrender.com/api';

function StartTest() {
  const { startTest, testStarted } = useTest();
  const { user } = useAuth();

  const [round1Active, setRound1Active] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRound1Status = async () => {
      try {
        setLoadingStatus(true);
        const res = await axios.get(`${API_URL}/public/publish-status`);
        setRound1Active(res.data.round1Active);
      } catch (err) {
        console.error("Error fetching round 1 status:", err);
        setError("Failed to load test status. Please try again later.");
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchRound1Status();
  }, []);

  // New handler to trigger fullscreen before starting the test
  const handleStartTest = async () => {
    enterFullscreen(); // Trigger fullscreen
    await startTest(); // Then, run the original startTest logic
  };

  if (testStarted) {
    // This component will redirect, but good practice to wrap it too
    return (
      <div style={styles.quizContainer}>
        <TestHeader />
        <div style={styles.startTestContainer}>
          <p>Test is already running...</p>
        </div>
      </div>
    );
  }

  // --- 2. WRAP ALL RETURN STATEMENTS in the layout ---
  if (loadingStatus) {
    return (
      <div style={styles.quizContainer}>
        <TestHeader />
        <div style={styles.startTestContainer}>Loading test status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.quizContainer}>
        <TestHeader />
        <div style={styles.startTestContainer}>
          {/* Use theme color for error */}
          <p style={{ color: styles.startTestWarning.color }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    // --- 3. WRAP THE MAIN RETURN in the layout ---
    <div style={styles.quizContainer}>
      <TestHeader />
      {/* This div now correctly fills the space because its parent is quizContainer */}
      <div style={styles.startTestContainer}>
        <h1 style={styles.startTestTitle}>Hackathon Screening Round</h1>
        <p style={styles.startTestObjective}>
          Objective: Screening round with MCQs, aptitude, and basic coding questions.
        </p>
        <p style={styles.startTestInfo}>Mode: Online</p>
        <p style={styles.startTestInfo}>Date: January 2026 (Second Week)</p>
        <p style={styles.startTestWarning}>
          Top performers securing 50% marks or ranking in the top 75% will qualify for Round 2.
        </p>

        {user?.testCompleted ? (
          // Use theme color for warning
          <p style={{ color: styles.startTestWarning.color, fontWeight: 'bold', marginTop: '20px' }}>
            You have already completed the test. You cannot take it again.
          </p>
        ) : (
          // Conditional rendering based on round1Active
          round1Active ? (
            <button onClick={handleStartTest} style={styles.startButton}> {/* Use the new handler */}
              Start Test
            </button>
          ) : (
            // Use theme color for "not active" message
            <p style={{ color: styles.timerDisplay.background, fontWeight: 'bold', marginTop: '20px' }}>
              Round 1 is not yet active. Please check back later!
            </p>
          )
        )}

        <p style={styles.startTestTimerInfo}>
          You will have 1 hour and 30 minutes to complete all sections.
        </p>
      </div>
    </div>
  );
}

export default StartTest;