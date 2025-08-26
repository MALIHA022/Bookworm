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

// List users 
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
  const skip = (page - 1) * limit;

  const filter = { role: { $ne: 'admin' } };
  if (q) {
    filter.$or = [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName:  { $regex: q, $options: 'i' } },
      { email:     { $regex: q, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('firstName lastName email role gender dob status createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json({
    users,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  });
});

//see all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'firstName lastName');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching posts.' });
  }
});


module.exports = router;
