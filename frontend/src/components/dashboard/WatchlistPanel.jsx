import { Star, Plus, Search } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function WatchlistPanel({ tickers, selectedPair, onSelect, marketTab, onMarketTabChange }) {
  const tabs = ['crypto', 'forex', 'stocks'];

  return (
    <aside className="w-[280px] shrink-0 flex flex-col border-l border-[#2a2e39] bg-[#1e222d] h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2e39]">
        <span className="text-xs font-semibold text-[#d1d4dc] uppercase tracking-wide">Watchlist</span>
        <div className="flex gap-1">
          <button type="button" className="p-1 rounded hover:bg-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc]">
            <Search className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="p-1 rounded hover:bg-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc]">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex border-b border-[#2a2e39]">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onMarketTabChange(tab)}
            className={cn(
              'flex-1 py-2 text-[10px] font-medium uppercase tracking-wide transition-colors',
              marketTab === tab
                ? 'text-[#2962ff] border-b-2 border-[#2962ff]'
                : 'text-[#787b86] hover:text-[#d1d4dc]'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-1.5 text-[10px] text-[#787b86] uppercase border-b border-[#2a2e39]">
        <span>Symbol</span>
        <span className="text-right">Last</span>
        <span className="text-right w-14">Chg%</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {tickers.map((t) => {
          const up = t.change >= 0;
          const active = selectedPair === t.symbol;
          return (
            <button
              key={t.symbol}
              type="button"
              onClick={() => onSelect(t.symbol)}
              className={cn(
                'w-full grid grid-cols-[1fr_auto_auto] gap-2 items-center px-3 py-2 text-left transition-colors border-l-2',
                active
                  ? 'bg-[#2962ff]/10 border-[#2962ff] text-[#d1d4dc]'
                  : 'border-transparent hover:bg-[#2a2e39]/50 text-[#d1d4dc]'
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Star className={cn('w-3 h-3 shrink-0', active ? 'text-[#f59e0b] fill-[#f59e0b]' : 'text-[#787b86]')} />
                <span className="font-mono text-xs truncate">{t.symbol}</span>
              </div>
              <span className="font-mono text-xs tabular-nums text-right">
                {t.price?.toLocaleString?.(undefined, { maximumFractionDigits: t.price < 1 ? 4 : 2 }) ?? t.price}
              </span>
              <span className={cn('font-mono text-xs tabular-nums text-right w-14', up ? 'text-[#26a69a]' : 'text-[#ef5350]')}>
                {up ? '+' : ''}{t.change?.toFixed?.(2) ?? t.change}%
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
