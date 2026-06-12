import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { setSignals } from '../../store/slices/signalsSlice';
import { signalsApi } from '../../api/signals';
import { mockSignals } from '../../utils/mockData';
import SignalCard from '../../components/signals/SignalCard';
import SearchBar from '../../components/ui/SearchBar';
import { cn } from '../../utils/cn';

export default function Signals() {
  const dispatch = useDispatch();
  const { list } = useSelector((s) => s.signals);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    signalsApi.list({ limit: 50 })
      .then((res) => dispatch(setSignals(res.data.signals || res.data)))
      .catch(() => dispatch(setSignals(mockSignals)))
      .finally(() => setLoading(false));
  }, [dispatch]);

  const signals = list.length ? list : mockSignals;
  const filtered = signals.filter((s) => {
    const matchSearch = s.pair?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || s.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <Helmet><title>Signals — TradeSignal AI</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Trading Signals</h1>
          <p className="text-sm text-slate-400">All AI-generated BUY and SELL signals</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search pairs..." className="flex-1" />
          <div className="flex gap-2">
            {['ALL', 'BUY', 'SELL'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  filter === f ? 'bg-brand-500/20 text-brand-400' : 'glass text-slate-400 hover:text-slate-200'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((signal, i) => (
              <SignalCard key={signal.id} signal={signal} index={i} />
            ))}
          </div>
        )}
        {!loading && !filtered.length && (
          <p className="text-center text-slate-500 py-12">No signals match your filters.</p>
        )}
      </div>
    </>
  );
}
