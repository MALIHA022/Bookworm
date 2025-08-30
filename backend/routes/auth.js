// localstorage info - sends back full user info - backend

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router(); 
const bcrypt = require('bcryptjs');
const authenticate = require('../middleware/authenticate');

// Get JWT secret with fallback
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
      
      // Generate token for automatic login after registration
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

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

      // Include role in token
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

    // In a real app, you would send this via email
    // For now, we'll return it in the response for testing
    res.json({
      message: 'Password reset token generated successfully',
      resetToken: resetToken, // Remove this in production
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

    // Check if reset token is valid and not expired
    if (user.resetPasswordToken !== resetToken || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password manually
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Use findByIdAndUpdate to bypass the pre-save hook
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

// Change Password (requires authentication)
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

// Suspend/Unsuspend User (Admin only)
router.patch('/users/:userId/status', authenticate, async (req, res) => {
  try {
    // Check if the current user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const { status, reason } = req.body;

    if (!status || !['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "active" or "suspended"' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from suspending themselves
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot suspend admin users' });
    }

    const oldStatus = user.status;
    user.status = status;

    // Add suspension record if suspending
    if (status === 'suspended' && reason) {
      if (!user.suspensionHistory) {
        user.suspensionHistory = [];
      }
      user.suspensionHistory.push({
        reason: reason,
        suspendedBy: req.user.id,
        suspendedAt: new Date(),
        previousStatus: oldStatus
      });
    }

    // Add reactivation record if reactivating
    if (status === 'active' && oldStatus === 'suspended') {
      if (!user.suspensionHistory) {
        user.suspensionHistory = [];
      }
      user.suspensionHistory.push({
        reason: 'Account reactivated',
        reactivatedBy: req.user.id,
        reactivatedAt: new Date(),
        previousStatus: oldStatus
      });
    }

    await user.save();

    res.json({ 
      message: `User ${status === 'suspended' ? 'suspended' : 'reactivated'} successfully`,
      user: {
        id: user._id,
        email: user.email,
        status: user.status
      }
    });

  } catch (err) {
    console.error('User status update error:', err);
    res.status(500).json({ error: 'Server error during status update' });
  }
});

// Get user suspension history (Admin only)
router.get('/users/:userId/suspension-history', authenticate, async (req, res) => {
  try {
    // Check if the current user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const user = await User.findById(userId).select('suspensionHistory firstName lastName email');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      suspensionHistory: user.suspensionHistory || [],
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Get suspension history error:', err);
    res.status(500).json({ error: 'Server error while fetching suspension history' });
  }
});

module.exports = router;
