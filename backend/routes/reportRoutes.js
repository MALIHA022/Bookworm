// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Reports');
const authenticate = require('../middleware/authenticate'); // make sure user is logged in

// Create a report
router.post('/', authenticate, async (req, res) => {
  try {
    const { postId, reason } = req.body;
    if (!postId || !reason) {
      return res.status(400).json({ message: 'Post and reason are required' });
    }

    const report = new Report({
      post: postId,
      reportedBy: req.user._id, // comes from authenticate middleware
      reason
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting report', error });
  }
});

module.exports = router;
