import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Play, Save, Filter, TrendingUp, Zap } from 'lucide-react';
import { mockTickers } from '../../utils/mockData';
import { mockChartData } from '../../utils/mockData';
import { runPatternScan } from '../../utils/patternDetection';
import { calcRSI } from '../../utils/chartIndicators';
import { cn } from '../../utils/cn';
import { scannerApi } from '../../api/scanner';

const PRESETS = [
  { id: 'breakout', name: 'Breakout + Volume', conditions: ['Price > 20 SMA', 'Volume > 1.5x avg', 'RSI > 55'] },
  { id: 'macd-rsi', name: 'MACD Bull + RSI', conditions: ['MACD bullish cross', 'RSI > 60', 'EMA 20 > EMA 50'] },
  { id: 'squeeze', name: 'BB Squeeze', conditions: ['Bollinger squeeze', 'Volume spike', 'Bullish candle'] },
  { id: 'pattern', name: 'AI Pattern', conditions: ['Double bottom', 'H&S inverse', 'Triangle breakout'] },
];

function scanSymbol(symbol) {
  const data = mockChartData(80, symbol);
  const rsi = calcRSI(data);
  const lastRsi = rsi[rsi.length - 1]?.value ?? 50;
  const patterns = runPatternScan(data);
  const change = mockTickers.find((t) => t.symbol === symbol)?.change ?? 0;
  let score = 50;
  if (lastRsi > 60) score += 15;
  if (lastRsi < 40) score -= 10;
  if (change > 2) score += 12;
  if (patterns.length) score += patterns[0].confidence * 0.3;
  return {
    symbol,
    conviction: Math.min(99, Math.round(score)),
    rsi: lastRsi.toFixed(1),
    change,
    pattern: patterns[0]?.name || '—',
    signal: score > 65 ? 'BUY' : score < 45 ? 'SELL' : 'WATCH',
  };
}

export default function Scanner() {
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('all');
  const [results, setResults] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [activePreset, setActivePreset] = useState('breakout');

  const runScan = () => {
    setScanning(true);
    scannerApi.run({ query, market: sector, preset: activePreset, limit: 200 })
      .then((data) => {
        const rows = Array.isArray(data?.results) ? data.results : [];
        if (rows.length) setResults(rows);
        else {
          const syms = mockTickers.map((t) => t.symbol);
          setResults(syms.map(scanSymbol).sort((a, b) => b.conviction - a.conviction));
        }
      })
      .catch(() => {
        const syms = mockTickers.map((t) => t.symbol);
        setResults(syms.map(scanSymbol).sort((a, b) => b.conviction - a.conviction));
      })
      .finally(() => setScanning(false));
  };

  const filtered = useMemo(() => {
    if (!query) return results;
    return results.filter((r) => r.symbol.toLowerCase().includes(query.toLowerCase()));
  }, [results, query]);

  return (
    <>
      <Helmet><title>Scanner — TradeSignal Pro</title></Helmet>
      <div className="h-full flex flex-col bg-[#131722] text-[#d1d4dc] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a2e39] flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#2962ff]" />
              Market Scanner
            </h1>
            <p className="text-xs text-[#787b86]">Real-time multi-confluence screening</p>
          </div>
          <button
            type="button"
            onClick={runScan}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2962ff] text-white text-sm font-medium hover:bg-[#1e53e5] disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {scanning ? 'Scanning...' : 'Run Scan'}
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          <aside className="w-64 border-r border-[#2a2e39] p-3 overflow-y-auto shrink-0">
            <p className="text-[10px] text-[#787b86] uppercase mb-2">Scan Presets</p>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePreset(p.id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg mb-2 border transition-colors',
                  activePreset === p.id ? 'border-[#2962ff] bg-[#2962ff]/10' : 'border-[#2a2e39] hover:bg-[#2a2e39]'
                )}
              >
                <p className="text-sm font-medium">{p.name}</p>
                <ul className="mt-1 space-y-0.5">
                  {p.conditions.map((c) => (
                    <li key={c} className="text-[10px] text-[#787b86]">• {c}</li>
                  ))}
                </ul>
              </button>
            ))}
            <button type="button" className="w-full mt-2 py-2 text-xs text-[#2962ff] border border-dashed border-[#2962ff]/40 rounded-lg flex items-center justify-center gap-1">
              <Save className="w-3 h-3" /> Save preset
            </button>
          </aside>

          <main className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-3 px-4 py-2 border-b border-[#2a2e39]">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787b86]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter symbols..."
                  className="w-full pl-8 pr-3 py-1.5 rounded bg-[#1e222d] border border-[#2a2e39] text-sm"
                />
              </div>
              <select value={sector} onChange={(e) => setSector(e.target.value)} className="px-2 py-1.5 rounded bg-[#1e222d] border border-[#2a2e39] text-xs">
                <option value="all">All Markets</option>
                <option value="crypto">Crypto</option>
                <option value="forex">Forex</option>
                <option value="nse">NSE</option>
              </select>
              <Filter className="w-4 h-4 text-[#787b86]" />
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#1e222d] text-[#787b86] text-xs uppercase">
                  <tr>
                    <th className="text-left px-4 py-2">Symbol</th>
                    <th className="text-right px-2 py-2">Conviction</th>
                    <th className="text-right px-2 py-2">RSI</th>
                    <th className="text-right px-2 py-2">Change</th>
                    <th className="text-left px-2 py-2">Pattern</th>
                    <th className="text-center px-4 py-2">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-[#787b86]">
                        Click &quot;Run Scan&quot; to screen all symbols
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.symbol} className="border-t border-[#2a2e39]/50 hover:bg-[#2a2e39]/30">
                        <td className="px-4 py-2.5 font-mono font-medium">{r.symbol}</td>
                        <td className="text-right px-2">
                          <span className={cn('font-mono', r.conviction >= 70 ? 'text-[#26a69a]' : 'text-[#d1d4dc]')}>{r.conviction}%</span>
                        </td>
                        <td className="text-right px-2 font-mono">{r.rsi}</td>
                        <td className={cn('text-right px-2 font-mono', r.change >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]')}>
                          {r.change >= 0 ? '+' : ''}{r.change}%
                        </td>
                        <td className="px-2 text-[#787b86] text-xs">{r.pattern}</td>
                        <td className="text-center px-4">
                          <span className={cn('text-xs font-bold px-2 py-0.5 rounded', r.signal === 'BUY' ? 'bg-[#26a69a]/20 text-[#26a69a]' : r.signal === 'SELL' ? 'bg-[#ef5350]/20 text-[#ef5350]' : 'bg-[#787b86]/20 text-[#787b86]')}>
                            {r.signal}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
