const paymentService = require('../services/paymentService');
const apiResponse = require('../utils/apiResponse');

const create = async (req, res, next) => {
  try {
    const payment = await paymentService.createPayment({
      userId: req.user.id,
      ...req.body,
    });
    return apiResponse.created(res, payment);
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { rows, count } = await paymentService.listPayments({
      ...req.query,
      userId: req.user.role === 'admin' ? req.query.userId : req.user.id,
    });
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    return apiResponse.paginated(res, { rows, count, page, limit });
  } catch (err) {
    next(err);
  }
};

const complete = async (req, res, next) => {
  try {
    const payment = await paymentService.completePayment(req.params.id, req.body.providerRef);
    return apiResponse.success(res, payment, 'Payment completed');
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, complete };
