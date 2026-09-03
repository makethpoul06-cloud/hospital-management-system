const Staff = require('../models/staff');

const normalizeUser = (user) => {
  if (!user) return null;

  const plainUser = user.toObject ? user.toObject() : user;
  const id = plainUser._id ? plainUser._id.toString() : plainUser.id;

  return {
    ...plainUser,
    id,
    _id: plainUser._id || id
  };
};

const baseSelect = [
  '+password',
  '+passwordChangedAt',
  '+tokenVersion',
  '+failedLoginAttempts',
  '+lockedUntil',
  '+mustChangePassword',
  '+requires2FA',
  '+isActive',
  '+refreshToken'
].join(' ');

const getUserByQuery = async (query) => {
  const user = await Staff.findOne(query).select(baseSelect);
  return normalizeUser(user);
};

exports.findUserByEmail = async (email) => {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedEmail) return null;

  return getUserByQuery({ email: normalizedEmail });
};

exports.findUserById = async (id) => {
  if (!id) return null;

  const user = await Staff.findById(id).select(baseSelect);
  return normalizeUser(user);
};

exports.createUser = async (payload) => {
  const staff = new Staff({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    password: payload.password || payload.passwordHash,
    role: payload.role || 'NURSE',
    department: payload.department || null,
    isActive: payload.isActive !== false,
    requires2FA: Boolean(payload.requires2FA),
    mustChangePassword: payload.mustChangePassword !== false,
    tokenVersion: payload.tokenVersion || 0,
    ...payload
  });

  await staff.save();
  return normalizeUser(staff);
};

exports.updateLastLogin = async (userId) => {
  const user = await Staff.findByIdAndUpdate(
    userId,
    {
      lastLoginAt: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null
    },
    { new: true }
  ).select(baseSelect);

  return normalizeUser(user);
};

exports.updateUserPassword = async (userId, passwordHash) => {
  const user = await Staff.findByIdAndUpdate(
    userId,
    {
      password: passwordHash,
      passwordChangedAt: new Date(),
      mustChangePassword: false,
      failedLoginAttempts: 0,
      lockedUntil: null
    },
    { new: true, runValidators: true }
  ).select(baseSelect);

  return normalizeUser(user);
};

exports.updateTokenVersion = async (userId, tokenVersion) => {
  const user = await Staff.findByIdAndUpdate(
    userId,
    { tokenVersion },
    { new: true }
  ).select(baseSelect);

  return normalizeUser(user);
};

exports.updateUserRole = async (userId, role) => {
  const user = await Staff.findByIdAndUpdate(
    userId,
    { role, $inc: { tokenVersion: 1 } },
    { returnDocument: 'after', runValidators: true }
  ).select(baseSelect);

  return normalizeUser(user);
};

exports.setRefreshToken = async (userId, refreshToken) => {
  const user = await Staff.findByIdAndUpdate(
    userId,
    { refreshToken },
    { new: true }
  ).select(baseSelect);

  return normalizeUser(user);
};

exports.clearRefreshToken = async (userId) => {
  const user = await Staff.findByIdAndUpdate(
    userId,
    { refreshToken: null },
    { new: true }
  ).select(baseSelect);

  return normalizeUser(user);
};

exports.incrementFailedAttempts = async (userId) => {
  const user = await Staff.findById(userId).select('+failedLoginAttempts +lockedUntil');
  if (!user) return null;

  const attempts = (user.failedLoginAttempts || 0) + 1;
  const lockDuration = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

  user.failedLoginAttempts = attempts;
  user.lockedUntil = lockDuration;
  await user.save();

  return normalizeUser(user);
};

exports.resetFailedAttempts = async (userId) => {
  const user = await Staff.findByIdAndUpdate(
    userId,
    { failedLoginAttempts: 0, lockedUntil: null },
    { new: true }
  ).select(baseSelect);

  return normalizeUser(user);
};

exports.getStaffCount = async () => Staff.countDocuments();

exports.getActiveStaff = async (role) => {
  const query = role ? { role, isActive: true } : { isActive: true };
  const users = await Staff.find(query).select(baseSelect);
  return users.map(normalizeUser);
};

exports.findByEmailWithPassword = async (email) => {
  return exports.findUserByEmail(email);
};

exports.findByIdWithPassword = async (id) => {
  return exports.findUserById(id);
};

module.exports = exports;
