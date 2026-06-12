const { Router } = require('express');
const { body, param } = require('express-validator');
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const requireAdmin = require('../middleware/adminAuth');
const validate = require('../middleware/validate');

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', adminController.dashboard);
router.get('/analytics', adminController.analytics);
router.get('/logs', adminController.getAdminLogs);

// Users
router.get('/users', adminController.listUsers);
router.patch('/users/:id', validate([param('id').isUUID()]), adminController.updateUser);
router.delete('/users/:id', validate([param('id').isUUID()]), adminController.deleteUser);

// Signals
router.get('/signals', adminController.listSignals);
router.post(
  '/signals',
  validate([
    body('tradingPairId').isUUID(),
    body('type').isIn(['buy', 'sell', 'hold']),
    body('entryPrice').isFloat({ min: 0 }),
  ]),
  adminController.createSignal
);
router.put('/signals/:id', validate([param('id').isUUID()]), adminController.updateSignal);
router.delete('/signals/:id', validate([param('id').isUUID()]), adminController.deleteSignal);

// Subscriptions
router.get('/subscriptions', adminController.listSubscriptions);
router.post(
  '/subscriptions',
  validate([
    body('userId').isUUID(),
    body('plan').isIn(['free', 'basic', 'pro', 'enterprise']),
  ]),
  adminController.createSubscription
);

// Payments
router.get('/payments', adminController.listPayments);

// Notifications
router.post(
  '/notifications/broadcast',
  validate([body('title').notEmpty(), body('body').notEmpty()]),
  adminController.broadcast
);

// Trading pairs
router.get('/trading-pairs', adminController.listTradingPairs);
router.post(
  '/trading-pairs',
  validate([
    body('symbol').notEmpty(),
    body('baseAsset').notEmpty(),
    body('quoteAsset').notEmpty(),
  ]),
  adminController.createTradingPair
);
router.put('/trading-pairs/:id', validate([param('id').isUUID()]), adminController.updateTradingPair);
router.delete('/trading-pairs/:id', validate([param('id').isUUID()]), adminController.deleteTradingPair);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings/:key', adminController.updateSetting);

module.exports = router;
