import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function ChartSettingsPanel({ open, onClose, settings, onChange }) {
  if (!open) return null;

  const update = (key, value) => onChange({ ...settings, [key]: value });

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} role="presentation" />
      <aside className="fixed top-0 right-0 bottom-0 w-80 max-w-[90vw] z-50 bg-[#1e222d] border-l border-[#2a2e39] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2e39]">
          <h2 className="text-sm font-semibold text-[#d1d4dc]">Chart Settings</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded hover:bg-[#2a2e39] text-[#787b86]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
          <section>
            <h3 className="text-xs text-[#787b86] uppercase mb-3">Display</h3>
            {[
              { key: 'gridVisible', label: 'Show grid lines' },
              { key: 'showVolume', label: 'Show volume pane' },
              { key: 'crosshair', label: 'Crosshair' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm text-[#d1d4dc]">{label}</span>
                <input
                  type="checkbox"
                  checked={!!settings[key]}
                  onChange={(e) => update(key, e.target.checked)}
                  className="w-4 h-4 accent-[#2962ff]"
                />
              </label>
            ))}
          </section>

          <section>
            <h3 className="text-xs text-[#787b86] uppercase mb-3">Colors</h3>
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs text-[#787b86]">Bullish candle</span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={settings.upColor}
                    onChange={(e) => update('upColor', e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-xs text-[#d1d4dc]">{settings.upColor}</span>
                </div>
              </label>
              <label className="block">
                <span className="text-xs text-[#787b86]">Bearish candle</span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={settings.downColor}
                    onChange={(e) => update('downColor', e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-xs text-[#d1d4dc]">{settings.downColor}</span>
                </div>
              </label>
              <label className="block">
                <span className="text-xs text-[#787b86]">Background</span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => update('backgroundColor', e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-xs text-[#d1d4dc]">{settings.backgroundColor}</span>
                </div>
              </label>
            </div>
          </section>
        </div>

        <div className="p-3 border-t border-[#2a2e39] flex gap-2">
          <button
            type="button"
            onClick={() => onChange({
              gridVisible: true,
              showVolume: true,
              upColor: '#26a69a',
              downColor: '#ef5350',
              backgroundColor: '#131722',
              crosshair: true,
            })}
            className="flex-1 py-2 rounded-lg border border-[#2a2e39] text-[#787b86] text-sm hover:bg-[#2a2e39]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-[#2962ff] text-white text-sm font-medium"
          >
            Done
          </button>
        </div>
      </aside>
    </>
  );
}
