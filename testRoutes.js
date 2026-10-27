const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getTestQuestions,
  submitCode,
  calculateAndSaveScore, 
  // --- ★★★ 1. IMPORT THE NEW R2 FUNCTIONS ★★★ ---
  getRound2TestQuestions,
  submitRound2Code,
  calculateAndSaveRound2Score,
} = require('../controllers/testController');

// @route   GET /api/test/questions
// @desc    Get all test questions (MCQ, Aptitude, Coding)
// @access  Private
router.get('/questions', authMiddleware, getTestQuestions);

// @route   POST /api/test/submit
// @desc    Submit *one* coding question for grading
// @access  Private
router.post('/submit', authMiddleware, submitCode);

// --- 2. ADD THIS NEW ROUTE ---
// @route   POST /api/test/end-test
// @desc    Submit all answers and calculate final score
// @access  Private
router.post('/end-test', authMiddleware, calculateAndSaveScore);
// --- END NEW ROUTE ---


// ------------------------------------
// --- ★★★ 3. ADD NEW ROUND 2 ROUTES ★★★ ---
// ------------------------------------

// @route   GET /api/test/round2/questions
// @desc    Get all Round 2 test questions
// @access  Private
router.get('/round2/questions', authMiddleware, getRound2TestQuestions);

// @route   POST /api/test/round2/submit
// @desc    Submit *one* Round 2 coding question
// @access  Private
router.post('/round2/submit', authMiddleware, submitRound2Code);

// @route   POST /api/test/round2/end-test
// @desc    Submit all Round 2 answers and calculate final score
// @access  Private
router.post('/round2/end-test', authMiddleware, calculateAndSaveRound2Score);
// --- END NEW ROUTES ---


module.exports = router;