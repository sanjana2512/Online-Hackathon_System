import React, { useState, useContext, createContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { exitFullscreen } from './utils/fullscreen'; // Import fullscreen helper
import { FaceProctor } from './components/FaceProctor'; // Import FaceProctor

const Round2TestContext = createContext();
const TEST_DURATION_SECONDS = 120 * 60; // 2 hours for Round 2
const API_URL = 'https://hackathonwebsite-2bxd.onrender.com/api';

export function Round2TestProvider({ children }) {
  const navigate = useNavigate();
  const [userAnswers, setUserAnswers] = useState({});
  const [testStarted, setTestStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [testEnded, setTestEnded] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [finalScore, setFinalScore] = useState(null);

  const timerRef = useRef(null);
  const { user, loadUser } = useAuth();

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

  // Fetch Round 2 questions
  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const res = await axios.get(`${API_URL}/test/round2/questions`);
      setAllQuestions(res.data);
      setIsLoadingQuestions(false);
    } catch (err) {
      console.error('Failed to fetch R2 questions', err);
      if (err.response?.status === 403) {
        alert(err.response.data.msg || 'You are not authorized for Round 2.');
        navigate('/', { replace: true });
      }
      setIsLoadingQuestions(false);
    }
  };

  // Start Round 2 test
  const startTest = async () => {
    if (user?.round2TestCompleted) { 
      alert('You have already completed Round 2.');
      return;
    }

    try {
      // Step 1: Fetch R2 questions
      await fetchQuestions();
      
      // Step 2: Start the test locally
      setTestStarted(true);
      setTestEnded(false);
      setFinalScore(null);
      setTimeLeft(TEST_DURATION_SECONDS);
      setUserAnswers({});
      navigate('/round2/test/question/11', { replace: true }); 

    } catch (error) {
      console.error('❌ Error starting R2 test:', error);
      alert('Failed to start Round 2 test. Please try again.');
    }
  };

  // End Round 2 test
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
    }

    exitFullscreen(); // Exit fullscreen when test ends
    clearInterval(timerRef.current);
    timerRef.current = null; // Clear timerRef
    setTestEnded(true); // Mark as ended *before* async calls

    const mcqAnswers = {}; 
    for (const qId in userAnswers) {
      const question = allQuestions.find(q => q.questionId == qId);
      if (question && (question.type === 'mcq' || question.type === 'aptitude')) {
        mcqAnswers[qId] = userAnswers[qId];
      }
    }

    try {
      // This call now marks the test as complete on the backend
      const res = await axios.post(`${API_URL}/test/round2/end-test`, { mcqAnswers });
      setFinalScore(res.data.round2Score || 0); 

      // This re-fetches the user data from the server.
      await loadUser();

    } catch (err) {
      console.error('❌ Error submitting R2 test:', err);
      setFinalScore(0);
    }

    if (isTimeUp) {
      // This navigation is for any auto-submit (time's up, tab switch, proctor break)
      navigate('/round2/times-up', { replace: true });
    } else {
      // This navigation is for manual submit
      navigate('/round2/results', { replace: true });
    }
  };

  const handleAnswer = (questionId, answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Reset goes back to home
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
    <Round2TestContext.Provider
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
    </Round2TestContext.Provider>
  );
}

export function useRound2Test() {
  return useContext(Round2TestContext);
}