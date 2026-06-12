const { Router } = require('express');
const marketController = require('../controllers/marketController');
const authenticate = require('../middleware/auth');

const router = Router();

router.get('/tickers', authenticate, marketController.getTickers);

module.exports = router;
