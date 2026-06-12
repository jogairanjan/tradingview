import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CandlestickChart, LineChart, AreaChart, Layers, Settings2, Code2,
  ChevronDown, Sparkles, TrendingUp,
} from 'lucide-react';
import { CHART_TYPES, TIMEFRAME_GROUPS } from '../../utils/timeframes';
import { cn } from '../../utils/cn';

export default function ChartToolbarPro({
  timeframe,
  chartType,
  onTimeframeChange,
  onChartTypeChange,
  onOpenIndicators,
  onOpenSettings,
  activeIndicatorCount = 0,
  patterns = [],
}) {
  const navigate = useNavigate();
  const [tfOpen, setTfOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  return (
    <div className="flex items-center gap-1 px-2 py-1 border-b border-[#2a2e39] bg-[#1e222d] shrink-0 flex-wrap">
      <div className="relative">
        <button
          type="button"
          onClick={() => setTfOpen(!tfOpen)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-[#131722] text-[#d1d4dc] hover:bg-[#2a2e39]"
        >
          {timeframe}
          <ChevronDown className="w-3 h-3" />
        </button>
        {tfOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setTfOpen(false)} role="presentation" />
            <div className="absolute top-full left-0 mt-1 z-50 bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-xl p-2 min-w-[140px] max-h-64 overflow-y-auto">
              {TIMEFRAME_GROUPS.map((g) => (
                <div key={g.label}>
                  <p className="text-[10px] text-[#787b86] px-2 py-1 uppercase">{g.label}</p>
                  {g.items.map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => { onTimeframeChange(tf); setTfOpen(false); }}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-xs rounded',
                        timeframe === tf ? 'bg-[#2962ff] text-white' : 'text-[#d1d4dc] hover:bg-[#2a2e39]'
                      )}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setTypeOpen(!typeOpen)}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]"
        >
          <CandlestickChart className="w-4 h-4" />
          <ChevronDown className="w-3 h-3" />
        </button>
        {typeOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setTypeOpen(false)} role="presentation" />
            <div className="absolute top-full left-0 mt-1 z-50 bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-xl py-1 min-w-[160px]">
              {CHART_TYPES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { onChartTypeChange(id); setTypeOpen(false); }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-xs',
                    chartType === id ? 'bg-[#2962ff]/20 text-[#2962ff]' : 'text-[#d1d4dc] hover:bg-[#2a2e39]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="w-px h-5 bg-[#2a2e39] mx-0.5" />

      <button type="button" onClick={onOpenIndicators} className={cn('flex items-center gap-1 px-2 py-1.5 rounded text-xs', activeIndicatorCount ? 'text-[#2962ff] bg-[#2962ff]/15' : 'text-[#787b86] hover:bg-[#2a2e39]')}>
        <Layers className="w-4 h-4" />
        <span className="hidden md:inline">Indicators</span>
        {activeIndicatorCount > 0 && <span className="bg-[#2962ff] text-white text-[10px] px-1 rounded-full">{activeIndicatorCount}</span>}
      </button>

      <button type="button" onClick={onOpenSettings} className="p-1.5 rounded text-[#787b86] hover:bg-[#2a2e39]" title="Settings">
        <Settings2 className="w-4 h-4" />
      </button>

      <button type="button" onClick={() => navigate('/scanner')} className="flex items-center gap-1 px-2 py-1.5 rounded text-xs text-[#787b86] hover:bg-[#2a2e39]">
        <Sparkles className="w-4 h-4" />
        <span className="hidden lg:inline">Scanner</span>
      </button>

      <button type="button" onClick={() => navigate('/strategy')} className="flex items-center gap-1 px-2 py-1.5 rounded text-xs text-[#787b86] hover:bg-[#2a2e39]">
        <TrendingUp className="w-4 h-4" />
        <span className="hidden lg:inline">Strategy</span>
      </button>

      <button type="button" onClick={() => navigate('/python-engine')} className="p-1.5 rounded text-[#787b86] hover:bg-[#2a2e39]" title="Pine/Python scripts">
        <Code2 className="w-4 h-4" />
      </button>

      {patterns.length > 0 && (
        <div className="ml-auto flex items-center gap-2 text-[10px]">
          {patterns.slice(0, 2).map((p) => (
            <span key={p.id} className={cn('px-2 py-0.5 rounded', p.type === 'bullish' ? 'bg-[#26a69a]/20 text-[#26a69a]' : 'bg-[#ef5350]/20 text-[#ef5350]')}>
              {p.name} {p.confidence}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
