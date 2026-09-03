const express = require('express');
const { AuthController } = require('../controllers/authcontroller');
const { protect, restrictTo } = require('../middleware/authmiddleware');

// Import rate limiters to prevent brute-force attacks
const { loginLimiter, strictActionLimiter } = require('../middleware/rateLimiter'); 

const router = express.Router();

// ==========================================
// 1. PUBLIC ROUTES (Heavily Rate-Limited)
// ==========================================
// Attackers use bots to hit these endpoints. We must limit their requests.
router.post('/login', loginLimiter, AuthController.login);
router.post('/refresh', strictActionLimiter, AuthController.refreshToken);


// ==========================================
// 2. ADMIN-PROVISIONED ROUTES
// ==========================================
// CRITICAL FIX: Staff cannot self-register. Only an ADMIN can create a new staff account.
router.post('/register', protect, restrictTo('ADMIN'), AuthController.register);


// ==========================================
// 3. PROTECTED ROUTES (Requires Authentication)
// ==========================================
// Applying `protect` to the router instance here applies it to all routes below it, 
// keeping the code clean and preventing accidental un-protected routes.
router.use(protect);

router.post('/logout', AuthController.logout);
router.get('/verify', AuthController.verifyToken);
router.get('/me', AuthController.getProfile);
router.patch('/users/:id/role', restrictTo('ADMIN'), AuthController.updateRole);

// Password changes must be rate-limited to prevent automated password guessing
router.post('/change-password', strictActionLimiter, AuthController.changePassword);


// ==========================================
// 4. ROLE-RESTRICTED ROUTES
// ==========================================
// 'protect' is already applied from above, so we just need 'restrictTo'
router.get('/admin-test', restrictTo('ADMIN'), (req, res) => {
    res.status(200).json({ 
        message: 'Admin access verified.', 
        user: { id: req.user._id, role: req.user.role } 
    });
});

module.exports = router;