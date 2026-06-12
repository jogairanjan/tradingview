import { useState } from 'react';
import { ChevronUp, ChevronDown, Radio, History, Brain, TrendingUp } from 'lucide-react';
import { cn } from '../../utils/cn';
import SignalCard from '../signals/SignalCard';

const TABS = [
  { id: 'signals', label: 'AI Signals', icon: Radio },
  { id: 'history', label: 'History', icon: History },
  { id: 'analysis', label: 'Analysis', icon: Brain },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
];

export default function BottomPanel({ signals = [], loading, collapsed, onToggleCollapse }) {
  const [activeTab, setActiveTab] = useState('signals');
  const safeSignals = Array.isArray(signals) ? signals : [];

  return (
    <div
      className={cn(
        'border-t border-[#2a2e39] bg-[#1e222d] flex flex-col shrink-0 transition-all duration-200',
        collapsed ? 'h-9' : 'h-[220px]'
      )}
    >
      <div className="flex items-center h-9 border-b border-[#2a2e39] shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => { setActiveTab(id); if (collapsed) onToggleCollapse(); }}
            className={cn(
              'flex items-center gap-1.5 px-4 h-full text-xs font-medium border-r border-[#2a2e39] transition-colors',
              activeTab === id && !collapsed
                ? 'text-[#2962ff] bg-[#131722]'
                : 'text-[#787b86] hover:text-[#d1d4dc]'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="ml-auto px-3 h-full text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]"
        >
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-auto p-3 scrollbar-thin">
          {activeTab === 'signals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 rounded bg-[#2a2e39] animate-pulse" />
                ))
              ) : (
                safeSignals.slice(0, 4).map((s, i) => (
                  <SignalCard key={s.id} signal={s} index={i} compact />
                ))
              )}
            </div>
          )}
          {activeTab === 'history' && (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#787b86] text-left border-b border-[#2a2e39]">
                  <th className="pb-2 font-medium">Pair</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Entry</th>
                  <th className="pb-2 font-medium">Result</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {safeSignals.map((s) => (
                  <tr key={s.id} className="border-b border-[#2a2e39]/50 text-[#d1d4dc]">
                    <td className="py-2 font-mono">{s.pair}</td>
                    <td className={cn('py-2', s.type === 'BUY' ? 'text-[#26a69a]' : 'text-[#ef5350]')}>{s.type}</td>
                    <td className="py-2 font-mono">{s.entry}</td>
                    <td className="py-2 text-[#26a69a]">+2.4%</td>
                    <td className="py-2 text-[#787b86]">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === 'analysis' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {[
                { label: 'RSI (14)', value: '58.2', status: 'Neutral' },
                { label: 'MACD', value: 'Bullish', status: 'Buy' },
                { label: 'EMA 20/50', value: 'Golden Cross', status: 'Buy' },
                { label: 'AI Confidence', value: '87%', status: 'Strong' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded bg-[#131722] border border-[#2a2e39]">
                  <p className="text-[10px] text-[#787b86] uppercase">{item.label}</p>
                  <p className="font-mono text-[#d1d4dc] mt-1">{item.value}</p>
                  <p className="text-xs text-[#26a69a] mt-0.5">{item.status}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'performance' && (
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Today P/L', value: '+$1,240', pct: '+2.4%' },
                { label: 'Week P/L', value: '+$4,890', pct: '+8.1%' },
                { label: 'Win Rate', value: '72%', pct: 'Last 30 days' },
                { label: 'Open Signals', value: '3', pct: 'Active' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded bg-[#131722] border border-[#2a2e39]">
                  <p className="text-[10px] text-[#787b86]">{item.label}</p>
                  <p className="font-mono text-lg text-[#d1d4dc] mt-1">{item.value}</p>
                  <p className="text-xs text-[#26a69a]">{item.pct}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
