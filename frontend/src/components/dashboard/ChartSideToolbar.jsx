import { Crosshair, TrendingUp, Minus, Type, Ruler, Magnet } from 'lucide-react';
import { cn } from '../../utils/cn';

const tools = [
  { icon: Crosshair, label: 'Crosshair' },
  { icon: TrendingUp, label: 'Trend line' },
  { icon: Minus, label: 'Horizontal' },
  { icon: Type, label: 'Text' },
  { icon: Ruler, label: 'Measure' },
  { icon: Magnet, label: 'Magnet' },
];

export default function ChartSideToolbar() {
  return (
    <div className="w-11 shrink-0 flex flex-col items-center py-2 gap-1 border-r border-[#2a2e39] bg-[#1e222d]">
      {tools.map(({ icon: Icon, label }, i) => (
        <button
          key={label}
          type="button"
          title={label}
          className={cn(
            'p-2 rounded transition-colors',
            i === 0 ? 'text-[#2962ff] bg-[#2962ff]/15' : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]'
          )}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
