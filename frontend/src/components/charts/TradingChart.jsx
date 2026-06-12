import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  AreaSeries,
} from 'lightweight-charts';
import { mockChartData } from '../../utils/mockData';
import {
  calcSMA, calcEMA, calcRSI, calcMACD,
} from '../../utils/chartIndicators';
import { cn } from '../../utils/cn';

export default function TradingChart({
  data,
  symbol = 'BTC/USDT',
  className,
  height,
  terminal = false,
  timeframe = '1H',
  chartType = 'candles',
  indicators = {},
  settings = {},
}) {
  const containerRef = useRef(null);
  const [chartError, setChartError] = useState(null);

  const upColor = settings.upColor || '#26a69a';
  const downColor = settings.downColor || '#ef5350';
  const bg = settings.backgroundColor || '#131722';
  const gridVisible = settings.gridVisible !== false;
  const safeIndicators = indicators && typeof indicators === 'object' ? indicators : {};

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const el = containerRef.current;
    let chart = null;
    let ro = null;
    let cancelled = false;

    const initChart = () => {
      if (cancelled) return;
      const w = el.clientWidth;
      const h = height || el.clientHeight;
      if (w < 10 || h < 10) {
        requestAnimationFrame(initChart);
        return;
      }

      try {
        setChartError(null);
        chart = createChart(el, {
          width: w,
          height: Math.max(h, 200),
          layout: { background: { color: bg }, textColor: '#787b86' },
          grid: {
            vertLines: { visible: gridVisible, color: 'rgba(42, 46, 57, 0.6)' },
            horzLines: { visible: gridVisible, color: 'rgba(42, 46, 57, 0.6)' },
          },
          crosshair: { mode: settings.crosshair !== false ? 1 : 0 },
          rightPriceScale: { borderColor: '#2a2e39' },
          timeScale: { borderColor: '#2a2e39', timeVisible: true },
        });

        const chartData = data?.length ? data : mockChartData(150, symbol);

        if (chartType === 'line') {
          const s = chart.addSeries(LineSeries, { color: '#2962ff', lineWidth: 2 });
          s.setData(chartData.map((d) => ({ time: d.time, value: d.close })));
        } else {
          const s = chart.addSeries(CandlestickSeries, {
            upColor,
            downColor,
            borderUpColor: upColor,
            borderDownColor: downColor,
            wickUpColor: upColor,
            wickDownColor: downColor,
          });
          s.setData(chartData);

          if (safeIndicators.sma20) {
            const ma = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1 });
            ma.setData(calcSMA(chartData, 20));
          }
          if (safeIndicators.sma50) {
            const ma = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 1 });
            ma.setData(calcSMA(chartData, 50));
          }
          if (safeIndicators.ema20) {
            const ma = chart.addSeries(LineSeries, { color: '#06b6d4', lineWidth: 1 });
            ma.setData(calcEMA(chartData, 20));
          }
          if (safeIndicators.ema50) {
            const ma = chart.addSeries(LineSeries, { color: '#ec4899', lineWidth: 1 });
            ma.setData(calcEMA(chartData, 50));
          }
        }

        if (safeIndicators.volume && settings.showVolume !== false && chartType !== 'line') {
          const vol = chart.addSeries(HistogramSeries, {
            priceFormat: { type: 'volume' },
            priceScaleId: 'volume',
          });
          vol.setData(
            chartData.map((d) => ({
              time: d.time,
              value: Math.abs(d.close - d.open) * 100 + 500,
              color: d.close >= d.open ? `${upColor}99` : `${downColor}99`,
            }))
          );
          chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
        }

        if (safeIndicators.rsi) {
          const rsi = chart.addSeries(AreaSeries, {
            lineColor: '#7e57c2',
            topColor: 'rgba(126, 87, 194, 0.3)',
            bottomColor: 'rgba(126, 87, 194, 0)',
            lineWidth: 2,
            priceScaleId: 'rsi',
          });
          rsi.setData(calcRSI(chartData));
          chart.priceScale('rsi').applyOptions({ scaleMargins: { top: 0.75, bottom: 0.05 } });
        }

        if (safeIndicators.macd && chartType !== 'line') {
          const { histogram, macdLine, signalLine } = calcMACD(chartData);
          const hist = chart.addSeries(HistogramSeries, { priceScaleId: 'macd' });
          hist.setData(histogram);
          const ml = chart.addSeries(LineSeries, { color: '#2962ff', lineWidth: 1, priceScaleId: 'macd' });
          const sl = chart.addSeries(LineSeries, { color: '#ff9800', lineWidth: 1, priceScaleId: 'macd' });
          ml.setData(macdLine);
          sl.setData(signalLine);
          chart.priceScale('macd').applyOptions({ scaleMargins: { top: 0.7, bottom: 0.05 } });
        }

        chart.timeScale().fitContent();

        ro = new ResizeObserver(() => {
          if (!chart || !el) return;
          const nw = el.clientWidth;
          const nh = height || el.clientHeight;
          if (nw > 10 && nh > 10) chart.applyOptions({ width: nw, height: nh });
        });
        ro.observe(el);
      } catch (err) {
        console.error('Chart init error:', err);
        setChartError(err.message || 'Chart failed to load');
      }
    };

    requestAnimationFrame(initChart);

    return () => {
      cancelled = true;
      ro?.disconnect();
      chart?.remove();
    };
  }, [data, height, symbol, timeframe, chartType, safeIndicators, settings, upColor, downColor, bg, gridVisible]);

  if (terminal) {
    return (
      <div className={cn('absolute inset-0 w-full h-full min-h-[200px]', className)}>
        {chartError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131722] text-[#787b86] text-sm z-10">
            {chartError}
          </div>
        )}
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl overflow-hidden border border-[#2a2e39]', className)} style={{ background: bg }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2e39]">
        <span className="font-mono text-sm text-[#d1d4dc]">{symbol}</span>
        <span className="text-xs text-[#787b86]">{timeframe}</span>
      </div>
      <div ref={containerRef} className="w-full min-h-[300px]" style={{ height: height || 400 }} />
    </div>
  );
}
