const { Router } = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const signalRoutes = require('./signal.routes');
const paymentRoutes = require('./payment.routes');
const adminRoutes = require('./admin.routes');
const pythonRoutes = require('./python.routes');
const scannerRoutes = require('./scanner.routes');
const indicatorsRoutes = require('./indicators.routes');
const marketRoutes = require('./market.routes');
const signalController = require('../controllers/signalController');
const authenticate = require('../middleware/auth');
const requireAdmin = require('../middleware/adminAuth');
const { checkHealth } = require('../services/pythonBridgeService');

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/health', async (req, res) => {
  const pythonHealthy = await checkHealth();
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      pythonBridge: pythonHealthy ? 'connected' : 'unavailable',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/signals', signalRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/python', pythonRoutes);
router.use('/scanner', scannerRoutes);
router.use('/indicators', indicatorsRoutes);
router.use('/market', marketRoutes);

// Admin-only Python signal generation trigger
router.post('/signals/generate', authenticate, requireAdmin, signalController.generate);

module.exports = router;
