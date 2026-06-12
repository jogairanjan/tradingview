import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

const INDICATOR_GROUPS = [
  {
    title: 'Trend',
    items: [
      { key: 'sma20', label: 'SMA (20)' },
      { key: 'sma50', label: 'SMA (50)' },
      { key: 'ema20', label: 'EMA (20)' },
      { key: 'ema50', label: 'EMA (50)' },
      { key: 'bollinger', label: 'Bollinger Bands' },
      { key: 'vwap', label: 'VWAP', soon: true },
      { key: 'supertrend', label: 'Supertrend', soon: true },
    ],
  },
  {
    title: 'Momentum',
    items: [
      { key: 'rsi', label: 'RSI (14)' },
      { key: 'macd', label: 'MACD' },
      { key: 'stochRsi', label: 'Stoch RSI', soon: true },
      { key: 'cci', label: 'CCI', soon: true },
    ],
  },
  {
    title: 'Volume',
    items: [
      { key: 'volume', label: 'Volume' },
      { key: 'obv', label: 'OBV', soon: true },
      { key: 'volProfile', label: 'Volume Profile', soon: true },
    ],
  },
  {
    title: 'Trend strength',
    items: [
      { key: 'adx', label: 'ADX (14)' },
      { key: 'dmi', label: 'DMI (+DI / -DI)' },
    ],
  },
  {
    title: 'Volatility',
    items: [
      { key: 'atr', label: 'ATR', soon: true },
    ],
  },
];

export default function IndicatorsPanel({ open, onClose, indicators, onChange }) {
  if (!open) return null;

  const toggle = (key) => {
    if (!indicators) return;
    onChange({ ...indicators, [key]: !indicators[key] });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} role="presentation" />
      <aside className="fixed top-0 right-0 bottom-0 w-80 max-w-[90vw] z-50 bg-[#1e222d] border-l border-[#2a2e39] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2e39]">
          <h2 className="text-sm font-semibold text-[#d1d4dc]">Indicators</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded hover:bg-[#2a2e39] text-[#787b86]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {INDICATOR_GROUPS.map((group) => (
            <div key={group.title} className="mb-4">
              <p className="text-[10px] text-[#787b86] uppercase px-2 mb-1">{group.title}</p>
              {group.items.map(({ key, label, soon }) => (
                <button
                  key={key}
                  type="button"
                  disabled={soon}
                  onClick={() => !soon && toggle(key)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-0.5 text-left',
                    soon && 'opacity-50 cursor-not-allowed',
                    !soon && indicators?.[key] ? 'bg-[#2962ff]/15 border border-[#2962ff]/30' : 'hover:bg-[#2a2e39]'
                  )}
                >
                  <span className="text-sm text-[#d1d4dc]">
                    {label}
                    {soon && <span className="text-[10px] text-[#787b86] ml-1">soon</span>}
                  </span>
                  {!soon && (
                    <div className={cn('w-8 h-4 rounded-full relative', indicators?.[key] ? 'bg-[#2962ff]' : 'bg-[#363a45]')}>
                      <span className={cn('absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform', indicators?.[key] ? 'left-4' : 'left-0.5')} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-[#2a2e39] space-y-2">
          <p className="text-[10px] text-[#787b86] text-center">
            RSI, MACD, Bollinger, ADX &amp; DMI are computed by the Python engine
          </p>
          <button type="button" onClick={onClose} className="w-full py-2 rounded-lg bg-[#2962ff] text-white text-sm font-medium">
            Apply
          </button>
        </div>
      </aside>
    </>
  );
}
