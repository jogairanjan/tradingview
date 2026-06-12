const { Setting } = require('../models');
const apiResponse = require('../utils/apiResponse');
const pythonBridgeService = require('../services/pythonBridgeService');
const { AppError } = require('../middleware/errorHandler');

const SCRIPT_KEY = 'custom_python_script';

const getScript = async (req, res, next) => {
  try {
    const row = await Setting.findOne({ where: { key: SCRIPT_KEY } });
    const code = row?.value || '';
    return apiResponse.success(res, { code });
  } catch (err) {
    next(err);
  }
};

const saveScript = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (typeof code !== 'string') throw new AppError('code is required', 400);
    await Setting.upsert({
      key: SCRIPT_KEY,
      value: code,
      type: 'string',
      description: 'Custom Python signal script',
      is_public: false,
    });
    return apiResponse.success(res, { saved: true }, 'Script saved');
  } catch (err) {
    next(err);
  }
};

const runScript = async (req, res, next) => {
  try {
    const { code, symbol = 'BTC/USDT', timeframe = '1h' } = req.body;
    if (!code) throw new AppError('code is required', 400);
    const result = await pythonBridgeService.runCustomScript(code, symbol, timeframe);
    return apiResponse.success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getScript, saveScript, runScript };
