const signalService = require('../services/signalService');
const apiResponse = require('../utils/apiResponse');

const list = async (req, res, next) => {
  try {
    const result = await signalService.listSignals(req.query);
    return apiResponse.paginated(res, result);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const signal = await signalService.getSignalById(req.params.id);
    return apiResponse.success(res, signal);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const signal = await signalService.createSignal(req.body, req.user?.id);
    return apiResponse.created(res, signal);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const signal = await signalService.updateSignal(req.params.id, req.body);
    return apiResponse.success(res, signal, 'Signal updated');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await signalService.deleteSignal(req.params.id);
    return apiResponse.success(res, result);
  } catch (err) {
    next(err);
  }
};

const history = async (req, res, next) => {
  try {
    const data = await signalService.getSignalHistory(req.params.id);
    return apiResponse.success(res, data);
  } catch (err) {
    next(err);
  }
};

const watchlist = async (req, res, next) => {
  try {
    const data = await signalService.getWatchlist(req.user.id);
    return apiResponse.success(res, data);
  } catch (err) {
    next(err);
  }
};

const addWatchlist = async (req, res, next) => {
  try {
    const item = await signalService.addToWatchlist(req.user.id, req.body.tradingPairId);
    return apiResponse.created(res, item);
  } catch (err) {
    next(err);
  }
};

const removeWatchlist = async (req, res, next) => {
  try {
    const result = await signalService.removeFromWatchlist(req.user.id, req.params.id);
    return apiResponse.success(res, result);
  } catch (err) {
    next(err);
  }
};

const generate = async (req, res, next) => {
  try {
    const result = await signalService.generateSignalsFromPython(req.body);
    return apiResponse.success(res, result, 'Signals generated');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  history,
  watchlist,
  addWatchlist,
  removeWatchlist,
  generate,
};
