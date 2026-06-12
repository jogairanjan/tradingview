import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addDrawing, setSelectedDrawing, removeDrawing } from '../../store/slices/chartSlice';

const TOOL_COLORS = {
  trendline: '#2962ff',
  horizontal: '#f59e0b',
  vertical: '#8b5cf6',
  rectangle: '#06b6d4',
  fib: '#ec4899',
  ray: '#2962ff',
  text: '#d1d4dc',
};

const HIT_RADIUS = 10;

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function hitTestDrawing(d, x, y, w) {
  if (d.type === 'horizontal' && d.priceY != null) {
    return Math.abs(y - d.priceY) <= HIT_RADIUS;
  }
  if (d.type === 'rectangle' && d.points?.length >= 2) {
    const [p1, p2] = d.points;
    const left = Math.min(p1.x, p2.x);
    const right = Math.max(p1.x, p2.x);
    const top = Math.min(p1.y, p2.y);
    const bottom = Math.max(p1.y, p2.y);
    const onBorder =
      (Math.abs(x - left) <= HIT_RADIUS && y >= top - HIT_RADIUS && y <= bottom + HIT_RADIUS) ||
      (Math.abs(x - right) <= HIT_RADIUS && y >= top - HIT_RADIUS && y <= bottom + HIT_RADIUS) ||
      (Math.abs(y - top) <= HIT_RADIUS && x >= left - HIT_RADIUS && x <= right + HIT_RADIUS) ||
      (Math.abs(y - bottom) <= HIT_RADIUS && x >= left - HIT_RADIUS && x <= right + HIT_RADIUS);
    return onBorder;
  }
  if (d.type === 'text' && d.points?.[0]) {
    const p = d.points[0];
    return Math.hypot(x - p.x, y - p.y) <= 20;
  }
  if (d.points?.length >= 2) {
    const [p1, p2] = d.points;
    if (p1.x == null || p2.x == null) return false;
    const endX = d.type === 'ray' ? w : p2.x;
    return distToSegment(x, y, p1.x, p1.y, endX, p2.y) <= HIT_RADIUS;
  }
  return false;
}

export default function DrawingOverlay({ chartRef, containerRef, symbol, activeTool }) {
  const canvasRef = useRef(null);
  const dispatch = useDispatch();
  const drawings = useSelector((s) => s.chart.drawings.filter((d) => !d.symbol || d.symbol === symbol));
  const selectedDrawingId = useSelector((s) => s.chart.selectedDrawingId);
  const pendingRef = useRef(null);
  const isDrawingRef = useRef(false);

  const getCoords = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, [containerRef]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    const all = [...drawings];
    if (pendingRef.current) all.push(pendingRef.current);

    all.forEach((d) => {
      const isSelected = d.id === selectedDrawingId;
      ctx.strokeStyle = isSelected ? '#ffffff' : (d.color || TOOL_COLORS[d.type] || '#2962ff');
      ctx.lineWidth = isSelected ? 3 : (d.locked ? 1 : 2);
      ctx.setLineDash(d.type === 'ray' ? [6, 4] : []);

      if (d.type === 'horizontal' && d.priceY != null) {
        ctx.beginPath();
        ctx.moveTo(0, d.priceY);
        ctx.lineTo(w, d.priceY);
        ctx.stroke();
        if (d.label) {
          ctx.fillStyle = '#787b86';
          ctx.font = '11px Inter, sans-serif';
          ctx.fillText(d.label, 8, d.priceY - 4);
        }
      } else if (d.points?.length >= 2) {
        const [p1, p2] = d.points;
        if (p1.x != null && p2.x != null) {
          if (d.type === 'rectangle') {
            ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
          } else {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            const endX = d.type === 'ray' ? w : p2.x;
            ctx.lineTo(endX, p2.y);
            ctx.stroke();
          }
        }
      } else if (d.type === 'text' && d.points?.[0]) {
        ctx.fillStyle = '#d1d4dc';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(d.text || 'Label', d.points[0].x, d.points[0].y);
      }
      ctx.setLineDash([]);
    });
  }, [drawings, containerRef, selectedDrawingId]);

  useEffect(() => {
    redraw();
    const ro = new ResizeObserver(redraw);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [redraw, containerRef]);

  useEffect(() => {
    const onKey = (e) => {
      if (activeTool !== 'select' || !selectedDrawingId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        dispatch(removeDrawing(selectedDrawingId));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeTool, selectedDrawingId, dispatch]);

  const findDrawingAt = (x, y) => {
    const w = containerRef.current?.clientWidth || 0;
    for (let i = drawings.length - 1; i >= 0; i--) {
      if (hitTestDrawing(drawings[i], x, y, w)) return drawings[i];
    }
    return null;
  };

  const handleMouseDown = (e) => {
    const coords = getCoords(e);
    if (!coords) return;

    if (activeTool === 'cursor') return;

    if (activeTool === 'select') {
      const hit = findDrawingAt(coords.x, coords.y);
      dispatch(setSelectedDrawing(hit?.id || null));
      redraw();
      return;
    }

    if (activeTool === 'eraser') {
      const hit = findDrawingAt(coords.x, coords.y);
      if (hit) dispatch(removeDrawing(hit.id));
      return;
    }

    isDrawingRef.current = true;
    pendingRef.current = {
      id: `draw-${Date.now()}`,
      type: activeTool,
      symbol,
      points: [{ x: coords.x, y: coords.y }],
      color: TOOL_COLORS[activeTool],
    };
    if (activeTool === 'horizontal') {
      pendingRef.current.priceY = coords.y;
      pendingRef.current.points = [{ x: 0, y: coords.y }, { x: 9999, y: coords.y }];
    }
    redraw();
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current || !pendingRef.current) return;
    const coords = getCoords(e);
    if (!coords) return;
    if (pendingRef.current.type === 'horizontal') {
      pendingRef.current.priceY = coords.y;
      pendingRef.current.points[1].y = coords.y;
    } else {
      pendingRef.current.points[1] = { x: coords.x, y: coords.y };
    }
    redraw();
  };

  const handleMouseUp = () => {
    if (!isDrawingRef.current || !pendingRef.current) return;
    isDrawingRef.current = false;
    dispatch(addDrawing({ ...pendingRef.current, locked: false }));
    pendingRef.current = null;
    redraw();
  };

  const interactive = activeTool !== 'cursor';
  const cursorClass =
    activeTool === 'eraser' ? 'cursor-pointer' :
    activeTool === 'select' ? 'cursor-crosshair' :
    activeTool === 'cursor' ? '' : 'cursor-crosshair';

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 z-20 ${cursorClass} ${interactive ? '' : 'pointer-events-none'}`}
      style={{ width: '100%', height: '100%' }}
      onMouseDown={interactive ? handleMouseDown : undefined}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseUp={interactive ? handleMouseUp : undefined}
      onMouseLeave={interactive ? handleMouseUp : undefined}
    />
  );
}
