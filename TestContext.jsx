import React, { useState, useContext, createContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { exitFullscreen } from './utils/fullscreen'; // Import fullscreen helper
import { FaceProctor } from './components/FaceProctor'; // Import FaceProctor

const TestContext = createContext();
const TEST_DURATION_SECONDS = 90 * 60;
const API_URL = 'https://hackathonwebsite-2bxd.onrender.com/api'; // ✅ unified base URL

export function TestProvider({ children }) {
  const navigate = useNavigate();
  const [userAnswers, setUserAnswers] = useState({});
  const [testStarted, setTestStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [testEnded, setTestEnded] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [finalScore, setFinalScore] = useState(null);

  const timerRef = useRef(null);
  const { user, loadUser } = useAuth(); // ✅ from your AuthContext

  // Timer logic & Visibility Change
  useEffect(() => {
    // --- 1. ADD THIS EVENT HANDLER ---
    const handleVisibilityChange = () => {
      // document.hidden is true if the tab is not active
      if (document.hidden) {
        // Only end the test if it's currently running
        if (timerRef.current && !testEnded) { // Check if timer is running and test not ended
          endTestGracefully(true, 'You left the test tab.'); // Auto-submit with reason
        }
      }
    };
    // --- END OF NEW HANDLER ---

    if (testStarted && !testEnded) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            endTestGracefully(true, 'Time is up.'); // auto-submit with reason
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      // --- 2. ADD THE EVENT LISTENER ---
      document.addEventListener('visibilitychange', handleVisibilityChange);

    } else if (testEnded) {
      clearInterval(timerRef.current);
      timerRef.current = null; // Clear timerRef
      // --- 3. REMOVE THE LISTENER (cleanup) ---
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }

    // --- 4. UPDATE THE RETURN CLEANUP ---
    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [testStarted, testEnded]); // Dependencies are correct

  // ✅ Fetch questions from backend
  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const res = await axios.get(`${API_URL}/test/questions`);
      setAllQuestions(res.data);
      setIsLoadingQuestions(false);
    } catch (err) {
      console.error('Failed to fetch questions', err);
      setIsLoadingQuestions(false);
    }
  };

  // ✅ Start test (merged logic)
  const startTest = async () => {
    if (user?.testCompleted) {
      alert('You have already completed the test.');
      return;
    }

    try {
      // Step 1: Mark test as completed
      await axios.patch(`${API_URL}/auth/mark-test-completed`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Step 2: Reload user info
      await loadUser();

      // Step 3: Fetch questions
      await fetchQuestions();

      // Step 4: Start the test locally
      setTestStarted(true);
      setTestEnded(false);
      setFinalScore(null);
      setTimeLeft(TEST_DURATION_SECONDS);
      setUserAnswers({});
      navigate('/test/question/1', { replace: true });
    } catch (error) {
      console.error('❌ Error starting test:', error);
      alert('Failed to start test. Please try again.');
    }
  };

  // ✅ End test gracefully (merged)
  // Modified to accept a reason
  const endTestGracefully = async (isTimeUp = false, reason = '') => {
    // --- 5. PREVENT DOUBLE-CALLS ---
    // Check if the test has already been marked as ended
    if (testEnded) return; // If already ended, do nothing.

    // Show reason alert
    if (reason) {
      alert(`The test is ending. Reason: ${reason}`);
    } else if (isTimeUp) {
      // This case is for the manual submit button
      // The 'isTimeUp' param is a bit misleading here, it just means "auto-submit"
      // We'll let the manual submit confirmation (from QuestionNavigation) be the only alert
    }

    exitFullscreen(); // Exit fullscreen when test ends
    clearInterval(timerRef.current);
    timerRef.current = null; // Clear timerRef
    setTestEnded(true); // Mark as ended *before* async calls

    // Only send MCQ & aptitude answers
    const mcqAnswers = {};
    for (const qId in userAnswers) {
      const question = allQuestions.find(q => q.questionId == qId);
      if (question && (question.type === 'mcq' || question.type === 'aptitude')) {
        mcqAnswers[qId] = userAnswers[qId];
      }
    }

    try {
      const res = await axios.post(`${API_URL}/test/end-test`, { mcqAnswers }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setFinalScore(res.data.round1Score || 0);
    } catch (err) {
      console.error('❌ Error submitting test:', err);
      setFinalScore(0);
    }

    // Navigate appropriately
    if (isTimeUp) {
      // This navigation is for any auto-submit (time's up, tab switch, proctor break)
      navigate('/times-up', { replace: true });
    } else {
      // This navigation is for manual submit
      navigate('/results', { replace: true });
    }
  };

  const handleAnswer = (questionId, answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const resetTest = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setTestStarted(false);
    setTestEnded(false);
    setFinalScore(null);
    setTimeLeft(TEST_DURATION_SECONDS);
    setUserAnswers({});
    setAllQuestions([]);
    navigate('/', { replace: true });
  };

  return (
    <TestContext.Provider
      value={{
        userAnswers,
        handleAnswer,
        testStarted,
        startTest,
        timeLeft,
        testEnded,
        endTestGracefully,
        resetTest,
        allQuestions,
        isLoadingQuestions,
        finalScore,
      }}
    >
      {/* Add the FaceProctor component here */}
      {/* It will only be active when the test is started */}
      {testStarted && !testEnded && (
        <FaceProctor 
          onRuleBreak={(reason) => endTestGracefully(true, reason)} 
        />
      )}
      
      {children}
    </TestContext.Provider>
  );
}

export function useTest() {
  return useContext(TestContext);
}