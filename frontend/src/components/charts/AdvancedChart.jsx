import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
} from 'lightweight-charts';
import { transformChartData, normalizeOhlcv } from '../../utils/chartTransforms';
import { calcSMA, calcEMA, calcRSI, calcMACD } from '../../utils/chartIndicators';
import DrawingOverlay from './DrawingOverlay';
import { formatChartTime, isSubMinuteTimeframe } from '../../utils/chartTime';

function subPaneMargins(enabled) {
  const panes = [];
  if (enabled.rsi) panes.push('rsi');
  if (enabled.macd) panes.push('macd');
  if (enabled.adx || enabled.dmi) panes.push('adx');
  const n = panes.length;
  const pad = 0.02;
  const paneH = 0.12;

  if (n === 0) return { mainBottom: 0.08, scales: {} };

  const mainBottom = pad + n * paneH + pad;
  const scales = {};
  panes.forEach((key, i) => {
    const offsetFromBottom = (n - 1 - i) * paneH;
    const bottom = pad + offsetFromBottom;
    const top = 1 - bottom - paneH;
    scales[key] = { top, bottom };
  });

  return { mainBottom, scales };
}

export default function AdvancedChart({
  symbol = 'BTC/USDT',
  timeframe = '1H',
  chartType = 'candles',
  indicators = {},
  settings = {},
  data: externalData,
  pythonIndicators = null,
  indicatorSource = 'mock',
  autoTrendlines = [],
  srZones = [],
  mtfData = [],
  onCrosshairMove,
  syncCrosshair = true,
  isLive = false,
}) {
  const wrapperRef = useRef(null);
  const chartContainerRef = useRef(null);
  const chartApiRef = useRef(null);
  const seriesMapRef = useRef({});
  const crosshairHandlerRef = useRef(null);
  const [chartError, setChartError] = useState(null);
  const [chartReady, setChartReady] = useState(false);
  const activeTool = useSelector((s) => s.chart.activeTool);

  const upColor = settings.upColor || '#26a69a';
  const downColor = settings.downColor || '#ef5350';
  const bg = settings.backgroundColor || '#131722';
  const subMinute = isSubMinuteTimeframe(timeframe);

  const rawData = useMemo(() => normalizeOhlcv(externalData), [externalData]);
  const chartData = useMemo(() => transformChartData(rawData, chartType), [rawData, chartType]);
  const rawDataRef = useRef(rawData);
  const chartDataRef = useRef(chartData);
  const autoTrendlinesRef = useRef(autoTrendlines);
  const srZonesRef = useRef(srZones);
  const mtfDataRef = useRef(mtfData);
  rawDataRef.current = rawData;
  chartDataRef.current = chartData;
  autoTrendlinesRef.current = autoTrendlines;
  srZonesRef.current = srZones;
  mtfDataRef.current = mtfData;

  const py = pythonIndicators;
  const usePython = indicatorSource?.includes('python') && py;

  crosshairHandlerRef.current = syncCrosshair ? onCrosshairMove : null;

  const applySeriesRef = useRef(null);
  const liveCloseRef = useRef(null);

  const clearSeriesMap = useCallback((chart) => {
    Object.values(seriesMapRef.current).forEach((s) => {
      try {
        if (s) chart.removeSeries(s);
      } catch {
        /* removed */
      }
    });
    seriesMapRef.current = {};
  }, []);

  const applySeries = useCallback((chart) => {
    clearSeriesMap(chart);
    const chartData = chartDataRef.current;
    const rawData = rawDataRef.current;
    if (!chartData.length) return;

    const margins = subPaneMargins(indicators);
    chart.priceScale('right').applyOptions({
      autoScale: true,
      scaleMargins: { top: 0.02, bottom: margins.mainBottom },
    });

    const map = seriesMapRef.current;

    if (chartType === 'line' || chartType === 'area') {
      map.main = chart.addSeries(chartType === 'area' ? AreaSeries : LineSeries, {
        lineColor: '#2962ff',
        topColor: chartType === 'area' ? 'rgba(41,98,255,0.3)' : undefined,
        bottomColor: chartType === 'area' ? 'rgba(41,98,255,0)' : undefined,
        lineWidth: 2,
      });
      map.main.setData(chartData.map((d) => ({ time: d.time, value: d.close })));
    } else {
      map.candles = chart.addSeries(CandlestickSeries, {
        upColor,
        downColor,
        borderUpColor: upColor,
        borderDownColor: downColor,
        wickUpColor: upColor,
        wickDownColor: downColor,
      });
      map.candles.setData(chartData);

      if (indicators.sma20) {
        map.sma20 = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1 });
        map.sma20.setData(calcSMA(rawData, 20));
      }
      if (indicators.ema20) {
        map.ema20 = chart.addSeries(LineSeries, { color: '#06b6d4', lineWidth: 1 });
        map.ema20.setData(calcEMA(rawData, 20));
      }
      if (indicators.bollinger) {
        const bb = usePython ? py.bollinger : null;
        if (bb?.upper?.length) {
          map.bbUpper = chart.addSeries(LineSeries, { color: '#787b86', lineWidth: 1, lineStyle: 2 });
          map.bbUpper.setData(bb.upper);
          map.bbMid = chart.addSeries(LineSeries, { color: '#2962ff', lineWidth: 1 });
          map.bbMid.setData(bb.middle);
          map.bbLower = chart.addSeries(LineSeries, { color: '#787b86', lineWidth: 1, lineStyle: 2 });
          map.bbLower.setData(bb.lower);
        }
      }
    }

    if (indicators.volume && chartType !== 'line') {
      map.volume = chart.addSeries(HistogramSeries, { priceScaleId: 'vol' });
      map.volume.setData(rawData.map((d) => ({
        time: d.time,
        value: d.volume > 0 ? d.volume : Math.abs(d.close - d.open) * 80 + 300,
        color: d.close >= d.open ? `${upColor}88` : `${downColor}88`,
      })));
      chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    }

    if (indicators.rsi) {
      const rsiData = usePython && py.rsi?.length ? py.rsi : calcRSI(rawData);
      map.rsi = chart.addSeries(AreaSeries, {
        lineColor: '#7e57c2',
        topColor: 'rgba(126,87,194,0.25)',
        bottomColor: 'rgba(126,87,194,0)',
        priceScaleId: 'rsi',
      });
      map.rsi.setData(rsiData);
      chart.priceScale('rsi').applyOptions({ scaleMargins: margins.scales.rsi || { top: 0.78, bottom: 0.05 } });
    }

    if (indicators.macd) {
      const macd = usePython && py.macd ? py.macd : calcMACD(rawData);
      map.macdHist = chart.addSeries(HistogramSeries, { priceScaleId: 'macd' });
      map.macdHist.setData(macd.histogram || []);
      map.macdLine = chart.addSeries(LineSeries, { color: '#2962ff', lineWidth: 1, priceScaleId: 'macd' });
      map.macdLine.setData(macd.line || macd.macdLine || []);
      map.macdSignal = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, priceScaleId: 'macd' });
      map.macdSignal.setData(macd.signal || macd.signalLine || []);
      chart.priceScale('macd').applyOptions({ scaleMargins: margins.scales.macd || { top: 0.78, bottom: 0.05 } });
    }

    if (indicators.adx || indicators.dmi) {
      if (indicators.adx && usePython && py.adx?.length) {
        map.adx = chart.addSeries(LineSeries, { color: '#e91e63', lineWidth: 2, priceScaleId: 'adx' });
        map.adx.setData(py.adx);
      }
      if (indicators.dmi && usePython && py.dmi) {
        if (py.dmi.plus?.length) {
          map.dmiPlus = chart.addSeries(LineSeries, { color: '#26a69a', lineWidth: 1, priceScaleId: 'adx' });
          map.dmiPlus.setData(py.dmi.plus);
        }
        if (py.dmi.minus?.length) {
          map.dmiMinus = chart.addSeries(LineSeries, { color: '#ef5350', lineWidth: 1, priceScaleId: 'adx' });
          map.dmiMinus.setData(py.dmi.minus);
        }
      }
      chart.priceScale('adx').applyOptions({ scaleMargins: margins.scales.adx || { top: 0.78, bottom: 0.05 } });
    }

    const t1 = chartData[0]?.time;
    const t2 = chartData[chartData.length - 1]?.time;

    autoTrendlinesRef.current.forEach((tl, idx) => {
      if (tl.points?.length >= 2 && t1 && t2) {
        const p1 = tl.points[0];
        const p2 = tl.points[1];
        if (p1.time >= t1 && p2.time <= t2) {
          const s = chart.addSeries(LineSeries, {
            color: tl.color || '#2962ff',
            lineWidth: 1,
            lineStyle: 2,
            priceScaleId: 'right',
          });
          s.setData([
            { time: p1.time, value: p1.price },
            { time: p2.time, value: p2.price },
          ]);
          map[`tl${idx}`] = s;
        }
      }
    });

    if (t1 && t2) {
      srZonesRef.current.slice(0, 4).forEach((z, idx) => {
        map[`srTop${idx}`] = chart.addSeries(LineSeries, { color: 'rgba(41,98,255,0.35)', lineWidth: 1, lineStyle: 2 });
        map[`srTop${idx}`].setData([{ time: t1, value: z.priceHigh }, { time: t2, value: z.priceHigh }]);
        map[`srBot${idx}`] = chart.addSeries(LineSeries, { color: 'rgba(41,98,255,0.35)', lineWidth: 1, lineStyle: 2 });
        map[`srBot${idx}`].setData([{ time: t1, value: z.priceLow }, { time: t2, value: z.priceLow }]);
      });
    }

    const mtf = mtfDataRef.current;
    if (Array.isArray(mtf) && mtf.length > 2 && t1 && t2) {
      const mtfPoints = mtf
        .map((d) => ({ time: d.time, value: d.close }))
        .filter((d) => d.time >= t1 && d.time <= t2);
      if (mtfPoints.length > 2) {
        map.mtf = chart.addSeries(LineSeries, {
          color: '#f59e0b',
          lineWidth: 1,
          lineStyle: 2,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        map.mtf.setData(mtfPoints);
      }
    }

    chart.timeScale().fitContent();

    const last = chartData[chartData.length - 1];
    liveCloseRef.current = last?.close ?? null;
  }, [
    chartType,
    indicators,
    upColor,
    downColor,
    py,
    usePython,
    clearSeriesMap,
  ]);

  applySeriesRef.current = applySeries;

  // Create chart once when container + data are ready
  useEffect(() => {
    const el = chartContainerRef.current;
    const wrapper = wrapperRef.current;
    if (!el || !wrapper || !chartData.length) return undefined;

    let chart = null;
    let ro = null;
    let cancelled = false;
    let rafId = 0;
    let attempts = 0;

    const init = () => {
      if (cancelled) return;
      attempts += 1;
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      if ((w < 20 || h < 20) && attempts < 120) {
        rafId = requestAnimationFrame(init);
        return;
      }

      try {
        setChartError(null);
        chart = createChart(el, {
          width: Math.max(w, 200),
          height: Math.max(h, 280),
          layout: { background: { color: bg }, textColor: '#787b86' },
          grid: {
            vertLines: { visible: settings.gridVisible !== false, color: 'rgba(42,46,57,0.5)' },
            horzLines: { visible: settings.gridVisible !== false, color: 'rgba(42,46,57,0.5)' },
          },
          crosshair: { mode: 1 },
          rightPriceScale: { borderColor: '#2a2e39', autoScale: true },
          timeScale: {
            borderColor: '#2a2e39',
            timeVisible: true,
            secondsVisible: subMinute,
            rightOffset: 8,
            fixLeftEdge: false,
            fixRightEdge: false,
          },
          localization: {
            timeFormatter: (time) => formatChartTime(time, subMinute),
            dateFormat: 'dd MMM yyyy',
          },
        });
        chartApiRef.current = chart;

        chart.subscribeCrosshairMove((param) => {
          const handler = crosshairHandlerRef.current;
          if (!handler || !param?.time || !param?.point) return;
          handler({ time: param.time, point: param.point, symbol });
        });

        applySeriesRef.current?.(chart);
        setChartReady(true);

        ro = new ResizeObserver(() => {
          if (chart && wrapper.clientWidth > 20 && wrapper.clientHeight > 20) {
            chart.applyOptions({
              width: wrapper.clientWidth,
              height: Math.max(wrapper.clientHeight, 280),
            });
          }
        });
        ro.observe(wrapper);
      } catch (err) {
        console.error(err);
        setChartError(err.message);
      }
    };

    rafId = requestAnimationFrame(init);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      ro?.disconnect();
      if (chart) clearSeriesMap(chart);
      chart?.remove();
      chartApiRef.current = null;
      seriesMapRef.current = {};
      liveCloseRef.current = null;
      setChartReady(false);
    };
  }, [chartData.length, bg, settings.gridVisible, symbol, subMinute, clearSeriesMap]);

  const lastBar = chartData.length ? chartData[chartData.length - 1] : null;
  const lastRawBar = rawData.length ? rawData[rawData.length - 1] : null;

  // Rebuild overlays / indicators when settings change (not on every price tick)
  const rebuildKey = `${symbol}|${chartType}|${JSON.stringify(indicators)}|${usePython}|${autoTrendlines.length}|${srZones.length}|${mtfData.length}`;
  useEffect(() => {
    const chart = chartApiRef.current;
    if (!chart || !chartReady || !chartDataRef.current.length) return;
    applySeriesRef.current?.(chart);
  }, [rebuildKey, chartReady, symbol]);

  // Live candle update — runs on every price change without full chart rebuild
  useEffect(() => {
    const chart = chartApiRef.current;
    const map = seriesMapRef.current;
    if (!chart || !chartReady || !lastBar || !lastRawBar) return;

    try {
      if (map.candles) {
        map.candles.update({
          time: lastBar.time,
          open: lastBar.open,
          high: lastBar.high,
          low: lastBar.low,
          close: lastBar.close,
        });
      } else if (map.main) {
        map.main.update({ time: lastBar.time, value: lastBar.close });
      }

      if (map.volume) {
        const vol = lastRawBar.volume > 0
          ? lastRawBar.volume
          : Math.abs(lastRawBar.close - lastRawBar.open) * 80 + 300;
        map.volume.update({
          time: lastBar.time,
          value: vol,
          color: lastBar.close >= lastBar.open ? `${upColor}88` : `${downColor}88`,
        });
      }

      if (map.sma20 && rawData.length >= 20) {
        const sma = calcSMA(rawData, 20);
        const pt = sma[sma.length - 1];
        if (pt) map.sma20.update(pt);
      }

      liveCloseRef.current = lastBar.close;
      chart.timeScale().scrollToRealTime();
    } catch (err) {
      console.warn('Live chart update failed, rebuilding', err);
      applySeriesRef.current?.(chart);
    }
  }, [
    lastBar?.time,
    lastBar?.open,
    lastBar?.high,
    lastBar?.low,
    lastBar?.close,
    lastRawBar?.volume,
    chartReady,
    rawData.length,
    upColor,
    downColor,
  ]);

  if (!chartData.length) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#131722] text-[#787b86] text-sm">
        No chart data
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="absolute inset-0 w-full h-full min-h-[280px]">
      {chartError && (
        <div className="absolute inset-0 flex items-center justify-center text-[#787b86] text-sm z-30 bg-[#131722]">
          {chartError}
        </div>
      )}
      <div ref={chartContainerRef} className="absolute inset-0" />
      {isLive && (
        <span className="absolute top-1 right-2 z-10 flex items-center gap-1 text-[10px] text-[#26a69a] font-mono pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#26a69a] animate-pulse" />
          LIVE
        </span>
      )}
      <DrawingOverlay
        chartRef={chartApiRef}
        containerRef={wrapperRef}
        symbol={symbol}
        activeTool={activeTool}
      />
    </div>
  );
}
