import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { setTickers as setMarketTickers } from '../../store/slices/marketSlice';
import { setSignals } from '../../store/slices/signalsSlice';
import { signalsApi } from '../../api/signals';
import { marketApi } from '../../api/market';
import { unwrapApi } from '../../utils/api';
import { mockTickers, mockSignals } from '../../utils/mockData';
import { normalizeSignalList } from '../../utils/normalize';
import { useDashboardRefresh } from '../../hooks/useDashboardRefresh';
import ChartWorkspace from '../../components/workspace/ChartWorkspace';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { list: signalList } = useSelector((s) => s.signals);
  const [loading, setLoading] = useState(true);

  const signals = Array.isArray(signalList) && signalList.length ? signalList : mockSignals;

  const initialLoad = useCallback(async () => {
    try {
      const [sigRes, tickRes] = await Promise.allSettled([
        signalsApi.list({ limit: 20 }),
        marketApi.getTickers(),
      ]);
      if (sigRes.status === 'fulfilled') {
        const list = normalizeSignalList(unwrapApi(sigRes.value));
        dispatch(setSignals(list.length ? list : mockSignals));
      } else dispatch(setSignals(mockSignals));

      if (tickRes.status === 'fulfilled') {
        const tickers = tickRes.value;
        if (Array.isArray(tickers) && tickers.length) dispatch(setMarketTickers(tickers));
        else dispatch(setMarketTickers(mockTickers));
      } else dispatch(setMarketTickers(mockTickers));
    } catch {
      dispatch(setSignals(mockSignals));
      dispatch(setMarketTickers(mockTickers));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  // Background polling (fallback when WebSocket is offline)
  useDashboardRefresh(!loading);

  return (
    <>
      <Helmet><title>Chart — TradeSignal Pro</title></Helmet>
      <ChartWorkspace signals={signals} loading={loading} />
    </>
  );
}
