const tickerService = require('../services/tickerService');
const apiResponse = require('../utils/apiResponse');

const getTickers = async (req, res, next) => {
  try {
    const raw = req.query.symbols;
    const symbols = raw
      ? String(raw).split(',').map((s) => s.trim()).filter(Boolean)
      : tickerService.DEFAULT_SYMBOLS;
    const tickers = await tickerService.getTickers(symbols);
    return apiResponse.success(res, { tickers }, 'Tickers loaded');
  } catch (err) {
    next(err);
  }
};

module.exports = { getTickers };
