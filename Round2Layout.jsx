// src/components/Round2Layout.jsx
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Round2QuestionNavigation from './Round2QuestionNavigation'; 
import Timer from './Timer';
import { useRound2Test } from '../Round2TestContext'; 
import { styles } from '../styles';

function Round2Layout() {
  // --- ★★★ 1. GET 'timeLeft' FROM THE R2 HOOK ★★★ ---
  const { testStarted, testEnded, isLoadingQuestions, timeLeft } = useRound2Test();
  const navigate = useNavigate();

  // Protect this route: if test not started, redirect to home
  useEffect(() => {
    if (!testStarted && !testEnded) {
      navigate('/', { replace: true });
    }
    // testEnded logic is now handled in the context's endTestGracefully
  }, [testStarted, testEnded, navigate]);

  if (!testStarted) {
    // Render nothing or a loading spinner while redirecting
    return null;
  }

  return (
    <div style={styles.quizContainer}>
      <div style={styles.headerBar}>
        <h1 style={styles.quizTitle}>Hackathon Round 2 Test</h1>
        {/* --- ★★★ 2. PASS 'timeLeft' AS A PROP ★★★ --- */}
        <Timer timeLeft={timeLeft} />
      </div>
      
      {isLoadingQuestions ? (
        <div style={styles.loadingContainer}>Loading Questions...</div>
      ) : (
        <>
          <div style={styles.questionArea}>
            <Outlet /> {/* Renders Round2QuestionDisplay */}
          </div>
          <Round2QuestionNavigation />
        </>
      )}
    </div>
  );
}

export default Round2Layout;