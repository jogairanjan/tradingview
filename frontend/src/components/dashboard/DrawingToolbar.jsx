import { useDispatch, useSelector } from 'react-redux';
import {
  MousePointer2, Minus, Square, Type, Trash2, Eraser, Crosshair,
  Magnet, TrendingUp, GitBranch, Ruler,
} from 'lucide-react';
import {
  setActiveTool, toggleMagnet, clearDrawings, removeDrawing,
  setShowAutoTrendlines, setShowSRZones, setShowPatterns,
} from '../../store/slices/chartSlice';
import { cn } from '../../utils/cn';

const TOOLS = [
  { id: 'cursor', icon: MousePointer2, label: 'Cursor (pan & zoom chart)' },
  { id: 'select', icon: Crosshair, label: 'Select drawing (Del to remove)' },
  { id: 'eraser', icon: Eraser, label: 'Eraser (click drawing to delete)' },
  { id: 'trendline', icon: TrendingUp, label: 'Trendline' },
  { id: 'horizontal', icon: Minus, label: 'Horizontal' },
  { id: 'ray', icon: GitBranch, label: 'Ray' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'fib', icon: Ruler, label: 'Fib' },
  { id: 'text', icon: Type, label: 'Text' },
];

export default function DrawingToolbar() {
  const dispatch = useDispatch();
  const {
    activeTool, magnetMode, showAutoTrendlines, showSRZones, showPatterns, selectedDrawingId,
  } = useSelector((s) => s.chart);

  return (
    <aside className="w-11 shrink-0 flex flex-col items-center py-2 gap-0.5 border-r border-[#2a2e39] bg-[#1e222d] overflow-y-auto scrollbar-thin">
      {TOOLS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          title={label}
          onClick={() => dispatch(setActiveTool(id))}
          className={cn(
            'p-2 rounded w-9 h-9 flex items-center justify-center transition-colors',
            activeTool === id ? 'bg-[#2962ff]/20 text-[#2962ff]' : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]'
          )}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}

      <div className="w-6 h-px bg-[#2a2e39] my-1" />

      <button
        type="button"
        title="Magnet mode"
        onClick={() => dispatch(toggleMagnet())}
        className={cn('p-2 rounded', magnetMode ? 'text-[#2962ff] bg-[#2962ff]/15' : 'text-[#787b86] hover:bg-[#2a2e39]')}
      >
        <Magnet className="w-4 h-4" />
      </button>

      <button type="button" title="Auto trendlines" onClick={() => dispatch(setShowAutoTrendlines(!showAutoTrendlines))} className={cn('p-2 rounded text-[10px] font-bold', showAutoTrendlines ? 'text-[#2962ff]' : 'text-[#787b86]')}>AT</button>
      <button type="button" title="S/R zones" onClick={() => dispatch(setShowSRZones(!showSRZones))} className={cn('p-2 rounded text-[10px] font-bold', showSRZones ? 'text-[#2962ff]' : 'text-[#787b86]')}>SR</button>
      <button type="button" title="Patterns" onClick={() => dispatch(setShowPatterns(!showPatterns))} className={cn('p-2 rounded text-[10px] font-bold', showPatterns ? 'text-[#2962ff]' : 'text-[#787b86]')}>PT</button>

      <div className="flex-1" />

      {selectedDrawingId && (
        <button
          type="button"
          title="Delete selected drawing (Del)"
          onClick={() => dispatch(removeDrawing(selectedDrawingId))}
          className="p-2 rounded text-[#ef5350] hover:bg-[#ef5350]/15"
        >
          <Eraser className="w-4 h-4" />
        </button>
      )}

      <button type="button" title="Clear all drawings" onClick={() => dispatch(clearDrawings())} className="p-2 rounded text-[#787b86] hover:text-[#ef5350] hover:bg-[#2a2e39]">
        <Trash2 className="w-4 h-4" />
      </button>
    </aside>
  );
}
