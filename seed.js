const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Question = require('./models/questionModel');
const Problem = require('./models/problemModel'); // ★★★ 1. IMPORT PROBLEM MODEL ★★★
require('dotenv').config();

// Connect to DB
connectDB();

// --- ROUND 1 & 2 QUESTIONS (for the test) ---
const questions = [
  // --- ROUND 1 QUESTIONS ---
  { questionId: 1, roundNumber: 1, type: 'mcq', points: 1, 
  question: 'In JavaScript, what is the time complexity of inserting an element into a Set, on average?', 
  options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], 
  answer: 'O(1)' 
},

{ questionId: 2, roundNumber: 1, type: 'mcq', points: 1, 
  question: 'Which CSS property creates a new stacking context?', 
  options: ['opacity < 1', 'z-index', 'display: block', 'position: static'], 
  answer: 'opacity < 1' 
},

{ questionId: 3, roundNumber: 1, type: 'mcq', points: 1, 
  question: 'Which HTTP method is **idempotent** according to the HTTP specification?', 
  options: ['POST', 'PATCH', 'PUT', 'CONNECT'], 
  answer: 'PUT' 
},

{ questionId: 4, roundNumber: 1, type: 'mcq', points: 1, 
  question: 'In React, which lifecycle method is invoked after the component is added to the DOM?', 
  options: ['componentWillMount()', 'componentDidMount()', 'shouldComponentUpdate()', 'getDerivedStateFromProps()'], 
  answer: 'componentDidMount()' 
},

{ questionId: 5, roundNumber: 1, type: 'mcq', points: 1, 
  question: 'What is the worst-case time complexity of QuickSort?', 
  options: ['O(n log n)', 'O(log n)', 'O(n^2)', 'O(n)'], 
  answer: 'O(n^2)' 
},

// --- Aptitude Starts ---

{ questionId: 6, roundNumber: 1, type: 'mcq', points: 1, 
  question: 'A train travels 600 km at a speed of 150 km/h. Due to track issues, it returns at 100 km/h. What is the average speed for the round trip?', 
  options: ['120 km/h', '125 km/h', '130 km/h', '140 km/h'], 
  answer: '120 km/h' 
},

{ questionId: 7, roundNumber: 1, type: 'mcq', points: 1, 
  question: 'If the ratio of two numbers is 7:5 and their difference is 24, what is the larger number?', 
  options: ['70', '84', '96', '108'], 
  answer: '84' 
},

{ questionId: 8, roundNumber: 1, type: 'mcq', points: 1,
  question: 'A number is increased by 20% and then the result is decreased by 20%. If the final value is 192, what was the original number?',
  options: ['200', '220', '240', '250'],
  answer: '240'
},

  // --- Round 1 Coding ---
  {
    questionId: 9, roundNumber: 1, type: 'coding', points: 5,
    question: 'Write a function in JavaScript `reverseString(str)` to reverse a string. Example: "hello" -> "olleh".',
    language_id: 63, // JavaScript (Node.js)
    starterCode: `function reverseString(str) {
  // Your code here
  return ""; // Placeholder
}`,
    testCases: [
      { input: 'hello', expectedOutput: 'olleh', hidden: false },
      { input: 'React', expectedOutput: 'tcaeR', hidden: true },
      { input: '12345', expectedOutput: '54321', hidden: true },
    ],
  },
  {
    questionId: 10, roundNumber: 1, type: 'coding', points: 5,
    question: 'Write a Python function `factorial(n)` to find the factorial of a non-negative integer. Example: factorial(5) -> 120.',
    language_id: 71, // Python
    starterCode: `# Define the function
def factorial(n):
  # Your code here
  # Assume n is a non-negative integer
  return 0 # Placeholder`,
    testCases: [
      { input: '5', expectedOutput: '120', hidden: false }, // Input is string '5'
      { input: '0', expectedOutput: '1', hidden: true },   // Input is string '0'
      { input: '7', expectedOutput: '5040', hidden: true }, // Input is string '7'
    ],
  },

  // --- ROUND 2 QUESTIONS ---
  {
      questionId: 11, roundNumber: 2, type: 'coding', points: 10,
      question: 'Write a Python function `analyze_sentiment(text)` that returns "Positive" if the input text contains "good" (case-insensitive), "Negative" if it contains "bad" (case-insensitive), and "Neutral" otherwise. Assume only one sentiment word appears.',
      language_id: 71, // Python
      starterCode: `# Define the function
def analyze_sentiment(text):
  # Your code here
  return "Neutral" # Placeholder`,
      testCases: [
          { input: 'This is a good day', expectedOutput: 'Positive', hidden: false },
          { input: 'The weather is bad', expectedOutput: 'Negative', hidden: true },
          { input: 'Just another Tuesday', expectedOutput: 'Neutral', hidden: true },
          { input: 'Very Good Service', expectedOutput: 'Positive', hidden: true },
      ],
  },
  {
      questionId: 12, roundNumber: 2, type: 'coding', points: 15,
      question: 'Implement a function in JavaScript `findMaxSubarraySum(nums)` that finds the contiguous subarray (containing at least one number) within an array of integers which has the largest sum and returns its sum. Example: [-2,1,-3,4,-1,2,1,-5,4] -> 6',
      language_id: 63, // JavaScript (Node.js)
      starterCode: `function findMaxSubarraySum(nums) {
  // Your code here
  // nums is an array of numbers
  return 0; // Placeholder
}`,
      testCases: [
          { input: JSON.stringify([-2,1,-3,4,-1,2,1,-5,4]), expectedOutput: '6', hidden: false },
          { input: JSON.stringify([1]), expectedOutput: '1', hidden: true },
          { input: JSON.stringify([5,4,-1,7,8]), expectedOutput: '23', hidden: true },
          { input: JSON.stringify([-1,-2,-3,-4]), expectedOutput: '-1', hidden: true },
      ],
  },
  {
      questionId: 13, roundNumber: 2, type: 'coding', points: 10,
      question: 'Write a Python function `calculate_average(numbers_str)` that takes a comma-separated string of numbers, calculates their average, and returns the average rounded to 2 decimal places. Example: "1,2,3,4,5" -> 3.00',
      language_id: 71, // Python
      starterCode: `# Define the function
def calculate_average(numbers_str):
  # Your code here
  # numbers_str is a string like "1,2,3.5"
  return 0.0 # Placeholder`,
      testCases: [
          { input: '1,2,3,4,5', expectedOutput: '3.00', hidden: false },
          { input: '10,20', expectedOutput: '15.00', hidden: true },
          { input: '2.5,3.5,4.5', expectedOutput: '3.50', hidden: true },
          { input: '100', expectedOutput: '100.00', hidden: true },
          // { input: '', expectedOutput: '0.00', hidden: true }, // Edge case: empty input
      ],
  },
];

// --- ★★★ 2. ADD ROUND 3 PROBLEM STATEMENTS ★★★ ---
const problems = [
  {
    problemId: 101,
    topic: "Artificial Intelligence",
    title: "Movie Recommendation Engine",
    description: "Build a machine learning model that predicts how a user would rate a movie. You are given a dataset of user ratings. Your model should take a user ID and movie ID and output a predicted rating. Teams will be judged on the accuracy (e.g., RMSE) of their predictions on a hidden test set.",
    resources: [
      "https://example.com/dataset/ratings.csv",
      "https://example.com/dataset/movies.csv",
      "https://example.com/documentation/recommender-systems-101"
    ],
    points: 100
  },
  {
    problemId: 102,
    topic: "Artificial Intelligence",
    title: "Image Classification for Crop Diseases",
    description: "Develop a deep learning model (e.g., using CNNs) to identify common diseases in crop leaves from a provided image dataset. The model should classify an image into one of several disease categories or 'healthy'.",
    resources: [
      "https://example.com/dataset/leaf-images.zip",
      "https://example.com/documentation/cnn-basics"
    ],
    points: 100
  },
  {
    problemId: 201,
    topic: "Web 3.0 / Blockchain",
    title: "Decentralized Voting Application (dApp)",
    description: "Create a decentralized voting application on a test network (e.g., Sepolia). The dApp should allow a pre-defined admin to create a new ballot, allow whitelisted addresses to cast one vote, and display the final results securely and transparently.",
    resources: [
      "https://example.com/documentation/solidity-basics",
      "https://example.com/documentation/react-web3-integration"
    ],
    points: 100
  },
  {
    problemId: 301,
    topic: "Open Domain",
    title: "Solution for Urban Traffic Congestion",
    description: "Propose and build a prototype for an innovative solution to reduce urban traffic congestion. This is an open-domain problem. Your solution could be a simulation model, a smart traffic light control system, a new ride-sharing algorithm, or a data analysis platform. The solution will be judged on innovation, feasibility, and potential impact.",
    resources: [
      "httpss://example.com/dataset/city-traffic-data.csv"
    ],
    points: 100
  }
];

// --- ★★★ 3. UPDATE THE SEEDDB FUNCTION ★★★ ---
const seedDB = async () => {
  try {
    // Clear both collections
    await Question.deleteMany({});
    console.log('Old questions (R1/R2) removed...');
    await Problem.deleteMany({});
    console.log('Old problems (R3) removed...');

    // Insert data into both collections
    await Question.insertMany(questions);
    console.log('Questions (R1/R2) added!');
    await Problem.insertMany(problems);
    console.log('Problems (R3) added!');

    mongoose.connection.close();
    process.exit();
  } catch (err) {
    console.error("Seed Script Error:", err);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDB();