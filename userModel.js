const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  teamName: {
    type: String,
    required: true,
  },
  // We store the team members' names (max 2 others)
  teamMembers: [
    {
      type: String,
    },
  ],
  registeredAt: {
    type: Date,
    default: Date.now,
  },
   paymentCompleted:{
    type: Boolean,
    default:false
    },
  testCompleted:{
    type: Boolean,
    default:false
  },
  
  // --- NEW SCORE FIELD ---
  round1Score: {
    type: Number,
    default: 0,
  },
  isAdmin: {
    type: Boolean,
    default: false, // Default to false for regular users
  },
  // --- ★★★ ADD qualifiedRound2 ★★★ ---
  qualifiedRound2: {
    type: Boolean,
    default: false, // Default to not qualified
  },
  round2Score: { // Field to store Round 2 score later
      type: Number,
      default: 0,
  },
  // --- ★★★ ADDED THIS FIELD FOR ROUND 2 ★★★ ---
  round2TestCompleted: {
    type: Boolean,
    default: false, 
  },
  
  qualifiedRound3: {
    type: Boolean,
    default: false, // Default to not qualified
  }
  // --- END NEW FIELD ---
});

// This pre-save hook is for hashing the password before saving a new user
// (You should already have this in your authController, but this is a good place for it)
// We'll keep the logic in the authController for now to match our existing code.

module.exports = mongoose.model('User', UserSchema);