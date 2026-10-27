const express = require('express');
const connectDB = require('./config/db'); // Function to connect to MongoDB
const cors = require('cors'); // Middleware for enabling Cross-Origin Resource Sharing
require('dotenv').config(); // Load environment variables from .env file

const app = express(); // Initialize Express application

// 1. Connect to Database
connectDB();

// 2. Initialize Middleware
app.use(cors()); // Allow requests from your React frontend (running on a different port)
app.use(express.json()); // Allow the server to accept JSON data in request bodies

// 3. Define API Routes
// Simple base route for checking if the API is running
app.get('/', (req, res) => res.send('Hackathon API Running...'));

// --- Use the defined route handlers ---
app.use('/api/auth', require('./routes/authRoutes'));       // Handles login, register, payment order, mark test
app.use('/api/test', require('./routes/testRoutes'));       // Handles getting questions, submitting code
app.use('/api/admin', require('./routes/adminRoutes'));     // Handles admin-specific actions (get teams, qualify, publish)
app.use('/api/public', require('./routes/publicRoutes'));   // Handles publicly viewable data (qualified teams if published)

// --- ★★★ ADD THIS NEW ROUTE FOR R3 PROBLEMS ★★★ ---
app.use('/api/problems', require('./routes/problemRoutes')); // Handles R3 problem statements

// --- Routes Removed ---
// Payment routes are handled within authRoutes now
// app.use('/api/payment', require('./routes/paymentRoutes'));


// Define the port the server will run on
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));