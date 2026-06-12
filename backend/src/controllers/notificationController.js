const { Notification } = require('../models');
const apiResponse = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');

const getById = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!notification) throw new AppError('Notification not found', 404);
    return apiResponse.success(res, notification);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!notification) throw new AppError('Notification not found', 404);
    await notification.destroy();
    return apiResponse.success(res, null, 'Notification deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getById, remove };
