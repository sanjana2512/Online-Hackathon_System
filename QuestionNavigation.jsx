// src/components/QuestionNavigation.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useTest } from '../TestContext'; // Changed from useQuiz
import { allQuestions } from '../data';
import { styles } from '../styles';

function QuestionNavigation() {
  const { userAnswers, endTestGracefully } = useTest();
  const navigate = useNavigate();

  const handleSubmitTest = () => {
    if (window.confirm('Are you sure you want to submit your test? You cannot make changes after submission.')) {
      endTestGracefully();
    }
  };

  return (
    <nav style={styles.bottomNav}>
      {allQuestions.map((q) => (
        <NavLink
          key={q.id}
          // All questions are now under /test/question/:id
          to={`/test/question/${q.id}`}
          style={({ isActive }) => ({
            ...styles.navButton,
            // Style if this is the *active* question
            ...(isActive ? styles.navButtonActive : {}),
            // Style if this question has been *answered*
            ...(userAnswers[q.id] ? styles.navButtonAnswered : {}),
          })}
        >
          {q.id}
        </NavLink>
      ))}
      <button onClick={handleSubmitTest} style={styles.submitTestButton}> {/* Changed to button for handler */}
        Submit Test
      </button>
    </nav>
  );
}

export default QuestionNavigation;