/** Poll intervals (ms) for live updates without page refresh. */

const TF_MS = {
  '1s': 5000,
  '5s': 8000,
  '15s': 10000,
  '30s': 15000,
  '1m': 15000,
  '3m': 20000,
  '5m': 30000,
  '15m': 45000,
  '30m': 60000,
  '1H': 60000,
  '1h': 60000,
  '2H': 90000,
  '2h': 90000,
  '4H': 120000,
  '4h': 120000,
  '1D': 180000,
  '1d': 180000,
  '1W': 300000,
  '1w': 300000,
};

export function chartPollInterval(timeframe = '1H') {
  const env = Number(import.meta.env.VITE_CHART_POLL_MS);
  if (Number.isFinite(env) && env > 5000) return env;
  return TF_MS[timeframe] || 60000;
}

export function tickerPollInterval() {
  const env = Number(import.meta.env.VITE_TICKER_POLL_MS);
  if (Number.isFinite(env) && env > 5000) return env;
  return 30000;
}

export function signalsPollInterval() {
  const env = Number(import.meta.env.VITE_SIGNALS_POLL_MS);
  if (Number.isFinite(env) && env > 10000) return env;
  return 60000;
}
