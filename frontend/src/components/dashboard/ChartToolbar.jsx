import {
  BarChart3, CandlestickChart, LineChart, Maximize2, Settings2, Layers, Code2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

const TIMEFRAMES = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];

export default function ChartToolbar({
  timeframe,
  onTimeframeChange,
  chartType,
  onChartTypeChange,
  onOpenIndicators,
  onOpenSettings,
  onToggleFullscreen,
  isFullscreen,
  activeIndicatorCount = 0,
}) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 px-2 py-1 border-b border-[#2a2e39] bg-[#1e222d] shrink-0 flex-wrap">
      <div className="flex items-center gap-0.5 p-0.5 rounded bg-[#131722]">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => onTimeframeChange(tf)}
            className={cn(
              'px-2.5 py-1 text-xs font-medium rounded transition-colors',
              timeframe === tf
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]'
            )}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-[#2a2e39] mx-1 hidden sm:block" />

      <div className="flex items-center gap-0.5">
        {[
          { id: 'candles', icon: CandlestickChart },
          { id: 'line', icon: LineChart },
        ].map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChartTypeChange(id)}
            className={cn(
              'p-1.5 rounded transition-colors',
              chartType === id ? 'text-[#2962ff] bg-[#2962ff]/15' : 'text-[#787b86] hover:text-[#d1d4dc]'
            )}
            title={id}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-[#2a2e39] mx-1 hidden sm:block" />

      <button
        type="button"
        onClick={onOpenIndicators}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors',
          activeIndicatorCount > 0
            ? 'text-[#2962ff] bg-[#2962ff]/15'
            : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]'
        )}
        title="Indicators"
      >
        <Layers className="w-4 h-4" />
        <span className="hidden md:inline">Indicators</span>
        {activeIndicatorCount > 0 && (
          <span className="bg-[#2962ff] text-white text-[10px] px-1.5 rounded-full">{activeIndicatorCount}</span>
        )}
      </button>

      <button
        type="button"
        onClick={onOpenSettings}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39] text-xs"
        title="Chart settings"
      >
        <Settings2 className="w-4 h-4" />
        <span className="hidden md:inline">Settings</span>
      </button>

      <button
        type="button"
        onClick={() => navigate('/python-engine')}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39] text-xs"
        title="Python AI script editor"
      >
        <Code2 className="w-4 h-4" />
        <span className="hidden lg:inline">Python</span>
      </button>

      <button
        type="button"
        onClick={onToggleFullscreen}
        className="ml-auto p-1.5 rounded text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]"
        title="Fullscreen"
      >
        <Maximize2 className={cn('w-4 h-4', isFullscreen && 'text-[#2962ff]')} />
      </button>
    </div>
  );
}
