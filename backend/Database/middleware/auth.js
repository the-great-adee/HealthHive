// Database/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Map decoded userId to id for compatibility with routes
    req.user = {
      id: decoded.userId,  // Map userId to id
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};