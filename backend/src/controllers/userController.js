const { User, Subscription, Notification } = require('../models');
const authService = require('../services/authService');
const apiResponse = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash', 'refresh_token', 'otp_code', 'reset_token'] },
      include: [{ model: Subscription, as: 'subscriptions', where: { status: 'active' }, required: false }],
    });
    return apiResponse.success(res, authService.sanitizeUser(user));
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) throw new AppError('User not found', 404);

    const { firstName, lastName, phone, avatarUrl } = req.body;
    await user.update({
      first_name: firstName ?? user.first_name,
      last_name: lastName ?? user.last_name,
      phone: phone ?? user.phone,
      avatar_url: avatarUrl ?? user.avatar_url,
    });

    return apiResponse.success(res, authService.sanitizeUser(user), 'Profile updated');
  } catch (err) {
    next(err);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const where = { user_id: req.user.id };
    if (unreadOnly === 'true') where.is_read = false;

    const offset = (page - 1) * limit;
    const { rows, count } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    });

    return apiResponse.paginated(res, { rows, count, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (err) {
    next(err);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!notification) throw new AppError('Notification not found', 404);
    await notification.update({ is_read: true });
    return apiResponse.success(res, notification);
  } catch (err) {
    next(err);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
    return apiResponse.success(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
