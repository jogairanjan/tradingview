import api from './axios';

const PYTHON_URL = import.meta.env.VITE_PYTHON_URL || 'http://localhost:8000';

export const pythonApi = {
  getScript: () => api.get('/python/script'),
  saveScript: (code) => api.put('/python/script', { code }),
  runScript: (payload) => api.post('/python/run', payload),
  testEngine: () => fetch(`${PYTHON_URL}/health`).then((r) => r.json()),
  runOnEngine: (code, symbol, timeframe) =>
    fetch(`${PYTHON_URL}/api/custom-script/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, symbol, timeframe }),
    }).then((r) => r.json()),
};
