import { useSelector } from 'react-redux';
import { Radio } from 'lucide-react';
import { mockSignals } from '../../utils/mockData';
import SignalCard from './SignalCard';
import Skeleton from '../ui/Skeleton';

export default function SignalPanel({ limit = 5, loading }) {
  const { list, live } = useSelector((s) => s.signals);
  const signals = list.length ? list : mockSignals;

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Radio className="w-5 h-5 text-brand-400" />
        <h2 className="text-lg font-semibold text-slate-100">Live Signals</h2>
        {live && (
          <span className="flex items-center gap-1.5 text-xs text-accent-emerald">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            Live
          </span>
        )}
      </div>
      <div className="space-y-4">
        {signals.slice(0, limit).map((signal, i) => (
          <SignalCard key={signal.id} signal={signal} index={i} />
        ))}
      </div>
    </div>
  );
}
