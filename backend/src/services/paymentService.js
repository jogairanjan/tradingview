const { Op } = require('sequelize');
const { Payment, Subscription, User } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const createPayment = async ({ userId, subscriptionId, amount, currency, provider, providerRef, metadata }) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found', 404);

  if (subscriptionId) {
    const sub = await Subscription.findByPk(subscriptionId);
    if (!sub) throw new AppError('Subscription not found', 404);
  }

  return Payment.create({
    user_id: userId,
    subscription_id: subscriptionId,
    amount,
    currency: currency || 'USD',
    provider: provider || 'stripe',
    provider_ref: providerRef,
    metadata,
    status: 'pending',
  });
};

const completePayment = async (paymentId, providerRef = null) => {
  const payment = await Payment.findByPk(paymentId, { include: [{ model: Subscription, as: 'subscription' }] });
  if (!payment) throw new AppError('Payment not found', 404);

  await payment.update({
    status: 'completed',
    paid_at: new Date(),
    provider_ref: providerRef || payment.provider_ref,
  });

  if (payment.subscription_id) {
    await Subscription.update(
      { status: 'active' },
      { where: { id: payment.subscription_id } }
    );
  }

  return payment;
};

const listPayments = async ({ page = 1, limit = 20, status, userId }) => {
  const where = {};
  if (status) where.status = status;
  if (userId) where.user_id = userId;

  const offset = (page - 1) * limit;
  return Payment.findAndCountAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] },
      { model: Subscription, as: 'subscription' },
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit, 10),
    offset,
  });
};

const createSubscription = async ({ userId, plan, price, durationDays = 30 }) => {
  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

  return Subscription.create({
    user_id: userId,
    plan,
    status: 'pending',
    starts_at: startsAt,
    ends_at: endsAt,
    price,
    auto_renew: true,
  });
};

const listSubscriptions = async ({ page = 1, limit = 20, status }) => {
  const where = status ? { status } : {};
  const offset = (page - 1) * limit;

  return Subscription.findAndCountAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name'] }],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit, 10),
    offset,
  });
};

const getExpiringSubscriptions = async (days = 7) => {
  const threshold = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return Subscription.findAll({
    where: {
      status: 'active',
      ends_at: { [Op.lte]: threshold, [Op.gte]: new Date() },
    },
    include: [{ model: User, as: 'user', attributes: ['id', 'email'] }],
  });
};

module.exports = {
  createPayment,
  completePayment,
  listPayments,
  createSubscription,
  listSubscriptions,
  getExpiringSubscriptions,
};
