const axios = require('axios');
const Question = require('../models/questionModel');
const Submission = require('../models/submissionModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const Settings = require('../models/settingsModel');

// Judge0 API Endpoint
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';

// These lines read the keys from your .env file
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST;


// @desc    Get all questions for the test
// @route   GET /api/test/questions
exports.getTestQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ roundNumber: 1 })
      .sort('questionId')
      .select('-answer -testCases.expectedOutput -points'); 
    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Submit code for a question
// @route   POST /api/test/submit
exports.submitCode = async (req, res) => {
  const { questionId, code, language_id } = req.body;
  const userId = req.user.id; 
  if (!questionId || code === undefined || !language_id) {
    return res.status(400).json({ msg: 'Missing required fields: questionId, code, language_id' });
  }
  try {
    const question = await Question.findOne({ questionId });
    if (!question) {
      return res.status(404).json({ msg: 'Question not found' });
    }
    if (question.type !== 'coding') {
      return res.status(400).json({ msg: 'Not a coding question' });
    }
    if (question.roundNumber !== 1) {
      return res.status(400).json({ msg: 'Not a Round 1 coding question' });
    }
    
    if (!JUDGE0_API_KEY || !JUDGE0_API_HOST) {
        return res.status(500).send('Server configuration error: Missing Judge0 credentials');
    }
    const testCases = question.testCases.map(tc => ({
      stdin: tc.input,
      expected_output: tc.expectedOutput,
    }));
    if (!testCases || testCases.length === 0) {
        return res.status(400).json({ msg: 'No test cases found for this question.' });
    }

    // --- ★★★ START OF FIX (Round 1) ★★★ ---
    
    // 1. Encode all text fields to Base64
    const encodedCode = Buffer.from(code).toString('base64');
    const encodedStdin = Buffer.from(testCases[0].stdin).toString('base64');
    const encodedExpectedOutput = Buffer.from(testCases[0].expected_output).toString('base64');
    
    const judge0Data = {
        language_id: language_id,
        source_code: encodedCode,          // Use encoded code
        stdin: encodedStdin,               // Use encoded stdin
        expected_output: encodedExpectedOutput, // Use encoded expected output
    };

    console.log('--- Sending to Judge0 (Round 1) ---');
    
    const options = {
      method: 'POST',
      url: `${JUDGE0_API_URL}/submissions`,
      // 2. Set base64_encoded to 'true'
      params: { base64_encoded: 'true', wait: 'true' }, 
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': JUDGE0_API_HOST,
      },
      data: judge0Data,
    };
    
    // --- ★★★ END OF FIX (Round 1) ★★★ ---

    const judge0Response = await axios.request(options);
    const result = judge0Response.data;
    console.log('--- Received from Judge0 ---');
    
    // Decode outputs from Base64 if they exist
    const actualOutput = result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf-8').trim() : null;
    const stderr = result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf-8') : null;
    const compile_output = result.compile_output ? Buffer.from(result.compile_output, 'base64').toString('utf-8') : null;
    const message = result.message ? Buffer.from(result.message, 'base64').toString('utf-8') : null;

    const submission = new Submission({
      userId,
      questionId,
      code, 
      language_id,
      status: result.status?.description || 'Unknown Status',
      output: actualOutput || stderr || compile_output || message || '(No output)',
    });
    await submission.save();
    
    res.json({
      status: result.status?.description || 'Unknown Status',
      output: actualOutput || stderr || compile_output || message || '(No output)',
    });
  } catch (err) {
    console.error('Error during code submission:', err.message);
    if (err.response) {
      console.error('Judge0 API Error Response:', err.response.data);
      // The error from Judge0 is often NOT base64, so we read it directly
      return res.status(err.response.status || 500).json({
          status: 'API Error',
          output: err.response.data.error || err.response.data.message || 'Error connecting to Judge0 API.'
      });
    }
    res.status(500).send('Server Error during code submission');
  }
};


// @desc    Submit the entire test and calculate final score
// @route   POST /api/test/end-test
exports.calculateAndSaveScore = async (req, res) => {
  const userId = req.user.id;
  const { mcqAnswers } = req.body; 
  if (!mcqAnswers || typeof mcqAnswers !== 'object') {
     return res.status(400).json({ msg: 'Missing or invalid mcqAnswers data' });
  }
  try {
    let totalScore = 0;
    const questions = await Question.find({
      type: { $in: ['mcq', 'aptitude'] },
      roundNumber: 1 
    }).select('questionId answer points');
    const answerMap = {};
    questions.forEach(q => {
      answerMap[q.questionId] = { answer: q.answer, points: q.points };
    });
    for (const questionId in mcqAnswers) {
      if (Object.hasOwnProperty.call(mcqAnswers, questionId) && answerMap[questionId]) {
         if (mcqAnswers[questionId] === answerMap[questionId].answer) {
             totalScore += (answerMap[questionId].points || 0);
         }
      }
    }
    const objectIdUserId = new mongoose.Types.ObjectId(userId);
    const acceptedCodingSubmissions = await Submission.aggregate([
      { $match: { userId: objectIdUserId, status: 'Accepted' } },
      { $group: { _id: '$questionId' } },
    ]);
    if (acceptedCodingSubmissions.length > 0) {
      const acceptedQuestionIds = acceptedCodingSubmissions.map(s => s._id);
      const codingQuestions = await Question.find({
        questionId: { $in: acceptedQuestionIds },
        type: 'coding',
        roundNumber: 1 
      }).select('points');
      codingQuestions.forEach(q => {
        totalScore += (q.points || 0);
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(44).json({ msg: 'User not found' });
    }
    user.round1Score = totalScore;
    await user.save();
    res.json({
      msg: 'Test submitted successfully',
      round1Score: totalScore
    });
  } catch (err) {
    console.error('Error calculating score:', err.message);
    res.status(500).send('Server Error calculating score');
  }
};


// ---------------------------------------------
// --- R2 FUNCTIONS ---
// ---------------------------------------------

// @desc    Get all questions for the ROUND 2 test
// @route   GET /api/test/round2/questions
exports.getRound2TestQuestions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const settings = await Settings.getSettings();

    // Security Checks
    if (!user.qualifiedRound2) {
      return res.status(403).json({ msg: 'User is not qualified for Round 2.' });
    }
    if (!settings.round2Active) {
      return res.status(403).json({ msg: 'Round 2 is not active.' });
    }
    
    // Fetch all questions for ROUND 2
    const questions = await Question.find({ roundNumber: 2 })
      .sort('questionId')
      .select('-answer -testCases.expectedOutput -points');

    res.json(questions);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Submit code for a ROUND 2 question
// @route   POST /api/test/round2/submit
exports.submitRound2Code = async (req, res) => {
  const { questionId, code, language_id } = req.body;
  const userId = req.user.id; 
  if (!questionId || code === undefined || !language_id) {
    return res.status(400).json({ msg: 'Missing required fields: questionId, code, language_id' });
  }
  try {
    const question = await Question.findOne({ questionId });
    if (!question) {
      return res.status(404).json({ msg: 'Question not found' });
    }
    if (question.roundNumber !== 2) {
      return res.status(400).json({ msg: 'Not a Round 2 question' });
    }
    if (question.type !== 'coding') {
      return res.status(400).json({ msg: 'Not a coding question' });
    }
    
    if (!JUDGE0_API_KEY || !JUDGE0_API_HOST) {
        return res.status(500).send('Server configuration error: Missing Judge0 credentials');
    }
    const testCases = question.testCases.map(tc => ({
      stdin: tc.input,
      expected_output: tc.expectedOutput,
    }));
    if (!testCases || testCases.length === 0) {
        return res.status(400).json({ msg: 'No test cases found for this question.' });
    }

    // --- ★★★ START OF FIX (Round 2) ★★★ ---
    
    // 1. Encode all text fields to Base64
    const encodedCode = Buffer.from(code).toString('base64');
    const encodedStdin = Buffer.from(testCases[0].stdin).toString('base64');
    const encodedExpectedOutput = Buffer.from(testCases[0].expected_output).toString('base64');

    const judge0Data = {
        language_id: language_id,
        source_code: encodedCode,          // Use encoded code
        stdin: encodedStdin,               // Use encoded stdin
        expected_output: encodedExpectedOutput, // Use encoded expected output
    };

    console.log('--- Sending to Judge0 (Round 2) ---');

    const options = {
      method: 'POST',
      url: `${JUDGE0_API_URL}/submissions`,
      // 2. Set base64_encoded to 'true'
      params: { base64_encoded: 'true', wait: 'true' },
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': JUDGE0_API_HOST,
      },
      data: judge0Data,
    };
    
    // --- ★★★ END OF FIX (Round 2) ★★★ ---

    const judge0Response = await axios.request(options);
    const result = judge0Response.data;

    // Decode outputs from Base64 if they exist
    const actualOutput = result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf-8').trim() : null;
    const stderr = result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf-8') : null;
    const compile_output = result.compile_output ? Buffer.from(result.compile_output, 'base64').toString('utf-8') : null;
    const message = result.message ? Buffer.from(result.message, 'base64').toString('utf-8') : null;
    
    const submission = new Submission({
      userId,
      questionId,
      code,
      language_id,
      status: result.status?.description || 'Unknown Status',
      output: actualOutput || stderr || compile_output || message || '(No output)',
    });
    await submission.save();

    res.json({
      status: result.status?.description || 'Unknown Status',
      output: actualOutput || stderr || compile_output || message || '(No output)',
    });
  } catch (err) {
    console.error('Error during R2 code submission:', err.message);
    if (err.response) {
      console.error('Judge0 API Error Response:', err.response.data);
      // The error from Judge0 is often NOT base64, so we read it directly
      return res.status(err.response.status || 500).json({
          status: 'API Error',
          output: err.response.data.error || err.response.data.message || 'Error connecting to Judge0 API.'
      });
    }
    res.status(500).send('Server Error during code submission');
  }
};


// @desc    Submit the entire ROUND 2 test and calculate final score
// @route   POST /api/test/round2/end-test
exports.calculateAndSaveRound2Score = async (req, res) => {
  const userId = req.user.id;
  const { mcqAnswers } = req.body; 
  try {
    let totalScore = 0;
    if (mcqAnswers && typeof mcqAnswers === 'object') {
      const questions = await Question.find({
        type: { $in: ['mcq', 'aptitude'] },
        roundNumber: 2
      }).select('questionId answer points');
      const answerMap = {};
      questions.forEach(q => {
        answerMap[q.questionId] = { answer: q.answer, points: q.points };
      });
      for (const questionId in mcqAnswers) {
        if (Object.hasOwnProperty.call(mcqAnswers, questionId) && answerMap[questionId]) {
           if (mcqAnswers[questionId] === answerMap[questionId].answer) {
               totalScore += (answerMap[questionId].points || 0);
           }
        }
      }
    }
    const objectIdUserId = new mongoose.Types.ObjectId(userId);
    const acceptedCodingSubmissions = await Submission.aggregate([
      { $match: { userId: objectIdUserId, status: 'Accepted' } },
      { $group: { _id: '$questionId' } },
    ]);
    if (acceptedCodingSubmissions.length > 0) {
      const acceptedQuestionIds = acceptedCodingSubmissions.map(s => s._id);
      const codingQuestions = await Question.find({
        questionId: { $in: acceptedQuestionIds },
        type: 'coding',
        roundNumber: 2
      }).select('points');
      codingQuestions.forEach(q => {
        totalScore += (q.points || 0);
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    user.round2Score = totalScore; 
    user.round2TestCompleted = true; // Test is marked as complete here!
    await user.save();
    res.json({
      msg: 'Round 2 test submitted successfully',
      round2Score: totalScore
    });
  } catch (err) {
    console.error('Error calculating R2 score:', err.message);
    res.status(500).send('Server Error calculating score');
  }
};