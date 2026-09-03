const jwt = require('jsonwebtoken');
const Staff = require('../models/staff');

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || '';

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '').trim();
  }

  if (req.headers['x-access-token']) {
    return String(req.headers['x-access-token']).trim();
  }

  const cookies = req.cookies || {};
  return cookies.accessToken || cookies.jwt || null;
};

const sanitizeUser = (user) => ({
  id: user._id ? user._id.toString() : user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  department: user.department,
  isActive: Boolean(user.isActive),
  requires2FA: Boolean(user.requires2FA),
  mustChangePassword: Boolean(user.mustChangePassword),
  tokenVersion: Number(user.tokenVersion || 0)
});

const isTwoFactorVerified = (req) => {
  const value = req.headers['x-2fa-verified'];
  return value === 'true' || value === true;
};

exports.protect = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not defined in environment variables.');
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: process.env.APP_NAME || 'HMS',
      audience: 'hms-client'
    });

    const userId = decoded.userId || decoded.sub || decoded.id;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload.' });
    }

    const currentUser = await Staff.findById(userId).select(
      '+isActive +passwordChangedAt +mustChangePassword +requires2FA +refreshToken +tokenVersion +lockedUntil'
    );

    if (!currentUser) {
      return res.status(401).json({ error: 'The staff account belonging to this token no longer exists.' });
    }

    if (!currentUser.isActive) {
      return res.status(403).json({ error: 'Account suspended. Please contact hospital administration.' });
    }

    if (currentUser.lockedUntil && currentUser.lockedUntil > new Date()) {
      return res.status(423).json({
        error: 'Account is temporarily locked due to repeated failed login attempts.'
      });
    }

    if (currentUser.passwordChangedAt && decoded.iat) {
      const changedTimestamp = Math.floor(currentUser.passwordChangedAt.getTime() / 1000);
      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({ error: 'Password was recently changed. Please log in again.' });
      }
    }

    if ((decoded.tokenVersion ?? 0) !== Number(currentUser.tokenVersion || 0)) {
      return res.status(401).json({ error: 'Session invalidated. Please log in again.' });
    }

    if (currentUser.mustChangePassword && !req.originalUrl.includes('/change-password')) {
      return res.status(403).json({
        error: 'You must update your temporary password before accessing protected resources.',
        requiresPasswordChange: true
      });
    }

    if (currentUser.requires2FA && !isTwoFactorVerified(req)) {
      return res.status(403).json({
        error: 'Two-factor verification is required to access this resource.',
        requires2FA: true
      });
    }

    req.user = sanitizeUser(currentUser);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid or corrupted authorization token.' });
    }

    console.error('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Authentication failed.' });
  }
};

exports.restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({ error: 'Internal server error: restrictTo called before protect' });
    }

    const normalizedAllowed = allowedRoles.map((role) => String(role).toUpperCase());
    const userRole = String(req.user.role || '').toUpperCase();

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden: You do not have the required permissions to perform this action.'
      });
    }

    next();
  };
};

exports.authorize = exports.restrictTo;