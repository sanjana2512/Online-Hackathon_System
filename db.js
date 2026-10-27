// --- Database Connection Logic ---
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // We get the connection string from our .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure if we can't connect
    process.exit(1);
  }
};

module.exports = connectDB;