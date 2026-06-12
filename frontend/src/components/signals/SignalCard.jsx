import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Target, ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/cn';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

export default function SignalCard({ signal, index = 0, compact = false }) {
  const isBuy = signal.type === 'BUY';
  const confidence = signal.confidence ?? 0;

  if (compact) {
    return (
      <div
        className={cn(
          'p-3 rounded border bg-[#131722]',
          isBuy ? 'border-[#26a69a]/30' : 'border-[#ef5350]/30'
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs font-semibold text-[#d1d4dc]">{signal.pair}</span>
          <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', isBuy ? 'bg-[#26a69a]/20 text-[#26a69a]' : 'bg-[#ef5350]/20 text-[#ef5350]')}>
            {signal.type}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[10px] mb-2">
          <div><span className="text-[#787b86]">Entry</span><p className="font-mono text-[#d1d4dc]">{signal.entry}</p></div>
          <div><span className="text-[#787b86]">Target</span><p className="font-mono text-[#26a69a]">{signal.target}</p></div>
          <div><span className="text-[#787b86]">Conf</span><p className="font-mono text-[#2962ff]">{confidence}%</p></div>
        </div>
        <div className="h-1 rounded-full bg-[#2a2e39] overflow-hidden">
          <div className={cn('h-full rounded-full', isBuy ? 'bg-[#26a69a]' : 'bg-[#ef5350]')} style={{ width: `${confidence}%` }} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={cn(
          'relative overflow-hidden',
          isBuy ? 'glow-buy border-accent-emerald/20' : 'glow-sell border-accent-rose/20'
        )}
        hover
      >
        <div
          className={cn(
            'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2',
            isBuy ? 'bg-accent-emerald' : 'bg-accent-rose'
          )}
        />
        <div className="relative flex items-start justify-between mb-4">
          <div>
            <p className="font-mono text-lg font-bold text-slate-100">{signal.pair}</p>
            <p className="text-xs text-slate-500 mt-0.5">{signal.timeframe || '4H'} · {new Date(signal.createdAt).toLocaleString()}</p>
          </div>
          <Badge variant={isBuy ? 'buy' : 'sell'} className="flex items-center gap-1">
            {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {signal.type}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs">Entry</p>
            <p className="font-mono text-slate-200">{signal.entry?.toLocaleString?.() ?? signal.entry}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs flex items-center gap-1"><Target className="w-3 h-3" /> Target</p>
            <p className="font-mono text-accent-emerald">{signal.target?.toLocaleString?.() ?? signal.target}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Stop</p>
            <p className="font-mono text-accent-rose">{signal.stopLoss?.toLocaleString?.() ?? signal.stopLoss}</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">AI Confidence</span>
            <span className={cn('font-semibold', confidence >= 80 ? 'text-accent-emerald' : confidence >= 60 ? 'text-amber-400' : 'text-slate-400')}>
              {confidence}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-600 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                isBuy
                  ? 'bg-gradient-to-r from-accent-emerald/80 to-accent-emerald'
                  : 'bg-gradient-to-r from-accent-rose/80 to-accent-rose'
              )}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
