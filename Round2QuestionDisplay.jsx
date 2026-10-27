// src/components/Round2QuestionDisplay.jsx
import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
// --- ★★★ 1. IMPORT THE R2 HOOK ★★★ ---
import { useRound2Test } from '../Round2TestContext';
import { styles } from '../styles';
import axios from 'axios';

// --- AceEditor Imports ---
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-tomorrow_night"; // Switched to a dark theme
import "ace-builds/src-noconflict/ext-language_tools";


const API_URL = 'https://hackathonwebsite-2bxd.onrender.com/api';

// Helper to map Judge0 language IDs to Ace editor modes
const getAceMode = (languageId) => {
  switch (languageId) {
    case 63: return "javascript";
    case 71: return "python";
    default: return "text";
  }
};


function Round2QuestionDisplay() {
  const { questionId } = useParams();
  // --- ★★★ 2. USE THE R2 HOOK ★★★ ---
  const { userAnswers, handleAnswer, allQuestions, isLoadingQuestions } = useRound2Test();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const question = allQuestions.find(
    (q) => q.questionId === parseInt(questionId)
  );
  // --- ★★★ 3. GET THE CORRECT INITIAL CODE ★★★ ---
  // If user has not typed, use the starterCode from the question
  const currentAnswer = userAnswers[question?.questionId] ?? (question?.starterCode || "");

  const handleCodeChange = (newValue) => {
      handleAnswer(question.questionId, newValue);
  };

  const handleCodeSubmit = async () => {
    if (!question || !currentAnswer) return;

    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      // --- ★★★ 4. CALL THE R2 SUBMIT ROUTE ★★★ ---
      const res = await axios.post(`${API_URL}/test/round2/submit`, {
        questionId: question.questionId,
        code: currentAnswer,
        language_id: question.language_id,
      }, {
        headers: { 'x-auth-token': localStorage.getItem('token') } // Ensure auth
      });

      handleAnswer(`output_${question.questionId}`, res.data);
      setSubmissionResult(res.data);

    } catch (err) {
      console.error(err);
      const errorData = err.response?.data || { status: 'Error', output: 'Could not connect to server.' };
      setSubmissionResult(errorData);
      handleAnswer(`output_${question.questionId}`, errorData);
    }
    setIsSubmitting(false);
  };

  // --- RENDER LOGIC ---

  if (isLoadingQuestions) {
    return <div style={styles.loadingContainer}>Loading Questions...</div>;
  }

  if (!question) {
    // --- ★★★ 5. NAVIGATE TO R2 START QUESTION ★★★ ---
    return <Navigate to="/round2/test/question/11" replace />;
  }

  const currentOutput = submissionResult || userAnswers[`output_${question.questionId}`];

  let optionsContent;
  switch (question.type) {
    case 'mcq':
    case 'aptitude':
      optionsContent = (
        <div style={styles.textOptionsContainer}>
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(question.questionId, option)}
              style={{
                ...styles.textOptionButton,
                ...(userAnswers[question.questionId] === option ? styles.optionSelected : {}),
              }}
            >
              {option}
            </button>
          ))}
        </div>
      );
      break;

    case 'coding':
      optionsContent = (
        // Apply flex column directly to the content wrapper for coding questions
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          {/* AceEditor wrapped in a div to control flex grow */}
          <div style={styles.aceEditorContainer}>
             <AceEditor
                mode={getAceMode(question.language_id)}
                theme="tomorrow_night" // Using a dark theme
                onChange={handleCodeChange}
                value={currentAnswer}
                name={`code-editor-${question.questionId}`}
                editorProps={{ $blockScrolling: true }}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: true,
                  showLineNumbers: true,
                  tabSize: 2,
                  fontSize: 14 // Slightly larger font
                }}
                style={{ // Ensure editor fills its container
                  width: '100%',
                  height: '100%',
                }}
             />
          </div>

          <button
            onClick={handleCodeSubmit}
            style={styles.submitCodeButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Running...' : 'Run Code'}
          </button>

          {(isSubmitting || currentOutput) && (
             <div style={styles.outputConsole}>
              <h3 style={{...styles.outputTitle,
                color: isSubmitting ? '#f0ad4e' /* Amber */ : (currentOutput?.status === 'Accepted' ? '#38a169' /* Green */ : '#e53e3e' /* Red */)
              }}>
                Status: {isSubmitting ? 'Processing...' : (currentOutput?.status || 'Error')}
              </h3>
              <pre style={styles.outputBody}>
                {isSubmitting ? 'Waiting for judge...' : (currentOutput?.output || '(No output)')}
              </pre>
            </div>
          )}
        </div>
      );
      break;

    default:
      optionsContent = <div>Unsupported question type.</div>;
  }

  return (
    <div style={styles.questionDisplayLayout}>
      {/* Left Pane: Question */}
      <div style={styles.leftPane}>
        <h2 style={styles.questionNumber}>
          Question {question.questionId} ({question.type.toUpperCase()})
        </h2>
        {/* Make question text scrollable if needed */}
        <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '10px' }}>
             <p style={{...styles.questionText, marginTop: 0}}> {/* Remove redundant marginTop */}
                 {question.question}
             </p>
        </div>

        {question.type === 'coding' && (
          <div style={styles.testCaseDisplay}>
            <h4>Example Test Case:</h4>
            {question.testCases.filter(tc => !tc.hidden).map((tc, index) => (
              <div key={index}>
                <p><strong>Input:</strong> {tc.input}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Pane: Options/Input */}
      <div style={styles.rightPane}>
        {optionsContent}
      </div>
    </div>
  );
}

export default Round2QuestionDisplay;