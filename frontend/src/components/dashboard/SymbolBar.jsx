import { cn } from '../../utils/cn';

function Stat({ label, value, mono = true }) {
  return (
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] uppercase tracking-wider text-[#787b86]">{label}</span>
      <span className={cn('text-xs text-[#d1d4dc] truncate', mono && 'font-mono')}>{value}</span>
    </div>
  );
}

export default function SymbolBar({ symbol, ticker }) {
  const price = ticker?.price ?? 0;
  const change = Number(ticker?.change ?? 0);
  const isUp = change >= 0;
  const high = ticker?.high ?? price * 1.02;
  const low = ticker?.low ?? price * 0.98;
  const open = ticker?.open ?? price * (1 - change / 100);
  const vol = ticker?.volume ?? '—';

  return (
    <div className="flex items-center gap-4 px-3 py-2 border-b border-[#2a2e39] bg-[#131722] shrink-0 overflow-x-auto scrollbar-thin">
      <div className="flex items-center gap-3 shrink-0 pr-4 border-r border-[#2a2e39]">
        <div className="w-8 h-8 rounded-full bg-[#2962ff]/20 flex items-center justify-center text-xs font-bold text-[#2962ff]">
          {symbol.split('/')[0]?.slice(0, 2)}
        </div>
        <div>
          <h1 className="font-semibold text-[#d1d4dc] text-sm leading-tight">{symbol}</h1>
          <span className="text-[10px] text-[#787b86]">Binance · Spot</span>
        </div>
      </div>

      <div className="flex items-baseline gap-2 shrink-0 pr-4 border-r border-[#2a2e39]">
        <span className="font-mono text-2xl font-semibold text-[#d1d4dc] tabular-nums">
          {price.toLocaleString(undefined, { maximumFractionDigits: price < 1 ? 4 : 2 })}
        </span>
        <span className={cn('font-mono text-sm font-medium tabular-nums', isUp ? 'text-[#26a69a]' : 'text-[#ef5350]')}>
          {isUp ? '+' : ''}{change.toFixed(2)}%
        </span>
      </div>

      <div className="flex items-center gap-5 shrink-0">
        <Stat label="Open" value={open.toLocaleString(undefined, { maximumFractionDigits: 2 })} />
        <Stat label="High" value={high.toLocaleString(undefined, { maximumFractionDigits: 2 })} />
        <Stat label="Low" value={low.toLocaleString(undefined, { maximumFractionDigits: 2 })} />
        <Stat label="Vol" value={vol} mono={false} />
      </div>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <span className="flex items-center gap-1.5 text-[10px] text-[#26a69a]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#26a69a] animate-pulse" />
          Live
        </span>
      </div>
    </div>
  );
}
