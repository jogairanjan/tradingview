/** All supported chart timeframes (TradingView-style) */
export const TIMEFRAMES = [
  { id: '1s', label: '1s', seconds: 1 },
  { id: '5s', label: '5s', seconds: 5 },
  { id: '15s', label: '15s', seconds: 15 },
  { id: '30s', label: '30s', seconds: 30 },
  { id: '1m', label: '1m', seconds: 60 },
  { id: '3m', label: '3m', seconds: 180 },
  { id: '5m', label: '5m', seconds: 300 },
  { id: '15m', label: '15m', seconds: 900 },
  { id: '30m', label: '30m', seconds: 1800 },
  { id: '45m', label: '45m', seconds: 2700 },
  { id: '1H', label: '1H', seconds: 3600 },
  { id: '2H', label: '2H', seconds: 7200 },
  { id: '4H', label: '4H', seconds: 14400 },
  { id: '1D', label: '1D', seconds: 86400 },
  { id: '1W', label: '1W', seconds: 604800 },
  { id: '1M', label: '1M', seconds: 2592000 },
];

export const CHART_TYPES = [
  { id: 'candles', label: 'Candles' },
  { id: 'hollow', label: 'Hollow Candles' },
  { id: 'heikin', label: 'Heikin Ashi' },
  { id: 'line', label: 'Line' },
  { id: 'area', label: 'Area' },
  { id: 'baseline', label: 'Baseline' },
  { id: 'bars', label: 'Bars' },
];

export const TIMEFRAME_GROUPS = [
  { label: 'Seconds', items: ['1s', '5s', '15s', '30s'] },
  { label: 'Minutes', items: ['1m', '3m', '5m', '15m', '30m', '45m'] },
  { label: 'Hours', items: ['1H', '2H', '4H'] },
  { label: 'Days', items: ['1D', '1W', '1M'] },
];
