// src/data.js

export const allQuestions = [
  // --- MCQ Questions (5 questions) ---
  {
    id: 1,
    type: 'mcq', // Changed from 'text' to 'mcq'
    question: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    answer: 'Paris',
  },
  {
    id: 2,
    type: 'mcq',
    question: "Who wrote 'Harry Potter'?",
    options: [
      'J.K. Rowling',
      'Tolkien',
      'Shakespeare',
      'George R.R. Martin',
    ],
    answer: 'J.K. Rowling',
  },
  {
    id: 3,
    type: 'mcq',
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Saturn', 'Mars', 'Jupiter'],
    answer: 'Mars',
  },
  {
    id: 4,
    type: 'mcq',
    question: 'What is the largest mammal?',
    options: ['Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
    answer: 'Blue Whale',
  },
  {
    id: 5,
    type: 'mcq',
    question: 'Which language runs in a web browser?',
    options: ['Python', 'Java', 'C', 'JavaScript'],
    answer: 'JavaScript',
  },

  // --- Aptitude Questions (3 questions) ---
  {
    id: 6,
    type: 'aptitude',
    question: 'If 5 men can do a piece of work in 10 days, in how many days will 10 men do the same piece of work?',
    options: ['5 days', '10 days', '2 days', '20 days'],
    answer: '5 days',
  },
  {
    id: 7,
    type: 'aptitude',
    question: 'What is the next number in the series: 2, 6, 12, 20, 30, ...?',
    options: ['40', '42', '44', '46'],
    answer: '42',
  },
  {
    id: 8,
    type: 'aptitude',
    question: 'A train 120m long is running at 54 km/hr. In how much time will it pass a pole?',
    options: ['6 seconds', '8 seconds', '10 seconds', '12 seconds'],
    answer: '8 seconds', // 54 km/hr = 15 m/s. Time = Distance/Speed = 120/15 = 8s
  },
  
  // --- Coding Questions (2 questions) ---
  {
    id: 9,
    type: 'coding',
    question: 'Write a function in JavaScript to reverse a string. Example: "hello" -> "olleh".',
    starterCode: `function reverseString(str) {
  // Your code here
}`,
    expectedOutput: {
      input: "hello",
      output: "olleh"
    },
    // For coding questions, the "answer" field will be used for comparison in Results
    // A real coding platform would execute user code. Here, we'll simulate.
    answer: "olleh", // Expected output for the example input
  },
  {
    id: 10,
    type: 'coding',
    question: 'Write a program in Python to find the factorial of a number. Example: factorial(5) -> 120.',
    starterCode: `def factorial(n):
  # Your code here
`,
    expectedOutput: {
      input: 5,
      output: 120
    },
    answer: 120, // Expected output for the example input
  },
];