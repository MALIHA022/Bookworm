const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Initialize environment variables
dotenv.config();

// Create an Express app
const app = express();

// Middleware setup
app.use(express.json());  // For parsing JSON requests
app.use(cors());  // Enable Cross-Origin Resource Sharing (CORS)

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;  // Access Mongo URI from .env file
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import and use routes (auth route for login/register)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
