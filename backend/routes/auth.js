// localstorage info - sends back full user info - backend

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router(); 
const bcrypt = require('bcryptjs');
const authenticate = require('../middleware/authenticate');
const JWT_SECRET = process.env.JWT_SECRET || 'bookwormsecret';

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
      
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
      
      res.json({
        message: 'User registered successfully!',
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

      // Check if user is suspended
      if (user.status === 'suspended') {
        return res.status(403).json({ 
          error: 'Account suspended for suspicious activity. Please contact support for assistance.' 
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

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
    
      // Fixed creds for admin
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
    
      const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    
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

// Forgot Password - Send reset token
router.post('/forgot-password', async (req, res) => {
  console.log('Forgot password request received:', req.body);
  try {
    const { email } = req.body;
    if (!email) {
      console.log('No email provided');
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailNorm = email.trim().toLowerCase();
    console.log('Looking for user with email:', emailNorm);
    
    const user = await User.findOne({ email: emailNorm });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found with email:', emailNorm);
      return res.status(404).json({ error: 'User not found with this email' });
    }

    // Generate reset token (valid for 1 hour)
    console.log('Generating reset token for user:', user._id);
    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    
    // Store reset token in user document
    console.log('Storing reset token in user document');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();
    console.log('Reset token saved successfully');

    res.json({
      message: 'Password reset token generated successfully',
      resetToken: resetToken, 
      expiresIn: '1 hour'
    });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error during password reset' });
  }
});

// Reset Password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    // Verify the reset token
    const decoded = jwt.verify(resetToken, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check token validity
    if (user.resetPasswordToken !== resetToken || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined
    });

    res.json({ message: 'Password reset successfully' });

  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Reset token has expired' });
    }
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error during password reset' });
  }
});

// Change Password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Server error during password change' });
  }
});

// Request Account Activation
router.post('/request-activation', async (req, res) => {
  console.log('Activation request received:', req.body);
  try {
    const { email } = req.body;
    if (!email) {
      console.log('No email provided');
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailNorm = email.trim().toLowerCase();
    console.log('Looking for user with email:', emailNorm);
    
    const user = await User.findOne({ email: emailNorm });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found with email:', emailNorm);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User status:', user.status);
    if (user.status !== 'suspended') {
      console.log('User is not suspended, status:', user.status);
      return res.status(400).json({ error: 'Account is not suspended' });
    }

    // Create activation request notification
    const activationRequest = {
      message: `Account activation requested from user ${user.email}`,
      at: new Date(),
      userId: user._id,
      userEmail: user.email,
      type: 'activation_request',
      status: 'pending'
    };

    console.log('Adding activation request to warnings:', activationRequest);
    
    user.warnings.push(activationRequest);
    console.log('Warnings array length after push:', user.warnings.length);
    
    await user.save();
    console.log('User saved successfully');

    res.json({ message: 'Activation request sent successfully' });

  } catch (err) {
    console.error('Request activation error:', err);
    console.error('Error details:', err.message);
    res.status(500).json({ error: 'Server error during activation request' });
  }
});

module.exports = router;
