import { useEffect, useState, useCallback, useRef } from 'react';
import { indicatorsApi } from '../api/indicators';
import { fetchBinanceKlines } from '../utils/binanceRest';
import { alignIndicatorsToOhlcv, isSubMinuteTimeframe } from '../utils/chartTime';
import { normalizeOhlcv } from '../utils/chartTransforms';
import { chartPollInterval } from '../utils/refreshIntervals';
import { useInterval } from './useInterval';

/**
 * Historical OHLCV from Binance (time-aligned) + Python indicators.
 */
export function useChartPayload(symbol, timeframe, enabled = true) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('binance');
  const [lastUpdated, setLastUpdated] = useState(null);
  const hasDataRef = useRef(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!symbol) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const ohlcv = normalizeOhlcv(await fetchBinanceKlines(symbol, timeframe, 200));

      let indicators = null;
      let indSource = 'binance';
      // Sub-minute charts use Binance agg trades — skip Python (1m-based) indicators
      if (!isSubMinuteTimeframe(timeframe)) {
        try {
          const py = await indicatorsApi.getChart({ symbol, timeframe });
          if (py?.indicators) {
            indicators = alignIndicatorsToOhlcv(py.indicators, ohlcv);
            indSource = py?.source === 'python-ta' ? 'binance+python' : 'binance';
          } else if (py?.pythonOnline === false) {
            indSource = 'binance';
          }
        } catch {
          /* indicators optional — client-side fallback in AdvancedChart */
        }
      }

      setPayload({ ohlcv, indicators, symbol, timeframe });
      setSource(indSource);
      setError(null);
      setLastUpdated(new Date());
      hasDataRef.current = true;
    } catch (err) {
      if (!hasDataRef.current) {
        try {
          const py = await indicatorsApi.getChart({ symbol, timeframe });
          const ohlcv = normalizeOhlcv(py?.ohlcv || []);
          setPayload({
            ohlcv,
            indicators: py?.indicators,
            symbol,
            timeframe,
          });
          setSource(py?.source || 'python-ta');
          hasDataRef.current = ohlcv.length > 0;
        } catch {
          setError(err?.message || 'Chart data unavailable');
        }
      } else {
        console.warn('Chart refresh failed', err?.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    if (!enabled || !symbol) return undefined;
    hasDataRef.current = false;
    fetchData(false);
    return undefined;
  }, [symbol, timeframe, enabled, fetchData]);

  const pollMs = enabled
    ? (isSubMinuteTimeframe(timeframe)
      ? chartPollInterval(timeframe)
      : Math.max(chartPollInterval(timeframe), 120000))
    : null;
  useInterval(() => fetchData(true), pollMs);

  return {
    payload,
    loading,
    refreshing,
    error,
    source,
    lastUpdated,
    refresh: () => fetchData(true),
  };
}
