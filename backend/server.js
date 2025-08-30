const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware setup
app.use(express.json());  
app.use(cors({
  origin: 'http://localhost:3000',  
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));  

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;  
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import login/register routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

//Import post routes
const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);

//Import user routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

//admin routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

//report route
const reportRoutes = require('./routes/reportRoutes')
app.use('/api/reports', reportRoutes)

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
