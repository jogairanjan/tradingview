import { DEFAULT_INDICATORS, DEFAULT_CHART_SETTINGS } from './chartIndicators';

export function loadStoredIndicators() {
  try {
    const raw = JSON.parse(localStorage.getItem('chartIndicators') || 'null');
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return { ...DEFAULT_INDICATORS, ...raw };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_INDICATORS };
}

export function loadStoredChartSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem('chartSettings') || 'null');
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return { ...DEFAULT_CHART_SETTINGS, ...raw };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_CHART_SETTINGS };
}

export function normalizeSignal(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const pair =
    raw.pair ||
    raw.symbol ||
    raw.tradingPair?.symbol ||
    (raw.trading_pair_id ? 'Pair' : 'N/A');
  const type = String(raw.type || raw.signal_type || 'BUY').toUpperCase();
  return {
    id: raw.id || raw._id || Math.random().toString(36).slice(2),
    pair,
    type: type === 'SELL' ? 'SELL' : type === 'BUY' ? 'BUY' : type,
    entry: raw.entry ?? raw.entry_price ?? raw.entryPrice ?? 0,
    target: raw.target ?? raw.take_profit ?? raw.target_1 ?? raw.takeProfit ?? 0,
    stopLoss: raw.stopLoss ?? raw.stop_loss ?? 0,
    confidence: raw.confidence ?? raw.confidence_score ?? 0,
    timeframe: raw.timeframe || '1H',
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
  };
}

export function normalizeSignalList(payload) {
  if (Array.isArray(payload)) {
    return payload.map(normalizeSignal).filter(Boolean);
  }
  if (payload?.signals && Array.isArray(payload.signals)) {
    return payload.signals.map(normalizeSignal).filter(Boolean);
  }
  if (payload?.data && Array.isArray(payload.data)) {
    return payload.data.map(normalizeSignal).filter(Boolean);
  }
  if (payload?.rows && Array.isArray(payload.rows)) {
    return payload.rows.map(normalizeSignal).filter(Boolean);
  }
  return [];
}
