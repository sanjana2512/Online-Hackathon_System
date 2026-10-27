// src/components/Round2QuestionNavigation.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// --- ★★★ 1. IMPORT THE R2 HOOK ★★★ ---
import { useRound2Test } from '../Round2TestContext'; 
// (We remove the 'allQuestions' import from data.js)
import { styles } from '../styles';

function Round2QuestionNavigation() {
  // --- ★★★ 2. USE THE R2 CONTEXT (and get allQuestions) ★★★ ---
  const { userAnswers, endTestGracefully, allQuestions } = useRound2Test();
  const navigate = useNavigate();

  const handleSubmitTest = () => {
    if (window.confirm('Are you sure you want to submit your test? You cannot make changes after submission.')) {
      endTestGracefully(); // This now calls the R2 function
    }
  };

  return (
    <nav style={styles.bottomNav}>
      {/* --- ★★★ 3. MAP OVER QUESTIONS FROM CONTEXT ★★★ --- */}
      {allQuestions.map((q) => (
        <NavLink
          key={q.questionId} // Use questionId from backend
          // --- ★★★ 4. UPDATE LINK TO R2 ROUTE ★★★ ---
          to={`/round2/test/question/${q.questionId}`}
          style={({ isActive }) => ({
            ...styles.navButton,
            ...(isActive ? styles.navButtonActive : {}),
            ...(userAnswers[q.questionId] ? styles.navButtonAnswered : {}),
          })}
        >
          {q.questionId}
        </NavLink>
      ))}
      <button onClick={handleSubmitTest} style={styles.submitTestButton}>
        Submit Test
      </button>
    </nav>
  );
}

export default Round2QuestionNavigation;