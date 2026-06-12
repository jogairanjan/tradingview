import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { mockTickers } from '../../utils/mockData';
import { cn } from '../../utils/cn';

export default function TickerTape({ tickers = mockTickers }) {
  const items = [...tickers, ...tickers];

  return (
    <div className="overflow-hidden border-y border-white/10 bg-surface-800/80 py-2">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((t, i) => (
          <div key={`${t.symbol}-${i}`} className="flex items-center gap-3 px-4 text-sm">
            <span className="font-mono font-semibold text-slate-200">{t.symbol}</span>
            <span className="font-mono text-slate-300">${typeof t.price === 'number' ? t.price.toLocaleString(undefined, { maximumFractionDigits: 4 }) : t.price}</span>
            <span className={cn('flex items-center gap-0.5 font-medium', t.change >= 0 ? 'text-accent-emerald' : 'text-accent-rose')}>
              {t.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {t.change >= 0 ? '+' : ''}{t.change}%
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
