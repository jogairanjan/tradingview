const { Router } = require('express');
const { query } = require('express-validator');
const scannerController = require('../controllers/scannerController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

router.get(
  '/',
  authenticate,
  validate([
    query('query').optional().isString(),
    query('market').optional().isString(),
    query('preset').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 500 }),
  ]),
  scannerController.scan
);

module.exports = router;

