module.exports = function(req, res, next) {
    // Check if user is admin
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied. Admin required.' });
    }
  };