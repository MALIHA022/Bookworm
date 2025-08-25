// localstorage info - sends back full user info - backend

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router(); 
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');

// Register route
  router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, gender, dob } = req.body;
    if (!firstName || !lastName || !email || !password || !gender || !dob) {
      return res.status(400).json({ error: 'Please fill out all fields.' });
    }
    try {
      const adminEmail = 'admin@bookworm.local';
      const emailNorm = email.trim().toLowerCase(); 

      // Block accidental registration with the admin email
      if (emailNorm === adminEmail) {
        return res.status(403).json({ error: 'This email is reserved for the admin.' });
      } 

      const existing = await User.findOne({ email: emailNorm });
      if (existing) return res.status(400).json({ error: 'Email already exists.' });  

      const user = new User({ firstName, lastName, email: emailNorm, password, gender, dob }); // role defaults to "user"
      await user.save();
      res.json({ message: 'User registered successfully!' });
    } catch (err) {
      res.status(500).json({ error: 'Server error during registration.' });
    }
  });


// Login controller
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const emailNorm = (email || '').trim().toLowerCase();

      const user = await User.findOne({ email: emailNorm });
      if (!user) return res.status(400).json({ error: 'User not found' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

      // Include role in token
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          role: user.role,               
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          gender: user.gender,
          dob: user.dob,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

// Admin Login
  router.post('/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
    
      // Fixed creds
      const ADMIN_EMAIL = 'admin@bookworm.local';
      const ADMIN_PASS  = 'bookwormer';
    
      if ((email || '').trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASS) {
        return res.status(400).json({ error: 'Invalid admin credentials' });
      }
    
      let admin = await User.findOne({ email: ADMIN_EMAIL });
    
      if (!admin) {
        admin = await User.create({
          role: 'admin',
          firstName: 'Bookworm',
          lastName: 'Admin',
          email: ADMIN_EMAIL,
          password: ADMIN_PASS,      
          gender: 'Other',
          dob: new Date('1970-01-01'),
          status: 'active',           
        });
      } else if (admin.role !== 'admin') {
        admin.role = 'admin';
        await admin.save();
      }
    
      const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
      res.json({
        message: 'Admin login successful',
        token,
        user: {
          id: admin._id,
          role: admin.role,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
        },
      });
    } catch (err) {
      console.error('Admin login error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

module.exports = router;
