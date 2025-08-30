const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'bookwormsecret';
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    const user = await User.findById(userId).select('role firstName lastName email');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = { id: userId.toString(), role: user.role };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
