import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Play, BarChart3, TrendingUp, Shield } from 'lucide-react';
import { cn } from '../../utils/cn';

const MOCK_BACKTEST = {
  netProfit: 12450,
  winRate: 68.4,
  sharpe: 1.82,
  maxDrawdown: 12.3,
  profitFactor: 2.14,
  trades: 142,
  expectancy: 87.6,
};

export default function Strategy() {
  const [code, setCode] = useState(`// Strategy script (Pine-like / Python)
// Entry: RSI < 30 and EMA20 > EMA50
// Exit: RSI > 70 or stop loss 2%

strategy("RSI EMA Cross", overlay=true)
  longCondition = rsi < 30 and ema20 > ema50
  if longCondition
    strategy.entry("Long", strategy.long)
  strategy.exit("TP", profit=3%, loss=2%)
`);
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  const runBacktest = () => {
    setRunning(true);
    setTimeout(() => {
      setResults(MOCK_BACKTEST);
      setRunning(false);
    }, 1200);
  };

  return (
    <>
      <Helmet><title>Strategy & Backtest — TradeSignal Pro</title></Helmet>
      <div className="h-full flex flex-col bg-[#131722] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a2e39] flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-[#d1d4dc]">Strategy Builder & Backtesting</h1>
            <p className="text-xs text-[#787b86]">Pine Script-like engine · Walk-forward · Monte Carlo (Phase 2)</p>
          </div>
          <button type="button" onClick={runBacktest} disabled={running} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2962ff] text-white text-sm disabled:opacity-50">
            <Play className="w-4 h-4" />
            {running ? 'Running...' : 'Run Backtest'}
          </button>
        </div>

        <div className="flex flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col border-r border-[#2a2e39] min-h-0">
            <p className="px-3 py-2 text-xs text-[#787b86] border-b border-[#2a2e39] bg-[#1e222d]">strategy.pine</p>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 p-4 font-mono text-sm bg-[#131722] text-[#d1d4dc] resize-none outline-none"
              spellCheck={false}
            />
          </div>
          <div className="p-4 overflow-auto">
            {results ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Net Profit', value: `$${results.netProfit.toLocaleString()}`, icon: TrendingUp, good: true },
                    { label: 'Win Rate', value: `${results.winRate}%`, icon: BarChart3 },
                    { label: 'Sharpe', value: results.sharpe, icon: Shield },
                    { label: 'Max Drawdown', value: `${results.maxDrawdown}%`, good: false },
                    { label: 'Profit Factor', value: results.profitFactor },
                    { label: 'Trades', value: results.trades },
                  ].map(({ label, value, good }) => (
                    <div key={label} className="p-3 rounded-lg border border-[#2a2e39] bg-[#1e222d]">
                      <p className="text-[10px] text-[#787b86]">{label}</p>
                      <p className={cn('text-lg font-mono font-semibold mt-1', good === true ? 'text-[#26a69a]' : good === false ? 'text-[#ef5350]' : 'text-[#d1d4dc]')}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="h-40 rounded-lg border border-[#2a2e39] bg-[#1e222d] flex items-center justify-center text-[#787b86] text-sm">
                  Equity curve visualization
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-[#787b86] text-sm">
                Run backtest to see performance metrics
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
