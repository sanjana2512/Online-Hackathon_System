const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Connects this to the User
    ref: 'User',
    required: true,
  },
  questionId: {
    type: Number, // The ID from your `questionModel` (e.g., 9 or 10)
    required: true,
  },
  code: {
    type: String, // The actual code the user submitted
    required: true,
  },
  language_id: {
    type: Number, // The Judge0 language ID (e.g., 63 for JS)
    required: true,
  },
  status: {
    type: String,
    // This will be the result from Judge0, e.g.:
    // "Accepted", "Wrong Answer", "Time Limit Exceeded", "Compilation Error"
    default: 'Processing',
  },
  output: {
    type: String, // The raw output (stdout or stderr) from Judge0
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Submission', submissionSchema);

