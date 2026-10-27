import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import QuestionNavigation from './QuestionNavigation';
import Timer from './Timer';
import { useTest } from '../TestContext';
import { styles } from '../styles';

function TestLayout() {
  // --- ★★★ 1. GET 'timeLeft' FROM THE CONTEXT ★★★ ---
  const { testStarted, testEnded, isLoadingQuestions, timeLeft } = useTest();
  const navigate = useNavigate();

  // Protect this route: if test not started, redirect to home
  useEffect(() => {
    if (!testStarted && !testEnded) {
      navigate('/', { replace: true });
    } else if (testEnded) {
      // This logic is now handled in TestContext
      // navigate('/times-up', { replace: true });
    }
  }, [testStarted, testEnded, navigate]);

  if (!testStarted) {
    // Render nothing or a loading spinner while redirecting
    return null;
  }

  return (
    <div style={styles.quizContainer}>
      <div style={styles.headerBar}>
        <h1 style={styles.quizTitle}>Hackathon Screening Test</h1>
        {/* --- ★★★ 2. PASS 'timeLeft' AS A PROP ★★★ --- */}
        <Timer timeLeft={timeLeft} />
      </div>
      
      {isLoadingQuestions ? (
        <div style={styles.loadingContainer}>Loading Questions...</div>
      ) : (
        <>
          <div style={styles.questionArea}>
            <Outlet /> {/* Renders QuestionDisplay */}
          </div>
          <QuestionNavigation />
        </>
      )}
    </div>
  );
}

export default TestLayout;