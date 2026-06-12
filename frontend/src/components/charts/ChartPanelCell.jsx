import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import AdvancedChart from './AdvancedChart';
import { useChartPayload } from '../../hooks/useChartPayload';
import { useLiveKline } from '../../hooks/useLiveKline';
import { normalizeOhlcv } from '../../utils/chartTransforms';
import { detectTrendlines, runPatternScan } from '../../utils/patternDetection';
import { detectSRZones } from '../../utils/supportResistance';
import { aggregateCandles, getHigherTimeframe } from '../../utils/multiTimeframe';
import { cn } from '../../utils/cn';

export default function ChartPanelCell({
  panel,
  isActive,
  indicators,
  chartSettings,
  syncCrosshair,
  onCrosshairMove,
  onSelect,
}) {
  const { payload, loading, refreshing, source } = useChartPayload(panel.symbol, panel.timeframe, true);
  const chartState = useSelector((s) => s.chart);

  const baseOhlcv = useMemo(() => normalizeOhlcv(payload?.ohlcv), [payload?.ohlcv]);
  const { ohlcv: liveOhlcv, connected: liveConnected } = useLiveKline(
    panel.symbol,
    panel.timeframe,
    baseOhlcv,
    baseOhlcv.length > 0
  );

  const analysis = useMemo(() => {
    if (!liveOhlcv.length) return { trendlines: [], patterns: [], zones: [], mtf: [] };
    const higherTf = getHigherTimeframe(panel.timeframe);
    return {
      trendlines: chartState.showAutoTrendlines ? detectTrendlines(liveOhlcv) : [],
      patterns: chartState.showPatterns ? runPatternScan(liveOhlcv) : [],
      zones: chartState.showSRZones ? detectSRZones(liveOhlcv) : [],
      mtf: aggregateCandles(liveOhlcv, higherTf),
    };
  }, [
    liveOhlcv,
    panel.timeframe,
    chartState.showAutoTrendlines,
    chartState.showPatterns,
    chartState.showSRZones,
  ]);

  const ready = !loading && liveOhlcv.length > 0;
  const initialLoad = loading && !liveOhlcv.length;

  return (
    <div
      className={cn(
        'relative min-h-[280px] h-full bg-[#131722]',
        isActive && 'ring-1 ring-[#2962ff] ring-inset'
      )}
      onClick={onSelect}
    >
      {initialLoad && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#131722]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-[#2962ff] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#787b86]">Loading chart…</span>
          </div>
        </div>
      )}
      {ready && (
        <AdvancedChart
          symbol={panel.symbol}
          timeframe={panel.timeframe}
          chartType={panel.chartType}
          indicators={indicators}
          settings={chartSettings}
          data={liveOhlcv}
          pythonIndicators={payload?.indicators}
          indicatorSource={source}
          autoTrendlines={isActive ? analysis.trendlines : []}
          srZones={isActive ? analysis.zones : []}
          mtfData={isActive ? analysis.mtf : []}
          syncCrosshair={syncCrosshair}
          onCrosshairMove={onCrosshairMove}
          isLive={liveConnected}
        />
      )}
      <span className="absolute top-1 left-2 text-[10px] text-[#787b86] font-mono z-10 pointer-events-none flex items-center gap-1">
        <span>
          {panel.symbol} · {panel.timeframe}
          {source?.includes('python') && (
            <span className="ml-1 text-[#26a69a]">· Python</span>
          )}
          {liveConnected && (
            <span className="ml-1 text-[#26a69a]">· Binance</span>
          )}
        </span>
        {refreshing && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2962ff] animate-pulse" title="Syncing indicators…" />
        )}
      </span>
    </div>
  );
}
