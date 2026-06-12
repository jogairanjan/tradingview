const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

const bridgeClient = axios.create({
  baseURL: env.pythonBridge.baseUrl,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

/** Skip Python calls briefly after connection failure to avoid log spam. */
let pythonDownUntil = 0;
const PYTHON_RETRY_MS = 30000;

function isPythonConnectionError(err) {
  const code = err?.code || '';
  const msg = err?.message || '';
  return (
    code === 'ECONNREFUSED'
    || code === 'ENOTFOUND'
    || code === 'ETIMEDOUT'
    || code === 'ECONNABORTED'
    || msg.includes('ECONNREFUSED')
    || msg.includes('connect ECONNREFUSED')
  );
}

function markPythonDown(err) {
  pythonDownUntil = Date.now() + PYTHON_RETRY_MS;
  logger.debug(`Python engine offline (${env.pythonBridge.baseUrl}): ${err?.message || 'unavailable'}`);
}

/**
 * Call Python ML service to generate trading signals.
 * @param {Object} payload - Optional params (symbols, timeframe, etc.)
 */
const generateSignal = async (payload = {}) => {
  try {
    const endpoint = Array.isArray(payload.symbols) && payload.symbols.length
      ? '/api/batch-signals'
      : env.pythonBridge.signalEndpoint;
    const { data } = await bridgeClient.post(endpoint, payload);
    logger.info('Python bridge signal generation completed', {
      signalsCount: Array.isArray(data?.signals) ? data.signals.length : 1,
    });
    return data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Python bridge unavailable';
    logger.error(`Python bridge error: ${message}`, { status: err.response?.status });
    throw new AppError(`Signal generation failed: ${message}`, err.response?.status || 503);
  }
};

/**
 * Health check for Python service.
 */
const checkHealth = async () => {
  try {
    const { status } = await bridgeClient.get('/health', { timeout: 5000 });
    return status === 200;
  } catch {
    return false;
  }
};

/**
 * Execute user-provided Python script via Python engine.
 */
const runCustomScript = async (code, symbol, timeframe) => {
  try {
    const { data } = await bridgeClient.post('/api/custom-script/run', {
      code,
      symbol,
      timeframe,
    });
    return data;
  } catch (err) {
    const message = err.response?.data?.error || err.message || 'Python script execution failed';
    logger.error(`Custom script error: ${message}`);
    throw new AppError(message, err.response?.status || 503);
  }
};

/**
 * Fetch chart indicator series from Python ta engine.
 */
const fetchChartIndicators = async ({ symbol, timeframe, limit }) => {
  if (Date.now() < pythonDownUntil) {
    return null;
  }

  try {
    const { data } = await bridgeClient.post('/api/chart-indicators', {
      symbol,
      timeframe,
      limit,
    });
    pythonDownUntil = 0;
    return data?.data || data;
  } catch (err) {
    if (isPythonConnectionError(err)) {
      markPythonDown(err);
      return null;
    }
    const message = err.response?.data?.error || err.message || 'Python indicators unavailable';
    logger.warn(`Chart indicators error: ${message}`);
    return null;
  }
};

/**
 * Fetch live ticker quotes from Python/ccxt.
 */
const fetchTickers = async (symbols = []) => {
  try {
    const { data } = await bridgeClient.post('/api/tickers', { symbols });
    return data?.data || data?.tickers || data || [];
  } catch (err) {
    const message = err.response?.data?.error || err.message || 'Ticker service unavailable';
    logger.debug(`Python ticker fetch failed: ${message}`);
    throw new AppError(message, err.response?.status || 503);
  }
};

module.exports = {
  generateSignal,
  checkHealth,
  runCustomScript,
  fetchChartIndicators,
  fetchTickers,
};
