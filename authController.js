const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const razorpay = require('razorpay');

// Initialize Razorpay instance
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PAYMENT_AMOUNT_RUPEES = 2000; // Define the fixed payment amount

// ---------------------- LOGIN ----------------------
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.paymentCompleted) {
      return res.status(403).json({ msg: 'Registration requires payment to be completed.' });
    }

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        teamName: user.teamName,
        paymentCompleted: user.paymentCompleted,
        testCompleted: user.testCompleted, // ✅ include this in response
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// ---------------------- LOAD USER ----------------------
exports.getLoggedInUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ---------------------- CREATE ORDER ----------------------
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { email, teamName } = req.body;

    let existingUser = await User.findOne({ email });
    if (existingUser && existingUser.paymentCompleted) {
      return res.status(400).json({ success: false, message: 'User already registered and paid.' });
    }

    const receiptId = email + '_' + Date.now();
    const options = {
      amount: PAYMENT_AMOUNT_RUPEES * 100,
      currency: process.env.CURRENCY || 'INR',
      receipt: receiptId,
      notes: { email, teamName },
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Create Order Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create payment order.' });
  }
};

// ---------------------- REGISTER + VERIFY PAYMENT ----------------------
exports.registerWithPayment = async (req, res) => {
  const {
    name,
    email,
    password,
    teamName,
    teamMembers,
    razorpay_order_id,
    razorpay_payment_id,
  } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const order_info = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (order_info.status !== 'paid') {
      return res.status(400).json({ success: false, msg: 'Payment not completed or failed.' });
    }

    if (order_info.amount !== PAYMENT_AMOUNT_RUPEES * 100) {
      console.warn(`Payment amount mismatch for ${email}`);
    }

    user = new User({
      name,
      email,
      password,
      teamName,
      teamMembers,
      paymentCompleted: true,
      testCompleted: false, // ✅ new users haven’t taken test yet
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ success: true, token, userId: user.id });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during registration or payment verification.');
  }
};

// ---------------------- MARK TEST COMPLETED ----------------------
exports.markTestCompleted = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.testCompleted) {
      return res.status(400).json({ message: 'Test already marked as completed' });
    }

    user.testCompleted = true;
    await user.save();

    res.json({ message: 'Test marked as completed', testCompleted: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to update test completion' });
  }
};


// -----------------------------------------------------------------
// --- ★ 1. ADD NEW FUNCTION FOR UPDATING TEAM ★ ---
// -----------------------------------------------------------------
exports.updateTeam = async (req, res) => {
  try {
    // Get the new team member names from the request body
    const { teamMember2, teamMember3 } = req.body;

    // Get the user from the auth middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Optional: You might want to prevent edits after the test has started
    // if (user.testCompleted) {
    //   return res.status(400).json({ msg: 'Cannot edit team after test has started' });
    // }

    // Update the user document
    user.teamMember2 = teamMember2 || ''; // Set to empty string if null/undefined
    user.teamMember3 = teamMember3 || ''; // Set to empty string if null/undefined

    // Save the updated user
    await user.save();

    // Send back the updated user data (excluding password)
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json({ msg: 'Team updated successfully', user: updatedUser });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error while updating team' });
  }
};

// -----------------------------------------------------------------
// --- ★★★ 1. ADD NEW FUNCTION FOR ROUND 2 ★★★ ---
// -----------------------------------------------------------------
exports.markRound2TestCompleted = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check R2 qualification
    if (!user.qualifiedRound2) {
      return res.status(403).json({ message: 'User not qualified for Round 2.' });
    }

    if (user.round2TestCompleted) {
      return res.status(400).json({ message: 'Round 2 test already marked as completed' });
    }

    user.round2TestCompleted = true;
    await user.save();

    res.json({ message: 'Round 2 test marked as completed', round2TestCompleted: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to update Round 2 test completion' });
  }
};


module.exports = {
  loginUser: exports.loginUser,
  getLoggedInUser: exports.getLoggedInUser,
  createRazorpayOrder: exports.createRazorpayOrder,
  registerWithPayment: exports.registerWithPayment,
  markTestCompleted: exports.markTestCompleted, // ✅ add this
  // --- ★★★ 2. ADD THIS EXPORT ★★★ ---
  markRound2TestCompleted: exports.markRound2TestCompleted,
  updateTeam: exports.updateTeam,
};