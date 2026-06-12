const { Router } = require('express');
const { body } = require('express-validator');
const pythonController = require('../controllers/pythonController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

router.use(authenticate);

router.get('/script', pythonController.getScript);
router.put('/script', validate([body('code').isString()]), pythonController.saveScript);
router.post(
  '/run',
  validate([
    body('code').isString().notEmpty(),
    body('symbol').optional().isString(),
    body('timeframe').optional().isString(),
  ]),
  pythonController.runScript
);

module.exports = router;
