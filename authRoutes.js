const express = require('express');
const router = express.Router();

const {
  loginUser,
  getLoggedInUser,
  createRazorpayOrder,
  registerWithPayment,
  markTestCompleted,
  // --- ★★★ 1. IMPORT THE NEW R2 FUNCTION ★★★ ---
  markRound2TestCompleted,  
} = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');

//  Registration + Payment
router.post('/register', registerWithPayment);

//  Login
router.post('/login', loginUser);

//  Get logged-in user
router.get('/me', authMiddleware, getLoggedInUser);

//  Create Razorpay order
router.post('/create-order', createRazorpayOrder);

//  Mark test as completed (new feature)
router.patch('/mark-test-completed', authMiddleware, markTestCompleted); 

// --- ★★★ 2. ADD THIS NEW ROUTE FOR ROUND 2 ★★★ ---
//  Mark Round 2 test as completed
router.patch('/mark-round2-completed', authMiddleware, markRound2TestCompleted); 

module.exports = router;