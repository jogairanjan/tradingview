const { Router } = require('express');
const { body, param } = require('express-validator');
const signalController = require('../controllers/signalController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

// Public signal listing
router.get('/', signalController.list);

// Protected watchlist routes (must be before /:id)
router.get('/user/watchlist', authenticate, signalController.watchlist);
router.post(
  '/user/watchlist',
  authenticate,
  validate([body('tradingPairId').isUUID()]),
  signalController.addWatchlist
);
router.delete(
  '/user/watchlist/:id',
  authenticate,
  validate([param('id').isUUID()]),
  signalController.removeWatchlist
);

router.get('/:id', validate([param('id').isUUID()]), signalController.getById);
router.get('/:id/history', validate([param('id').isUUID()]), signalController.history);

// Protected routes
router.use(authenticate);

router.post(
  '/',
  validate([
    body('tradingPairId').isUUID(),
    body('type').isIn(['buy', 'sell', 'hold']),
    body('entryPrice').isFloat({ min: 0 }),
  ]),
  signalController.create
);

router.put('/:id', validate([param('id').isUUID()]), signalController.update);
router.delete('/:id', validate([param('id').isUUID()]), signalController.remove);

module.exports = router;
