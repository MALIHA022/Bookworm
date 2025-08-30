// routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticate'); 
const requireAdmin = require('../middleware/requireAdmin');
const mongoose = require('mongoose');  
router.get('/ping', (req, res) => res.json({ ok: true }));

const Post = require('../models/Post');
const User = require('../models/User');
const Report = require('../models/Reports');

// Try to load Report model if it exists
let Reports = null;
try {
  Reports = require('../models/Reports');
} catch (e) {
  Reports = null; 
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

// Chart data for analytics
router.get('/chart-data', authenticate, requireAdmin, async (req, res) => {
  try {
    // Get data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Generate date labels for the last 30 days
    const dateLabels = [];
    const dateData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dateLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      dateData.push(date);
    }

    // Get posts data
    const postsData = await Promise.all(
      dateData.map(async (date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        return await Post.countDocuments({
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
      })
    );

    // Get reports data
    let reportsData = new Array(30).fill(0);
    if (Report) {
      reportsData = await Promise.all(
        dateData.map(async (date) => {
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);
          
          return await Report.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
          });
        })
      );
    }

    // Get users data
    const usersData = await Promise.all(
      dateData.map(async (date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        return await User.countDocuments({
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
      })
    );

    // Return the chart data
    res.json({
      posts: {
        labels: dateLabels,
        data: postsData
      },
      reports: {
        labels: dateLabels,
        data: reportsData
      },
      users: {
        labels: dateLabels,
        data: usersData
      }
    });
  } catch (err) {
    console.error('Error fetching chart data:', err);
    res.status(500).json({ error: 'Error fetching chart data' });
  }
});

//list reports 
router.get('/reports', authenticate, requireAdmin, async (req, res) => {
  if (!Report) return res.json({ reports: [] }); // no model yet; return empty list
  const { status } = req.query;

  let query = {};
  if (status === 'pending') {
    query = { status: 'pending' };
  } else if (status === 'resolved') {
    query = { status: { $in: ['resolved', 'dismissed'] } };
  } // else: no status filter -> all

  const reports = await Report.find(query)
    .sort({ createdAt: -1 })
    .populate('post', 'type title bookTitle author user createdAt')
    .populate('reportedBy', 'firstName lastName email');
  res.json({ reports });
});

// update a report (status/feedback)
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

// Admin resolves a report (removes post or sends warning)
router.put('/reports/:reportId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { action, warningMessage } = req.body;
    const report = await Report.findById(req.params.reportId)
      .populate('post', 'user')
      .populate('reportedBy', 'firstName lastName');

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (action === 'remove') {
      // Remove the reported post
      await Post.findByIdAndDelete(report.post._id);
      
      // Clean up from all users' arrays
      await User.updateMany({}, { 
        $pull: { 
          bookmarks: report.post._id, 
          wishlist: report.post._id, 
          likedPosts: report.post._id 
        } 
      });

      // Mark all reports for this post as resolved with action 'post_removed'
      await Report.updateMany(
        { post: report.post._id },
        { $set: { status: 'resolved', adminAction: 'post_removed' } }
      );

      res.json({ message: 'Post removed successfully' });
    } else if (action === 'warn') {
      if (!warningMessage) {
        return res.status(400).json({ error: 'Warning message is required' });
      }

      // Add warning to the user who posted the reported content
      const postUser = await User.findById(report.post.user);
      if (postUser) {
        // Get post details for the warning
        const post = await Post.findById(report.post._id);
        if (post) {
          postUser.warnings.push({
            message: warningMessage,
            at: new Date(),
            adminId: req.user.id,
            type: 'admin_warning',
            post: post._id,
            postTitle: post.title || post.bookTitle,
            postType: post.type,
            postDescription: post.description || post.content,
            postAuthor: post.author,
            postPrice: post.price
          });
        } else {
          postUser.warnings.push({
            message: warningMessage,
            at: new Date(),
            adminId: req.user.id,
            type: 'admin_warning'
          });
        }
        await postUser.save();
      }

      report.status = 'resolved';
      report.adminAction = 'warning_sent';
      report.warningMessage = warningMessage;
      await report.save();

      res.json({ message: 'Warning sent successfully' });
    } else if (action === 'dismiss') {
      report.status = 'dismissed';
      report.adminAction = 'dismissed';
      await report.save();
      res.json({ message: 'Report dismissed' });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing report' });
  }
});

// Get user warnings for admin view
router.get('/users/:userId/warnings', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('warnings firstName lastName');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ warnings: user.warnings, user: { firstName: user.firstName, lastName: user.lastName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching user warnings' });
  }
});

// Toggle user status (suspend/unsuspend)
router.patch('/users/:userId/toggle-status', authenticate, requireAdmin, async (req, res) => {
  console.log('Toggle status request received:', {
    userId: req.params.userId,
    user: req.user,
    method: req.method,
    url: req.url
  });
  
  try {
    const user = await User.findById(req.params.userId);
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found with ID:', req.params.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Current user status:', user.status);
    
    // Toggle between active and suspended
    user.status = user.status === 'suspended' ? 'active' : 'suspended';
    console.log('New user status:', user.status);
    
    await user.save();
    console.log('User saved successfully');

    res.json({ 
      message: `User ${user.status === 'active' ? 'activated' : 'suspended'} successfully`,
      status: user.status 
    });
  } catch (err) {
    console.error('Toggle user status error:', err);
    res.status(500).json({ error: 'Server error during status update' });
  }
});

// // Get activation requests
// router.get('/activation-requests', authenticate, requireAdmin, async (req, res) => {
//   try {
//     const status = String(req.query.status || 'pending');
//     const users = await User.find({
//       'warnings.type': 'activation_request',
//       'warnings.status': status
//     }).select('firstName lastName email warnings');

//     const activationRequests = [];
//     users.forEach(user => {
//       user.warnings.forEach(w => {
//         if (w.type === 'activation_request' && w.status === status) {
//           activationRequests.push({
//             id: w._id,
//             type: w.type,
//             status: w.status,
//             message: w.message,
//             at: w.at,
//             userId: w.userId,       // optional: if you stored it
//             userEmail: w.userEmail || user.email,
//             userName: `${user.firstName} ${user.lastName}`,
//             read: !!w.read
//           });
//         }
//       });
//     });


//     activationRequests.sort((a, b) => new Date(b.at) - new Date(a.at));

//     res.json({ activationRequests });
//   } catch (err) {
//     console.error('Get activation requests error:', err);
//     res.status(500).json({ error: 'Server error fetching activation requests' });
//   }
// });

// router.get('/notifications', authenticate, requireAdmin, async (req, res) => {
//   try {
//     const unreadOnly = String(req.query.unread || '') === 'true';
//     const typeFilter = req.query.type ? String(req.query.type) : null;

//     // Pull users that have any warnings at all. We’ll filter in memory for clarity.
//     const users = await User.find({ 'warnings.0': { $exists: true } })
//       .select('firstName lastName email warnings');

//     const notifications = [];
//     users.forEach(user => {
//       (user.warnings || []).forEach(w => {
//         if (typeFilter && w.type !== typeFilter) return;
//         if (unreadOnly && w.read === true) return;

//         notifications.push({
//           id: w._id,
//           type: w.type,
//           status: w.status,
//           message: w.message,
//           at: w.at,
//           userId: w.userId,                 // optional: if you stored it
//           userEmail: w.userEmail || user.email,
//           userName: `${user.firstName} ${user.lastName}`,
//           read: !!w.read
//         });
//       });
//     });

//     // Sort newest first
//     notifications.sort((a, b) => new Date(b.at) - new Date(a.at));

//     res.json({ notifications });
//   } catch (err) {
//     console.error('Get admin notifications error:', err);
//     res.status(500).json({ error: 'Server error fetching notifications' });
//   }
// });

// // router.patch('/notifications/:warningId/read', authenticate, requireAdmin, async (req, res) => {
// //   try {
// //     const wid = req.params.id;
// //     const result = await User.findOneAndUpdate(
// //       { 'warnings._id': wid },
// //       { $set: { 'warnings.$.read': true } },
// //       { new: true }
// //     ).select('_id');

// //     if (!result) return res.status(404).json({ error: 'Notification not found' });
// //     res.json({ ok: true });
// //   } catch (err) {
// //     console.error('Mark notification read error:', err);
// //     res.status(500).json({ error: 'Server error updating notification' });
// //   }
// // });
// router.put('/notifications/:warningId/read', authenticate, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const warning = user.warnings.id(req.params.warningId);
//     if (!warning) {
//       return res.status(404).json({ error: 'Warning not found' });
//     }

//     warning.read = true;
//     await user.save();

//     res.json({ message: 'Warning marked as read' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Error updating warning' });
//   }
// });


// router.patch('/activation-requests/:id/status', authenticate, requireAdmin, async (req, res) => {
//   try {
//     const wid = req.params.id;
//     const { status } = req.body;
//     if (!['approved', 'rejected', 'pending'].includes(status)) {
//       return res.status(400).json({ error: 'Invalid status' });
//     }

//     const doc = await User.findOneAndUpdate(
//       { 'warnings._id': wid, 'warnings.type': 'activation_request' },
//       { $set: { 'warnings.$.status': status, 'warnings.$.read': true } },
//       { new: true }
//     ).select('_id');

//     if (!doc) return res.status(404).json({ error: 'Activation request not found' });
//     res.json({ ok: true });
//   } catch (err) {
//     console.error('Update activation request status error:', err);
//     res.status(500).json({ error: 'Server error updating activation request' });
//   }
// });

// Get activation requests
router.get('/activation-requests', authenticate, requireAdmin, async (req, res) => {
  try {
    const status = String(req.query.status || 'pending');

    const users = await User.find({
      'warnings.type': 'activation_request',
      'warnings.status': status
    }).select('firstName lastName email warnings');

    const activationRequests = [];
    users.forEach(user => {
      (user.warnings || []).forEach(w => {
        if (w.type === 'activation_request' && w.status === status) {
          activationRequests.push({
            id: w._id, // normalize as id
            type: w.type,
            status: w.status,
            message: w.message,
            at: w.at,
            userId: w.userId,
            userEmail: w.userEmail || user.email,
            userName: `${user.firstName} ${user.lastName}`,
            read: !!w.read
          });
        }
      });
    });

    activationRequests.sort((a, b) => new Date(b.at) - new Date(a.at));
    res.json({ activationRequests });
  } catch (err) {
    console.error('Get activation requests error:', err);
    res.status(500).json({ error: 'Server error fetching activation requests' });
  }
});

// Unified admin notifications
router.get('/notifications', authenticate, requireAdmin, async (req, res) => {
  try {
    const unreadOnly = String(req.query.unread || '') === 'true';
    const typeFilter = req.query.type ? String(req.query.type) : null;

    const users = await User.find({ 'warnings.0': { $exists: true } })
      .select('firstName lastName email warnings');

    const notifications = [];
    users.forEach(user => {
      (user.warnings || []).forEach(w => {
        if (typeFilter && w.type !== typeFilter) return;
        if (unreadOnly && w.read === true) return;

        notifications.push({
          id: w._id, // normalize as id
          type: w.type,
          status: w.status,
          message: w.message,
          at: w.at,
          userId: w.userId,
          userEmail: w.userEmail || user.email,
          userName: `${user.firstName} ${user.lastName}`,
          read: !!w.read
        });
      });
    });

    notifications.sort((a, b) => new Date(b.at) - new Date(a.at));
    res.json({ notifications });
  } catch (err) {
    console.error('Get admin notifications error:', err);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
});

/**
 * ADMIN: mark any warning (by warning _id) as read
 * PATCH /api/admin/notifications/:id/read
 */
router.patch('/notifications/:id/read', authenticate, requireAdmin, async (req, res) => {
  try {
    const wid = req.params.id;
    if (!wid || !mongoose.isValidObjectId(wid)) {
      return res.status(400).json({ error: 'Invalid notification id' });
    }

    const doc = await User.findOneAndUpdate(
      { 'warnings._id': wid },
      { $set: { 'warnings.$.read': true } },
      { new: true }
    ).select('_id');

    if (!doc) return res.status(404).json({ error: 'Notification not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Mark notification read error:', err);
    res.status(500).json({ error: 'Server error updating notification' });
  }
});

// If you also want BULK read for admin (optional)
/*
router.patch('/notifications/read', authenticate, requireAdmin, async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    const valid = ids.filter(id => mongoose.isValidObjectId(id));
    if (!valid.length) return res.status(400).json({ error: 'No valid ids provided' });

    const result = await User.updateMany(
      { 'warnings._id': { $in: valid } },
      { $set: { 'warnings.$[w].read': true } },
      { arrayFilters: [{ 'w._id': { $in: valid } }] }
    );

    res.json({ ok: true, matched: result.matchedCount, modified: result.modifiedCount });
  } catch (err) {
    console.error('Bulk mark read error:', err);
    res.status(500).json({ error: 'Server error updating notifications' });
  }
});
*/

// Update activation request status
router.patch('/activation-requests/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const wid = req.params.id;
    const { status } = req.body;
    if (!mongoose.isValidObjectId(wid)) {
      return res.status(400).json({ error: 'Invalid activation request id' });
    }
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const doc = await User.findOneAndUpdate(
      { 'warnings._id': wid, 'warnings.type': 'activation_request' },
      { $set: { 'warnings.$.status': status, 'warnings.$.read': true } },
      { new: true }
    ).select('_id');

    if (!doc) return res.status(404).json({ error: 'Activation request not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Update activation request status error:', err);
    res.status(500).json({ error: 'Server error updating activation request' });
  }
});

module.exports = router;
