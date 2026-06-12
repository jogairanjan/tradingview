import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { triggerAlert } from '../store/slices/chartSlice';

function parseNumeric(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function useAlertEngine(enabled = true) {
  const dispatch = useDispatch();
  const alerts = useSelector((s) => s.chart.alerts);
  const tickers = useSelector((s) => s.market.tickers);
  const lastPricesRef = useRef({});

  const tickerMap = useMemo(() => {
    const map = {};
    tickers.forEach((t) => {
      map[t.symbol] = parseNumeric(t.price);
    });
    return map;
  }, [tickers]);

  useEffect(() => {
    if (!enabled || !alerts?.length) return;

    alerts.forEach((alert) => {
      if (!alert.active) return;
      const current = tickerMap[alert.symbol];
      if (current == null) return;

      const target = parseNumeric(alert.value);
      if (target == null) return;

      const prev = lastPricesRef.current[alert.symbol] ?? current;
      let hit = false;

      if (alert.condition === 'above') hit = prev < target && current >= target;
      if (alert.condition === 'below') hit = prev > target && current <= target;
      if (alert.condition === 'equals') hit = Math.abs(current - target) / Math.max(1, target) < 0.0005;

      if (hit) {
        dispatch(triggerAlert({ id: alert.id, price: current, triggeredAt: new Date().toISOString() }));
        toast.success(`${alert.symbol} ${alert.condition} ${target} (now ${current.toFixed(4)})`, {
          duration: 5000,
        });
      }

      lastPricesRef.current[alert.symbol] = current;
    });
  }, [enabled, alerts, tickerMap, dispatch]);
}

