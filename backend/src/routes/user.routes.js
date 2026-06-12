const { Router } = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const notificationController = require('../controllers/notificationController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put(
  '/profile',
  validate([
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('phone').optional().trim(),
  ]),
  userController.updateProfile
);

router.get('/notifications', userController.getNotifications);
router.patch('/notifications/read-all', userController.markAllNotificationsRead);
router.patch('/notifications/:id/read', userController.markNotificationRead);
router.get('/notifications/:id', notificationController.getById);
router.delete('/notifications/:id', notificationController.remove);

module.exports = router;
