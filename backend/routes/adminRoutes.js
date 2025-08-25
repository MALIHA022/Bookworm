// routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticate'); 
const requireAdmin = require('../middleware/requireAdmin');

router.get('/ping', (req, res) => res.json({ ok: true }));

const Post = require('../models/Post');
const User = require('../models/User');

// Try to load Report model if it exists
let Report = null;
try {
  Report = require('../models/Reports');
} catch (e) {
  Report = null; 
}

// Metrics
router.get('/metrics', authenticate, requireAdmin, async (req, res) => {
  const [totalPosts, totalUsers] = await Promise.all([
    Post.countDocuments(),
    User.countDocuments(),
  ]);

  let totalReports = 0, pendingReports = 0;
  if (Report) {
    totalReports = await Report.countDocuments();
    pendingReports = await Report.countDocuments({ status: 'pending' });
  }

  res.json({ totalPosts, totalUsers, totalReports, pendingReports });
});

// NEW: list reports (optional ?status=pending|actioned|dismissed)
router.get('/reports', authenticate, requireAdmin, async (req, res) => {
  if (!Report) return res.json([]); // no model yet; return empty list
  const { status } = req.query;
  const q = status ? { status } : {};
  const reports = await Report.find(q)
    .sort({ createdAt: -1 })
    .populate('post', 'type title bookTitle author user createdAt')
    .populate('reportedBy', 'firstName lastName email');
  res.json(reports);
});

// NEW: update a report (status/feedback)
router.patch('/reports/:id', authenticate, requireAdmin, async (req, res) => {
  if (!Report) {
    return res.status(501).json({ error: 'Report model not available' });
  }
  const { status, feedback } = req.body;
  const updated = await Report.findByIdAndUpdate(
    req.params.id,
    { ...(status && { status }), ...(feedback !== undefined && { feedback }) },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: 'Report not found' });
  res.json(updated);
});

module.exports = router;
