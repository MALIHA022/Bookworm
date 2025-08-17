// localstorage info - sends back full user info - backend

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();  // Correctly using router
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware'); // Import the auth middleware

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

// Login controller
    router.post("/login", async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }); 

        if (!user) return res.status(400).json({ error: "User not found" });    

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });    

        // Generate JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });  

        // full user info
        res.json({
          message: "Login successful",
          token,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            gender: user.gender,
            dob: user.dob,
        },
    });
          console.log('Sending login response:', {
                message: "Login successful",
                token,
                user: {
                  id: user._id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  gender: user.gender,
                  dob: user.dob,
                },
              });


      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
      }
    }
    );

module.exports = router;  // Export router correctly
