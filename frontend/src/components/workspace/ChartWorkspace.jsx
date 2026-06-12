import { useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutGrid, Link2, PanelRight, PanelRightClose, Unlink } from 'lucide-react';
import { setActiveTab as setMarketTab } from '../../store/slices/marketSlice';
import { setLayout, setSync, setCrosshair } from '../../store/slices/chartSlice';
import ChartPanelCell from '../charts/ChartPanelCell';
import SymbolBar from '../dashboard/SymbolBar';
import ChartToolbarPro from '../dashboard/ChartToolbarPro';
import DrawingToolbar from '../dashboard/DrawingToolbar';
import WatchlistPanel from '../dashboard/WatchlistPanel';
import BottomPanel from '../dashboard/BottomPanel';
import IndicatorsPanel from '../dashboard/IndicatorsPanel';
import ChartSettingsPanel from '../dashboard/ChartSettingsPanel';
import { mockTickers } from '../../utils/mockData';
import { loadStoredIndicators, loadStoredChartSettings } from '../../utils/normalize';
import { cn } from '../../utils/cn';

const LAYOUTS = [
  { n: 1, label: '1' },
  { n: 2, label: '2' },
  { n: 4, label: '4' },
];

export default function ChartWorkspace({ signals = [], loading = false }) {
  const dispatch = useDispatch();
  const { layout, syncSymbol, syncTimeframe, syncCrosshair } = useSelector((s) => s.chart);
  const { tickers, activeTab } = useSelector((s) => s.market);

  const displayTickers = tickers.length ? tickers : mockTickers;
  const [panels, setPanels] = useState([
    { id: 0, symbol: 'BTC/USDT', timeframe: '1H', chartType: 'candles' },
    { id: 1, symbol: 'ETH/USDT', timeframe: '1H', chartType: 'candles' },
    { id: 2, symbol: 'SOL/USDT', timeframe: '4H', chartType: 'candles' },
    { id: 3, symbol: 'BNB/USDT', timeframe: '1D', chartType: 'candles' },
  ]);
  const [activePanel, setActivePanel] = useState(0);
  const [watchlistOpen, setWatchlistOpen] = useState(true);
  const [bottomCollapsed, setBottomCollapsed] = useState(true);
  const [indicatorsOpen, setIndicatorsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [indicators, setIndicators] = useState(loadStoredIndicators);
  const [chartSettings, setChartSettings] = useState(loadStoredChartSettings);

  const visiblePanels = panels.slice(0, layout);
  const panel = panels[activePanel] || panels[0];
  const selectedTicker = displayTickers.find((t) => t.symbol === panel.symbol) || displayTickers[0];

  const handleCrosshairMove = useCallback((payload) => {
    if (syncCrosshair) dispatch(setCrosshair(payload));
  }, [dispatch, syncCrosshair]);

  const updatePanel = (updates) => {
    setPanels((prev) => {
      const next = [...prev];
      const idx = activePanel;
      next[idx] = { ...next[idx], ...updates };
      if (syncSymbol && updates.symbol) {
        return next.map((p, i) => (i === idx ? next[idx] : syncSymbol ? { ...p, symbol: updates.symbol } : p));
      }
      if (syncTimeframe && updates.timeframe) {
        return next.map((p, i) => (i === idx ? next[idx] : syncTimeframe ? { ...p, timeframe: updates.timeframe } : p));
      }
      return next;
    });
  };

  const gridClass = {
    1: 'grid-cols-1 grid-rows-1',
    2: 'grid-cols-2 grid-rows-1',
    4: 'grid-cols-2 grid-rows-2',
  }[layout] || 'grid-cols-1';

  const activeIndicatorCount = useMemo(
    () => Object.values(indicators).filter(Boolean).length,
    [indicators]
  );

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#131722]">
      <SymbolBar symbol={panel.symbol} ticker={selectedTicker} />
      <div className="flex items-center gap-2 px-2 py-1 border-b border-[#2a2e39] bg-[#1e222d] shrink-0">
        <div className="flex gap-0.5">
          {LAYOUTS.map(({ n, label }) => (
            <button
              key={n}
              type="button"
              onClick={() => dispatch(setLayout(n))}
              className={cn(
                'px-2 py-1 text-xs rounded',
                layout === n ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:bg-[#2a2e39]'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5 inline mr-1" />
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => dispatch(setSync({ syncSymbol: !syncSymbol }))}
          className={cn('p-1.5 rounded text-xs flex items-center gap-1', syncSymbol ? 'text-[#2962ff]' : 'text-[#787b86]')}
          title="Sync symbol"
        >
          {syncSymbol ? <Link2 className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5" />}
          Symbol
        </button>
        <button
          type="button"
          onClick={() => dispatch(setSync({ syncTimeframe: !syncTimeframe }))}
          className={cn('p-1.5 rounded text-xs flex items-center gap-1', syncTimeframe ? 'text-[#2962ff]' : 'text-[#787b86]')}
          title="Sync timeframe"
        >
          {syncTimeframe ? <Link2 className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5" />}
          TF
        </button>
        <button
          type="button"
          onClick={() => dispatch(setSync({ syncCrosshair: !syncCrosshair }))}
          className={cn('p-1.5 rounded text-xs flex items-center gap-1', syncCrosshair ? 'text-[#2962ff]' : 'text-[#787b86]')}
          title="Sync crosshair"
        >
          {syncCrosshair ? <Link2 className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5" />}
          Crosshair
        </button>
        <button
          type="button"
          onClick={() => setWatchlistOpen((v) => !v)}
          className={cn('p-1.5 rounded text-xs flex items-center gap-1 text-[#787b86] hover:bg-[#2a2e39]')}
          title={watchlistOpen ? 'Hide watchlist' : 'Show watchlist'}
        >
          {watchlistOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRight className="w-3.5 h-3.5" />}
          Watchlist
        </button>
      </div>

      <ChartToolbarPro
        timeframe={panel.timeframe}
        chartType={panel.chartType}
        onTimeframeChange={(tf) => updatePanel({ timeframe: tf })}
        onChartTypeChange={(ct) => updatePanel({ chartType: ct })}
        onOpenIndicators={() => setIndicatorsOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        activeIndicatorCount={activeIndicatorCount}
        patterns={[]}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <DrawingToolbar />
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className={cn('flex-1 min-h-[280px] grid gap-px bg-[#2a2e39]', gridClass)}>
            {visiblePanels.map((p, i) => (
              <ChartPanelCell
                key={`${p.id}-${p.symbol}-${p.timeframe}`}
                panel={p}
                isActive={activePanel === i}
                indicators={indicators}
                chartSettings={chartSettings}
                syncCrosshair={syncCrosshair}
                onCrosshairMove={handleCrosshairMove}
                onSelect={() => setActivePanel(i)}
              />
            ))}
          </div>
          <BottomPanel signals={signals} loading={loading} collapsed={bottomCollapsed} onToggleCollapse={() => setBottomCollapsed((c) => !c)} />
        </div>
        {watchlistOpen && (
          <WatchlistPanel
            tickers={displayTickers}
            selectedPair={panel.symbol}
            onSelect={(sym) => updatePanel({ symbol: sym })}
            marketTab={activeTab}
            onMarketTabChange={(tab) => dispatch(setMarketTab(tab))}
          />
        )}
      </div>

      <IndicatorsPanel open={indicatorsOpen} onClose={() => setIndicatorsOpen(false)} indicators={indicators} onChange={(n) => { setIndicators(n); localStorage.setItem('chartIndicators', JSON.stringify(n)); }} />
      <ChartSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} settings={chartSettings} onChange={(n) => { setChartSettings(n); localStorage.setItem('chartSettings', JSON.stringify(n)); }} />
    </div>
  );
}
