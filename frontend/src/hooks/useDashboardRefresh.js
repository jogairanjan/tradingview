import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setTickers } from '../store/slices/marketSlice';
import { setSignals } from '../store/slices/signalsSlice';
import { signalsApi } from '../api/signals';
import { marketApi } from '../api/market';
import { unwrapApi } from '../utils/api';
import { normalizeSignalList } from '../utils/normalize';
import { tickerPollInterval, signalsPollInterval } from '../utils/refreshIntervals';
import { useInterval } from './useInterval';

/**
 * Poll signals + market tickers so the dashboard updates without a page refresh.
 */
export function useDashboardRefresh(enabled = true) {
  const dispatch = useDispatch();

  const refreshTickers = useCallback(async () => {
    try {
      const tickers = await marketApi.getTickers();
      if (Array.isArray(tickers) && tickers.length) dispatch(setTickers(tickers));
    } catch {
      /* keep last known tickers */
    }
  }, [dispatch]);

  const refreshSignals = useCallback(async () => {
    try {
      const list = normalizeSignalList(unwrapApi(await signalsApi.list({ limit: 20 })));
      if (list.length) dispatch(setSignals(list));
    } catch {
      /* keep last known signals */
    }
  }, [dispatch]);

  useInterval(refreshTickers, enabled ? tickerPollInterval() : null);
  useInterval(refreshSignals, enabled ? signalsPollInterval() : null);

  return { refreshTickers, refreshSignals };
}
