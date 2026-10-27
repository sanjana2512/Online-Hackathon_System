const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
    addProblem,
    getAllProblemsAdmin,
    getProblemsUser
} = require('../controllers/problemController');

// @route   POST /api/problems
// @desc    Admin: Add a new Round 3 problem
// @access  Private/Admin
router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    addProblem
);

// @route   GET /api/problems/all
// @desc    Admin: Get all Round 3 problems
// @access  Private/Admin
router.get(
    '/all',
    authMiddleware,
    adminMiddleware,
    getAllProblemsAdmin
);

// @route   GET /api/problems
// @desc    User: Get all Round 3 problems (if qualified)
// @access  Private
router.get(
    '/',
    authMiddleware,
    getProblemsUser
);

module.exports = router;