const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post'); 
const router = express.Router();
const authenticate = require('../middleware/authenticate');

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); 
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { firstName, lastName, email, gender, dob } = user;
    res.json({ firstName, lastName, email, gender, dob });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  const { firstName, lastName, email, gender, dob } = req.body;

  // Validate input
  if (!firstName || !lastName || !email || !gender || !dob) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user details
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.gender = gender;
    user.dob = dob;

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to update the user's password (Example)
router.put('/update-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Please provide both current and new passwords' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update the password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// get posts
router.get('/posts', authenticate, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .populate('user', 'firstName lastName')
    .lean();
    res.json({ posts });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

// Get notifications
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('warnings');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const unreadWarnings = user.warnings.filter(warning => !warning.read);
    
    // sender info
    const populatedWarnings = await Promise.all(
      unreadWarnings.map(async (warning) => {
        if (warning.type === 'message' && warning.fromUser) {
          try {
            const sender = await User.findById(warning.fromUser).select('firstName lastName email');
            if (sender) {
              return {
                ...warning.toObject(),
                senderName: `${sender.firstName} ${sender.lastName}`,
                senderEmail: sender.email
              };
            }
          } catch (err) {
            console.error('Error populating sender info:', err);
          }
        }
        return warning.toObject();
      })
    );
    
    res.json({ warnings: populatedWarnings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

// Mark as read
router.put('/notifications/:warningId/read', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const warning = user.warnings.id(req.params.warningId);
    if (!warning) {
      return res.status(404).json({ error: 'Warning not found' });
    }

    warning.read = true;
    await user.save();

    res.json({ message: 'Warning marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating warning' });
  }
});

// Send a message to a post owner
router.post('/message', authenticate, async (req, res) => {
  try {
    const { postId, message, isReply, originalMessageId } = req.body;
    if (!postId || !message) {
      return res.status(400).json({ error: 'postId and message are required' });
    }

    const post = await Post.findById(postId).populate('user', 'firstName lastName');
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const recipient = await User.findById(post.user);
    if (!recipient) return res.status(404).json({ error: 'Recipient not found' });

    if (isReply && originalMessageId) {
      const originalMessage = recipient.warnings.id(originalMessageId);
      if (originalMessage && originalMessage.fromUser) {
        const originalSender = await User.findById(originalMessage.fromUser);
        if (originalSender) {
          // reply
          originalSender.warnings.push({
            type: 'message',
            message: message,
            fromUser: req.user.id,
            post: post._id,
            postTitle: post.title || post.bookTitle,
            postType: post.type,
            postDescription: post.description || post.content,
            postAuthor: post.author,
            postPrice: post.price,
            at: new Date(),
            isReply: true,
            originalMessage: originalMessage.message,
            conversationId: originalMessageId
          });
          await originalSender.save();
        }
      }
    } else {
      // New message
      recipient.warnings.push({
        type: 'message',
        message,
        fromUser: req.user.id,
        post: post._id,
        postTitle: post.title || post.bookTitle,
        postType: post.type,
        postDescription: post.description || post.content,
        postAuthor: post.author,
        postPrice: post.price,
        at: new Date(),
        isReply: false
      });

      await recipient.save();
    }

    res.json({ message: 'Message sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error sending message' });
  }
});

module.exports = router;