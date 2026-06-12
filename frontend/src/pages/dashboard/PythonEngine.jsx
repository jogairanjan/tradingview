import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Play, Save, RotateCcw, Terminal, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { pythonApi } from '../../api/python';
import { unwrapApi } from '../../utils/api';
import Button from '../../components/ui/Button';

const DEFAULT_SCRIPT = `"""
Custom AI Trading Signal Script
Write Python code below. You have access to: df (OHLCV DataFrame), indicators module, numpy, pandas.
Must set: result = dict with signal_type, entry_price, stop_loss, target_1, confidence_score
"""

import pandas as pd
import numpy as np

# Add technical indicators to dataframe
df = indicators.add_all_indicators(df)
last_rsi = float(df['rsi'].iloc[-1])
close = float(df['close'].iloc[-1])

if last_rsi < 30:
    signal_type = "BUY"
    confidence = min(95, 70 + (30 - last_rsi))
elif last_rsi > 70:
    signal_type = "SELL"
    confidence = min(95, 70 + (last_rsi - 70))
else:
    signal_type = "HOLD"
    confidence = 50

atr = float(df['high'].iloc[-20:].max() - df['low'].iloc[-20:].min()) / 10

result = {
    "signal_type": signal_type,
    "entry_price": round(close, 4),
    "stop_loss": round(close - atr * 2 if signal_type == "BUY" else close + atr * 2, 4),
    "target_1": round(close + atr * 3 if signal_type == "BUY" else close - atr * 3, 4),
    "target_2": round(close + atr * 5 if signal_type == "BUY" else close - atr * 5, 4),
    "confidence_score": round(confidence, 1),
    "notes": f"RSI={last_rsi:.1f} custom script",
}
`;

export default function PythonEngine() {
  const [code, setCode] = useState(DEFAULT_SCRIPT);
  const [output, setOutput] = useState('');
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('1h');
  const [loading, setLoading] = useState(false);
  const [engineOk, setEngineOk] = useState(null);

  useEffect(() => {
    pythonApi.getScript()
      .then((res) => {
        const data = unwrapApi(res);
        if (data?.code) setCode(data.code);
      })
      .catch(() => {
        const saved = localStorage.getItem('pythonScript');
        if (saved) setCode(saved);
      });

    pythonApi.testEngine()
      .then(() => setEngineOk(true))
      .catch(() => setEngineOk(false));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await pythonApi.saveScript(code);
      localStorage.setItem('pythonScript', code);
      toast.success('Script saved');
    } catch {
      localStorage.setItem('pythonScript', code);
      toast.success('Saved locally (backend offline)');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    setLoading(true);
    setOutput('Running script...\n');
    try {
      let res;
      try {
        res = await pythonApi.runScript({ code, symbol, timeframe });
        res = unwrapApi({ data: res.data });
      } catch {
        res = await pythonApi.runOnEngine(code, symbol, timeframe);
      }
      setOutput(JSON.stringify(res, null, 2));
      toast.success('Script executed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Execution failed';
      setOutput(`Error:\n${msg}`);
      toast.error('Script failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Python AI Engine — TradeSignal Pro</title></Helmet>
      <div className="h-full flex flex-col min-h-0 bg-[#131722] text-[#d1d4dc]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2e39] shrink-0">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-[#2962ff]" />
            <div>
              <h1 className="text-lg font-semibold">Python Signal Engine</h1>
              <p className="text-xs text-[#787b86]">Write custom AI trading logic</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {engineOk === true && (
              <span className="flex items-center gap-1 text-[#26a69a]">
                <CheckCircle className="w-3.5 h-3.5" /> Engine online
              </span>
            )}
            {engineOk === false && (
              <span className="flex items-center gap-1 text-[#ef5350]">
                <XCircle className="w-3.5 h-3.5" /> Engine offline — save locally
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 border-b border-[#2a2e39] shrink-0 flex-wrap">
          <label className="text-xs text-[#787b86]">
            Symbol
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="ml-2 px-2 py-1 rounded bg-[#1e222d] border border-[#2a2e39] text-sm font-mono text-[#d1d4dc] w-28"
            />
          </label>
          <label className="text-xs text-[#787b86]">
            Timeframe
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="ml-2 px-2 py-1 rounded bg-[#1e222d] border border-[#2a2e39] text-sm text-[#d1d4dc]"
            >
              {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
            </select>
          </label>
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" onClick={() => setCode(DEFAULT_SCRIPT)} className="!text-[#787b86]">
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
            <Button variant="secondary" onClick={handleSave} loading={loading}>
              <Save className="w-4 h-4 mr-1" /> Save
            </Button>
            <Button onClick={handleRun} loading={loading}>
              <Play className="w-4 h-4 mr-1" /> Run Script
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0 gap-0">
          <div className="flex flex-col min-h-0 border-r border-[#2a2e39]">
            <div className="px-3 py-1.5 text-xs text-[#787b86] border-b border-[#2a2e39] bg-[#1e222d]">
              script.py
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full p-4 font-mono text-sm bg-[#131722] text-[#d1d4dc] resize-none outline-none leading-relaxed scrollbar-thin"
              style={{ tabSize: 2 }}
            />
          </div>
          <div className="flex flex-col min-h-0">
            <div className="px-3 py-1.5 text-xs text-[#787b86] border-b border-[#2a2e39] bg-[#1e222d]">
              Output
            </div>
            <pre className="flex-1 p-4 font-mono text-xs text-[#26a69a] bg-[#0d1117] overflow-auto scrollbar-thin whitespace-pre-wrap">
              {output || '# Click "Run Script" to execute your Python code and generate a signal.'}
            </pre>
          </div>
        </div>

        <div className="px-4 py-2 border-t border-[#2a2e39] text-[10px] text-[#787b86] shrink-0">
          Available: <code className="text-[#2962ff]">df</code>, <code className="text-[#2962ff]">indicators</code>, <code className="text-[#2962ff]">pandas</code>, <code className="text-[#2962ff]">numpy</code> — set <code className="text-[#2962ff]">result</code> dict to return signal.
        </div>
      </div>
    </>
  );
}
