import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useTest } from '../TestContext';
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


function QuestionDisplay() {
  const { questionId } = useParams();
  const { userAnswers, handleAnswer, allQuestions, isLoadingQuestions } = useTest();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const question = allQuestions.find(
    (q) => q.questionId === parseInt(questionId)
  );
  
  // --- ★★★ 1. FIX: Use nullish coalescing (??) to allow starterCode to show ★★★ ---
  // This ensures that if userAnswers[id] is null/undefined, the starterCode is used.
  // The old code (|| "") prevented this.
  const currentAnswer = userAnswers[question?.questionId] ?? (question?.starterCode || "");

  const handleCodeChange = (newValue) => {
      handleAnswer(question.questionId, newValue);
  };

  const handleCodeSubmit = async () => {
    if (!question || !currentAnswer) return;

    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      const res = await axios.post(`${API_URL}/test/submit`, {
        questionId: question.questionId,
        code: currentAnswer,
        language_id: question.language_id,
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
    return <Navigate to="/test/question/1" replace />;
  }

  const currentOutput = submissionResult || userAnswers[`output_${question.questionId}`];

  let optionsContent;
  switch (question.type) {
    case 'mcq':
    case 'aptitude':
      optionsContent = (
        // --- ★★★ 2. WRAP IN A FRAGMENT ★★★ ---
        <>
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

          {/* --- ★★★ 3. ADD THIS BLOCK ★★★ --- */}
          {/* Show this button only if an answer exists for this question */}
          {userAnswers[question.questionId] && (
            <button
              onClick={() => handleAnswer(question.questionId, null)} // Set answer to null
              style={styles.clearSelectionButton} // Use style from styles.js
            >
              Clear Selection
            </button>
          )}
          {/* --- ★★★ END ADDITION ★★★ --- */}
        </>
      );
      break;

    case 'coding':
      optionsContent = (
        // (This part is unchanged)
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={styles.aceEditorContainer}>
             <AceEditor
                mode={getAceMode(question.language_id)}
                theme="tomorrow_night"
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
                  fontSize: 14
                }}
                style={{
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
                color: isSubmitting ? '#f0ad4e' : (currentOutput?.status === 'Accepted' ? '#38a169' : '#e53e3e')
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
      {/* Left Pane: Question (Unchanged) */}
      <div style={styles.leftPane}>
        <h2 style={styles.questionNumber}>
          Question {question.questionId} ({question.type.toUpperCase()})
        </h2>
        <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '10px' }}>
             <p style={{...styles.questionText, marginTop: 0}}>
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

export default QuestionDisplay;