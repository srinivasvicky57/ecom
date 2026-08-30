const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'msv-fallback-secret';

function generateToken(user) {
  return jwt.sign(
    { userId: user.userId, email: user.email, isAdmin: user.isAdmin },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, email, isAdmin }
    // Update lastActive timestamp (fire-and-forget)
    User.updateOne({ userId: decoded.userId }, { lastActive: new Date() }).catch(() => {});
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please login again.', expired: true });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { generateToken, authMiddleware };
