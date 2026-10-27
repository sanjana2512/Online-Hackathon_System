import React from 'react';
import { Outlet } from 'react-router-dom';
import QuestionNavigation from './QuestionNavigation';
import { styles } from '../styles';

// This holds the main structure: the question area (Outlet) and the navigation
function QuizLayout() {
  return (
    <div style={styles.quizContainer}>
      {/* Outlet renders the active nested route (QuestionDisplay or Results) */}
      <div style={styles.questionArea}>
        <Outlet />
      </div>

      {/* The bottom navigation bar */}
      <QuestionNavigation />
    </div>
  );
}

export default QuizLayout;