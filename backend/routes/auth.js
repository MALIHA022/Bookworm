const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();  // Correctly using router

// Register route
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, gender, dob } = req.body;
    if (!firstName || !lastName || !email || !password || !gender || !dob ) {
        return res.status(400).json({ error: 'Please fill out all fields.' });
    }
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already exists.' });

        const user = new User({ firstName, lastName, email, password, gender, dob });
        await user.save();
        res.json({ message: 'User registered successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate that email and password are provided
    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide both email and password' });
    }

    console.log("Received email:", email); // Log the received email
    console.log("Received password:", password); // Log the received password

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found'); // Log when user is not found
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch'); // Log when passwords don't match
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return the token and user information
        console.log('Login successful'); // Log successful login
        res.json({ token, message: 'Login successful!' });

    } catch (err) {
        console.error('Login error:', err);  // Log any unexpected errors
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

module.exports = router;  // Export router correctly
