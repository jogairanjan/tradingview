const { Router } = require('express');
const { body } = require('express-validator');
const indicatorsController = require('../controllers/indicatorsController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

router.post(
  '/chart',
  authenticate,
  validate([
    body('symbol').notEmpty().trim(),
    body('timeframe').optional().isString(),
    body('limit').optional().isInt({ min: 50, max: 500 }),
  ]),
  indicatorsController.getChartIndicators
);

module.exports = router;
