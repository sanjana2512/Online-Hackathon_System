const express = require('express');
const router = express.Router();

// Import Middlewares
const authMiddleware = require('../middleware/authMiddleware'); // Checks if user is logged in
const adminMiddleware = require('../middleware/adminMiddleware'); // Checks if logged-in user is an admin

// Import Controller Functions
const {
    getAllTeams,
    updateQualificationStatus,
    // --- ★★★ NEW: IMPORT R1 ACTIVATION FUNCTIONS ★★★ ---
    activateRound1,
    deactivateRound1,
    publishResults,
    unpublishResults,
    getPublishStatus,
    activateRound2,
    deactivateRound2,
    getRound2Status,
    // --- ★★★ IMPORT R2/R3 FUNCTIONS (already there) ★★★ ---
    publishResultsR2,
    unpublishResultsR2,
    updateQualificationStatusR3,
    activateRound3,
    deactivateRound3
} = require('../controllers/adminController'); // Get functions from adminController

// --- Define Admin Routes ---

// @route   GET /api/admin/teams
// @desc    Get all non-admin users/teams for the dashboard
// @access  Private/Admin
router.get(
    '/teams',
    authMiddleware,
    adminMiddleware,
    getAllTeams
);

// @route   PATCH /api/admin/teams/:id/qualify
// @desc    Update a specific team's qualifiedRound2 status
// @access  Private/Admin
router.patch(
    '/teams/:id/qualify',
    authMiddleware,
    adminMiddleware,
    updateQualificationStatus
);

// --- ★★★ NEW: ROUND 1 ACTIVATION ROUTES ★★★ ---
// @route   POST /api/admin/activate-round1
// @desc    Set the global round1Active flag to true
// @access  Private/Admin
router.post(
    '/activate-round1',
    authMiddleware,
    adminMiddleware,
    activateRound1
);

// @route   POST /api/admin/deactivate-round1
// @desc    Set the global round1Active flag to false
// @access  Private/Admin
router.post(
    '/deactivate-round1',
    authMiddleware,
    adminMiddleware,
    deactivateRound1
);

// @route   POST /api/admin/publish-results
// @desc    Set the global resultsPublished flag to true
// @access  Private/Admin
router.post(
    '/publish-results',
    authMiddleware,
    adminMiddleware,
    publishResults
);

// @route   POST /api/admin/unpublish-results
// @desc    Set the global resultsPublished flag to false
// @access  Private/Admin
router.post(
    '/unpublish-results',
    authMiddleware,
    adminMiddleware,
    unpublishResults
);

// @route   GET /api/admin/publish-status
// @desc    Get the current status of all global flags (now includes round1Active)
// @access  Private/Admin
router.get(
    '/publish-status',
    authMiddleware,
    adminMiddleware,
    getPublishStatus
);

// @route   POST /api/admin/activate-round2
// @desc    Set the global round2Active flag to true
// @access  Private/Admin
router.post(
    '/activate-round2',
    authMiddleware,
    adminMiddleware,
    activateRound2
);

// @route   POST /api/admin/deactivate-round2
// @desc    Set the global round2Active flag to false
// @access  Private/Admin
router.post(
    '/deactivate-round2',
    authMiddleware,
    adminMiddleware,
    deactivateRound2
);

// @route   GET /api/admin/round2-status
// @desc    Get the current status of round2Active flag
// @access  Private/Admin
router.get(
    '/round2-status',
    authMiddleware,
    adminMiddleware,
    getRound2Status
);


// ------------------------------------
// --- ★★★ R2/R3 ROUTES (existing) ★★★ ---
// ------------------------------------

// @route   PATCH /api/admin/teams/:id/qualify-r3
// @desc    Update a specific team's qualifiedRound3 status
// @access  Private/Admin
router.patch(
    '/teams/:id/qualify-r3',
    authMiddleware,
    adminMiddleware,
    updateQualificationStatusR3
);

// @route   POST /api/admin/publish-results-r2
// @desc    Set the global round2ResultsPublished flag to true
// @access  Private/Admin
router.post(
    '/publish-results-r2',
    authMiddleware,
    adminMiddleware,
    publishResultsR2
);

// @route   POST /api/admin/unpublish-results-r2
// @desc    Set the global round2ResultsPublished flag to false
// @access  Private/Admin
router.post(
    '/unpublish-results-r2',
    authMiddleware,
    adminMiddleware,
    unpublishResultsR2
);

// @route   POST /api/admin/activate-round3
// @desc    Set the global round3Active flag to true
// @access  Private/Admin
router.post(
    '/activate-round3',
    authMiddleware,
    adminMiddleware,
    activateRound3
);

// @route   POST /api/admin/deactivate-round3
// @desc    Set the global round3Active flag to false
// @access  Private/Admin
router.post(
    '/deactivate-round3',
    authMiddleware,
    adminMiddleware,
    deactivateRound3
);


module.exports = router; // Export the configured router