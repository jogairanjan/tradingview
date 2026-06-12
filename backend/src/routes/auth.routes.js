const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

const router = Router();

router.use(authLimiter);

router.post(
  '/register',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
  ]),
  authController.register
);

router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ]),
  authController.login
);

router.get('/me', authenticate, authController.getMe);

router.post('/logout', authenticate, authController.logout);

router.post(
  '/refresh',
  validate([body('refreshToken').notEmpty()]),
  authController.refresh
);

router.post(
  '/verify-otp',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }),
  ]),
  authController.verifyOtp
);

router.post(
  '/resend-otp',
  validate([body('email').isEmail().normalizeEmail()]),
  authController.resendOtp
);

router.post(
  '/forgot-password',
  validate([body('email').isEmail().normalizeEmail()]),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validate([
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }),
  ]),
  authController.resetPassword
);

router.post(
  '/change-password',
  authenticate,
  validate([
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
  ]),
  authController.changePassword
);

module.exports = router;
