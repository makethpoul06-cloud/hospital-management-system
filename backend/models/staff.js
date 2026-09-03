const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    phone: {
      type: String,
      trim: true,
      default: null,
      match: [/^[0-9+()\-\s]{7,20}$/, 'Please enter a valid phone number']
    },
    role: {
      type: String,
      enum: [
        'ADMIN',
        'DOCTOR',
        'NURSE',
        'PHARMACIST',
        'LAB_TECH',
        'RECEPTIONIST',
        'BILLING'
      ],
      default: 'NURSE',
      required: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department assignment is required']
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: null,
      sparse: true
    },
    specialization: {
      type: String,
      trim: true,
      default: null
    },
    dutyStatus: {
      type: String,
      enum: ['OFF_DUTY', 'ON_DUTY', 'ON_CALL'],
      default: 'OFF_DUTY'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    requires2FA: {
      type: Boolean,
      default: true
    },
    twoFactorSecret: {
      type: String,
      select: false,
      default: null
    },
    mustChangePassword: {
      type: Boolean,
      default: true
    },
    refreshToken: {
      type: String,
      select: false,
      default: null
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockedUntil: {
      type: Date,
      default: null
    },
    tokenVersion: {
      type: Number,
      default: 0
    },
    passwordChangedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

staffSchema.index({ role: 1 });
staffSchema.index({ department: 1 });
staffSchema.index({ isActive: 1, role: 1 });

staffSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

staffSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const password = String(this.password || '');
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!strongPassword.test(password)) {
    throw new Error('Password must include uppercase, lowercase, number, and symbol');
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(password, salt);
  this.passwordChangedAt = new Date();
});

staffSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

staffSchema.methods.resetFailedLoginAttempts = function () {
  this.failedLoginAttempts = 0;
  this.lockedUntil = null;
};

module.exports = mongoose.model('Staff', staffSchema);