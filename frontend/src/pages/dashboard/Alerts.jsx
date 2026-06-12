import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Plus, Trash2, TrendingUp, BarChart2, Layers } from 'lucide-react';
import { addAlert, removeAlert } from '../../store/slices/chartSlice';
import { cn } from '../../utils/cn';

const ALERT_TYPES = [
  { id: 'price', label: 'Price', icon: TrendingUp },
  { id: 'indicator', label: 'Indicator', icon: BarChart2 },
  { id: 'trendline', label: 'Trendline Break', icon: Layers },
  { id: 'scanner', label: 'Scanner Hit', icon: Bell },
];

export default function Alerts() {
  const dispatch = useDispatch();
  const alerts = useSelector((s) => s.chart.alerts);
  const [form, setForm] = useState({ symbol: 'BTC/USDT', type: 'price', condition: 'above', value: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.value) return;
    dispatch(addAlert({
      ...form,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      triggered: false,
    }));
    setForm({ ...form, value: '' });
  };

  return (
    <>
      <Helmet><title>Alerts — TradeSignal Pro</title></Helmet>
      <div className="h-full flex flex-col bg-[#131722] overflow-auto">
        <div className="px-4 py-3 border-b border-[#2a2e39]">
          <h1 className="text-lg font-semibold text-[#d1d4dc] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#2962ff]" />
            Alerts
          </h1>
          <p className="text-xs text-[#787b86]">Price, indicator, trendline & scanner alerts</p>
        </div>

        <div className="p-4 max-w-2xl">
          <form onSubmit={handleAdd} className="p-4 rounded-xl border border-[#2a2e39] bg-[#1e222d] space-y-3">
            <p className="text-sm font-medium text-[#d1d4dc]">Create Alert</p>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                placeholder="Symbol"
                className="px-3 py-2 rounded bg-[#131722] border border-[#2a2e39] text-sm font-mono"
              />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-3 py-2 rounded bg-[#131722] border border-[#2a2e39] text-sm">
                {ALERT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="px-3 py-2 rounded bg-[#131722] border border-[#2a2e39] text-sm">
                <option value="above">Crosses Above</option>
                <option value="below">Crosses Below</option>
                <option value="equals">Equals</option>
              </select>
              <input
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="Value (price / RSI / etc)"
                className="px-3 py-2 rounded bg-[#131722] border border-[#2a2e39] text-sm"
              />
            </div>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2962ff] text-white text-sm">
              <Plus className="w-4 h-4" /> Add Alert
            </button>
          </form>

          <div className="mt-6 space-y-2">
            <p className="text-xs text-[#787b86] uppercase">Active Alerts ({alerts.length})</p>
            {alerts.length === 0 ? (
              <p className="text-sm text-[#787b86] py-8 text-center">No alerts yet</p>
            ) : (
              alerts.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-[#2a2e39] bg-[#1e222d]">
                  <div>
                    <p className="font-mono text-sm text-[#d1d4dc]">{a.symbol}</p>
                    <p className="text-xs text-[#787b86]">{a.type} {a.condition} {a.value}</p>
                  </div>
                  <button type="button" onClick={() => dispatch(removeAlert(a.id))} className="p-2 text-[#787b86] hover:text-[#ef5350]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
