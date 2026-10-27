const mongoose = require('mongoose');

// Schema for individual test cases within a coding question
const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true // Input for the code
  },
  expectedOutput: {
    type: String,
    required: true // The correct output Judge0 should expect
  },
  hidden: {
    type: Boolean,
    default: false // Whether this test case is visible to the user
  },
});

// Main schema for a question (MCQ, Aptitude, or Coding)
const questionSchema = new mongoose.Schema({
  // Unique numeric ID for the question across all rounds
  questionId: {
    type: Number,
    required: true,
    unique: true, // Ensure each questionId is unique
    index: true,  // Index for faster lookups by ID
  },
  // --- Round Number ---
  roundNumber: {
      type: Number,
      required: [true, 'Please specify the round number (1 or 2)'], // Added error message
      enum: {
          values: [1, 2],
          message: 'Round number must be either 1 or 2' // Enum validation message
      },
      index: true, // Index for efficient querying by round
  },
  // --- Type of Question ---
  type: {
    type: String,
    required: true,
    enum: ['mcq', 'aptitude', 'coding'], // Allowed question types
  },
  // --- Question Text ---
  question: {
    type: String,
    required: [true, 'Please provide the question text'],
  },
  // --- Points for the Question ---
  points: {
    type: Number,
    required: [true, 'Please specify points for this question'],
    min: [0, 'Points cannot be negative'], // Minimum value validation
    default: 1, // Default points, override as needed (e.g., for coding)
  },
  // --- Fields for MCQ/Aptitude ---
  options: {
      type: [String], // Array of possible answer strings
      // Only require options if it's an MCQ or Aptitude question
      required: function() { return this.type === 'mcq' || this.type === 'aptitude'; },
      validate: [
          // Ensure there are at least 2 options for MCQ/Aptitude
          { validator: function(opts) { return !this.required || opts.length >= 2; }, msg: 'MCQ/Aptitude questions require at least 2 options.' },
          // Ensure options are not empty strings (optional but good practice)
          // { validator: function(opts) { return opts.every(opt => opt && opt.trim().length > 0); }, msg: 'Options cannot be empty.'}
      ]
  },
  answer: {
      type: String, // The correct answer string for MCQ/Aptitude
      // Only require answer if it's an MCQ or Aptitude question
      required: function() { return this.type === 'mcq' || this.type === 'aptitude'; }
  },

  // --- Fields for Coding ---
  starterCode: {
      type: String, // Optional starter code snippet
      // Only relevant for coding questions
      required: function() { return this.type === 'coding'; },
      default: '', // Default to empty string
  },
  language_id: {
      type: Number, // Judge0 Language ID (e.g., 63 for JS, 71 for Python)
      // Only require language_id for coding questions
      required: function() { return this.type === 'coding'; }
  },
  testCases: {
      type: [testCaseSchema], // Array of test cases using the sub-schema
      // Only require test cases for coding questions
      required: function() { return this.type === 'coding'; },
       validate: [
           // Ensure there is at least one test case for coding questions
           { validator: function(tc) { return !this.required || tc.length >= 1; }, msg: 'Coding questions require at least one test case.' },
       ]
  },
});

module.exports = mongoose.model('Question', questionSchema);

