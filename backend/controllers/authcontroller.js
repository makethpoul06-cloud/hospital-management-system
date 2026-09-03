const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let userService = null;
let auditLogger = null;

try {
  userService = require('../services/user.service');
} catch (error) {
  userService = null;
}

try {
  auditLogger = require('../services/auditLogger');
} catch (error) {
  auditLogger = null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-me';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'dev-refresh-secret-change-me';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const PASSWORD_MIN_LENGTH = 8;
const loginAttempts = new Map();

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function parseCookies(req) {
  const cookieHeader = req?.headers?.cookie || '';
  const cookies = {};

  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=');
    if (!name) return;

    const key = name.trim();
    const value = decodeURIComponent(rest.join('=').trim());
    cookies[key] = value;
  });

  return cookies;
}

function getBearerToken(req) {
  const authHeader = req.headers?.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim();
}

function isPasswordStrong(password) {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  return hasUppercase && hasLowercase && hasNumber && hasSymbol;
}

function getLoginKey(email, ipAddress) {
  return `${normalizeEmail(email)}:${ipAddress || 'unknown'}`;
}

function isBlocked(email, ipAddress) {
  const key = getLoginKey(email, ipAddress);
  const attempt = loginAttempts.get(key);
  if (!attempt) return false;

  if (attempt.lockedUntil && attempt.lockedUntil > Date.now()) {
    return true;
  }

  loginAttempts.delete(key);
  return false;
}

function recordFailedAttempt(email, ipAddress) {
  const key = getLoginKey(email, ipAddress);
  const existing = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  const now = Date.now();

  if (existing.lockedUntil && existing.lockedUntil > now) {
    return true;
  }

  const count = existing.count + 1;
  if (count >= MAX_LOGIN_ATTEMPTS) {
    loginAttempts.set(key, { count, lockedUntil: now + LOCKOUT_MINUTES * 60 * 1000 });
    return true;
  }

  loginAttempts.set(key, { count, lockedUntil: 0 });
  return false;
}

function clearLoginAttempts(email, ipAddress) {
  loginAttempts.delete(getLoginKey(email, ipAddress));
}

function logSecurityEvent(eventName, payload = {}) {
  if (auditLogger && typeof auditLogger.logSecurityEvent === 'function') {
    auditLogger.logSecurityEvent(eventName, payload);
    return;
  }

  console.warn(`[${eventName}]`, payload);
}

async function getUserService() {
  if (!userService || typeof userService.findUserByEmail !== 'function') {
    throw new Error('Authentication service is not configured');
  }

  return userService;
}

function safeUserPayload(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId || null,
    requires2FA: Boolean(user.requires2FA)
  };
}

function buildAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId || null,
      tokenVersion: user.tokenVersion || 0
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL, issuer: process.env.APP_NAME || 'HMS', audience: 'hms-client' }
  );
}

function buildRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      userId: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion || 0
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL, issuer: process.env.APP_NAME || 'HMS', audience: 'hms-client' }
  );
}

class AuthController {
  static async register(req, res) {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const firstName = typeof req.body?.firstName === 'string' ? req.body.firstName.trim() : '';
    const lastName = typeof req.body?.lastName === 'string' ? req.body.lastName.trim() : '';
    const role = typeof req.body?.role === 'string' ? req.body.role : 'USER';
    const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required.' });
    }

    if (!isPasswordStrong(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    try {
      const service = await getUserService();
      const existingUser = await service.findUserByEmail(email);

      if (existingUser) {
        return res.status(409).json({ error: 'User already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const newUser = {
        email,
        firstName,
        lastName,
        role,
        passwordHash,
        isActive: true,
        requires2FA: false,
        tokenVersion: 1
      };

      const createdUser = typeof service.createUser === 'function'
        ? await service.createUser(newUser)
        : { ...newUser, id: `user_${Date.now()}` };

      logSecurityEvent('USER_REGISTERED', {
        userId: createdUser?.id,
        email,
        role,
        ipAddress
      });

      return res.status(201).json({
        message: 'User registered successfully',
        user: safeUserPayload(createdUser)
      });
    } catch (error) {
      logSecurityEvent('REGISTER_ERROR', {
        email,
        ipAddress,
        error: error.message
      });

      return res.status(503).json({ error: 'Registration service unavailable' });
    }
  }

  static async login(req, res) {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (isBlocked(email, ipAddress)) {
      return res.status(429).json({
        error: 'Too many failed login attempts. Please try again later.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    try {
      const service = await getUserService();
      const user = await service.findUserByEmail(email);

      if (!user || !user.isActive) {
        recordFailedAttempt(email, ipAddress);
        logSecurityEvent('LOGIN_FAILED', {
          email,
          ipAddress,
          reason: 'Invalid credentials or inactive user'
        });

        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (user.requires2FA) {
        if (!req.body?.twoFactorCode) {
          return res.status(403).json({ error: 'Two-factor authentication is required.' });
        }
      }

      if (!user.password) {
        recordFailedAttempt(email, ipAddress);
        logSecurityEvent('LOGIN_FAILED', {
          userId: user.id,
          ipAddress,
          reason: 'Password hash missing'
        });

        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        const locked = recordFailedAttempt(email, ipAddress);
        logSecurityEvent('LOGIN_FAILED', {
          userId: user.id,
          ipAddress,
          reason: locked ? 'Account temporarily locked' : 'Incorrect password'
        });

        return res.status(401).json({ error: 'Invalid credentials' });
      }

      clearLoginAttempts(email, ipAddress);

      const accessToken = buildAccessToken(user);
      const refreshToken = buildRefreshToken(user);

      if (typeof service.updateLastLogin === 'function') {
        await service.updateLastLogin(user.id);
      }

      logSecurityEvent('LOGIN_SUCCESS', {
        userId: user.id,
        role: user.role,
        email,
        ipAddress
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      return res.status(200).json({
        accessToken,
        user: safeUserPayload(user)
      });
    } catch (error) {
      logSecurityEvent('LOGIN_ERROR', {
        email,
        ipAddress,
        error: error.message
      });

      return res.status(503).json({ error: 'Authentication service unavailable' });
    }
  }

  static async refreshToken(req, res) {
    const cookies = parseCookies(req);
    const refreshToken =
      cookies.refreshToken ||
      req.body?.refreshToken ||
      req.headers['x-refresh-token'];

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    try {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
      const service = await getUserService();
      const user = decoded.userId
        ? await service.findUserById?.(decoded.userId) || await service.findUserByEmail(decoded.email)
        : await service.findUserByEmail(decoded.email);

      if (!user || !user.isActive) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if ((user.tokenVersion || 0) !== (decoded.tokenVersion || 0)) {
        return res.status(401).json({ error: 'Session invalidated. Please log in again.' });
      }

      const newTokenVersion = (user.tokenVersion || 0) + 1;
      const nextUser = { ...user, tokenVersion: newTokenVersion };
      const newAccessToken = buildAccessToken(nextUser);
      const newRefreshToken = buildRefreshToken(nextUser);

      if (typeof service.updateTokenVersion === 'function') {
        await service.updateTokenVersion(user.id, newTokenVersion);
      }

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      return res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
  }

  static async verifyToken(req, res) {
    const token = getBearerToken(req) || req.body?.token || req.headers['x-access-token'];

    if (!token) {
      return res.status(401).json({ error: 'Authentication token is required.' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const service = await getUserService();
      const user = decoded.userId
        ? await service.findUserById?.(decoded.userId) || await service.findUserByEmail(decoded.email)
        : await service.findUserByEmail(decoded.email);

      if (!user || !user.isActive) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.status(200).json({ valid: true, user: safeUserPayload(user) });
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  static async getProfile(req, res) {
    const userId = req.user?.id || req.user?.userId || req.body?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated.' });
    }

    try {
      const service = await getUserService();
      const user = typeof service.findUserById === 'function'
        ? await service.findUserById(userId)
        : await service.findUserByEmail(req.user?.email || '');

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.status(200).json({ user: safeUserPayload(user) });
    } catch (error) {
      return res.status(500).json({ error: 'Unable to load profile' });
    }
  }

  static async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body || {};
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated.' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (!isPasswordStrong(newPassword)) {
      return res.status(400).json({
        error: 'New password must be at least 8 characters and include uppercase, lowercase, number, and symbol.'
      });
    }

    try {
      const service = await getUserService();
      const user = typeof service.findUserById === 'function'
        ? await service.findUserById(userId)
        : await service.findUserByEmail(req.user?.email || '');

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }

      if (typeof service.updateUserPassword !== 'function') {
        return res.status(503).json({ error: 'Password update is not configured.' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await service.updateUserPassword(user.id, passwordHash);

      logSecurityEvent('PASSWORD_CHANGED', { userId: user.id });
      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      logSecurityEvent('PASSWORD_CHANGE_ERROR', { userId, error: error.message });
      return res.status(500).json({ error: 'Password update failed' });
    }
  }

  static async updateRole(req, res) {
    const userId = req.params?.id;
    const role = typeof req.body?.role === 'string' ? req.body.role.toUpperCase() : '';
    const allowedRoles = ['NURSE', 'DOCTOR', 'PHARMACIST', 'LAB_TECH', 'RECEPTIONIST', 'BILLING', 'ADMIN'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: `Role must be one of: ${allowedRoles.join(', ')}.`
      });
    }

    try {
      const service = await getUserService();
      const user = await service.updateUserRole(userId, role);

      if (!user) {
        return res.status(404).json({ error: 'Staff account not found.' });
      }

      logSecurityEvent('ROLE_CHANGED', {
        changedBy: req.user.id,
        userId,
        role
      });

      return res.status(200).json({
        message: 'Staff role updated successfully. The user must log in again.',
        user: safeUserPayload(user)
      });
    } catch (error) {
      logSecurityEvent('ROLE_CHANGE_ERROR', { changedBy: req.user?.id, userId, error: error.message });
      return res.status(500).json({ error: 'Unable to update staff role.' });
    }
  }

  static async logout(req, res) {
    const userId = req.body?.userId || req.user?.id || null;
    const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';

    logSecurityEvent('LOGOUT', { userId, ipAddress });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  }
}

module.exports = { AuthController };