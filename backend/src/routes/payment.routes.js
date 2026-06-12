const { Router } = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const authenticate = require('../middleware/auth');
const requireAdmin = require('../middleware/adminAuth');
const validate = require('../middleware/validate');

const router = Router();

router.use(authenticate);

router.get('/', paymentController.list);

router.post(
  '/',
  validate([
    body('amount').isFloat({ min: 0 }),
    body('subscriptionId').optional().isUUID(),
  ]),
  paymentController.create
);

router.patch('/:id/complete', requireAdmin, paymentController.complete);

module.exports = router;
