const express = require('express');
const router = express.Router();
const { 
    getQualifiedTeams, 
    getPublishStatus,
    getRound2Status,
    // --- ★★★ 1. IMPORT NEW R2/R3 FUNCTIONS ★★★ ---
    getPublicStatusR2R3,
    getQualifiedTeamsR3
} = require('../controllers/publicController');

// @route   GET /api/public/qualified-teams
// @desc    Get list of qualified teams (if results are published)
// @access  Public
router.get('/qualified-teams', getQualifiedTeams);

// @route   GET /api/public/publish-status
// @desc    Check if results have been published
// @access  Public
router.get('/publish-status', getPublishStatus);

// @route   GET /api/public/round2-status
// @desc    Check if Round 2 is active
// @access  Public
router.get('/round2-status', getRound2Status);


// --- ★★★ 2. ADD NEW R2/R3 ROUTES ★★★ ---

// @route   GET /api/public/status-r2-r3
// @desc    Check if R2 results are published and R3 is active
// @access  Public
router.get('/status-r2-r3', getPublicStatusR2R3);

// @route   GET /api/public/qualified-teams-r3
// @desc    Get list of teams qualified for Round 3
// @access  Public
router.get('/qualified-teams-r3', getQualifiedTeamsR3);


module.exports = router;