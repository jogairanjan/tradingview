const pythonBridgeService = require('../services/pythonBridgeService');
const apiResponse = require('../utils/apiResponse');

const getChartIndicators = async (req, res, next) => {
  try {
    const { symbol, timeframe, limit } = req.body;
    const data = await pythonBridgeService.fetchChartIndicators({
      symbol,
      timeframe: timeframe || '1h',
      limit: limit || 200,
    });

    if (!data) {
      return apiResponse.success(
        res,
        {
          source: 'client-fallback',
          indicators: null,
          pythonOnline: false,
          symbol,
          timeframe: timeframe || '1h',
        },
        'Python engine offline — chart uses Binance data and client-side indicators'
      );
    }

    return apiResponse.success(
      res,
      { ...data, pythonOnline: true },
      'Indicators computed'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { getChartIndicators };
