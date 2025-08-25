module.exports = function requireAdmin(req, res, next) {
  try {
    if (req.user?.role === 'admin') return next();
    return res.status(403).json({ error: 'Admin only' });
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
