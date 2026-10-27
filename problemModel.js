const mongoose = require('mongoose');

// This schema will store the Round 3 problem statements, organized by topic.
const problemSchema = new mongoose.Schema({
  // A unique ID for the problem
  problemId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  // The topic (e.g., "AI/ML", "Blockchain", "Web Dev")
  topic: {
    type: String,
    required: true,
    index: true,
  },
  // The title of the problem statement
  title: {
    type: String,
    required: true,
  },
  // The full description of the problem
  description: {
    type: String,
    required: true,
  },
  // Optional: Any datasets or resource links
  resources: {
    type: [String],
    default: [],
  },
  // Points for this problem (if you score R3)
  points: {
    type: Number,
    default: 50,
  }
});

module.exports = mongoose.model('Problem', problemSchema);