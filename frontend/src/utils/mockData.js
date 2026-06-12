export const mockTickers = [
  { symbol: 'BTC/USDT', price: 67234.5, change: 2.34, volume: '2.1B', open: 65800, high: 68100, low: 65200 },
  { symbol: 'ETH/USDT', price: 3456.78, change: -1.12, volume: '890M', open: 3495, high: 3520, low: 3420 },
  { symbol: 'SOL/USDT', price: 178.92, change: 5.67, volume: '420M', open: 169, high: 182, low: 167 },
  { symbol: 'BNB/USDT', price: 612.45, change: 0.89, volume: '310M', open: 608, high: 618, low: 605 },
  { symbol: 'XRP/USDT', price: 0.6234, change: -0.45, volume: '280M', open: 0.626, high: 0.631, low: 0.618 },
  { symbol: 'ADA/USDT', price: 0.5123, change: 1.23, volume: '150M', open: 0.506, high: 0.518, low: 0.502 },
  { symbol: 'AVAX/USDT', price: 42.18, change: 3.45, volume: '120M', open: 40.7, high: 43.1, low: 40.2 },
  { symbol: 'DOT/USDT', price: 8.92, change: -2.1, volume: '95M', open: 9.11, high: 9.2, low: 8.85 },
];

export const mockSignals = [
  { id: '1', pair: 'BTC/USDT', type: 'BUY', confidence: 87, entry: 66800, target: 69500, stopLoss: 65200, timeframe: '4H', createdAt: new Date().toISOString() },
  { id: '2', pair: 'ETH/USDT', type: 'SELL', confidence: 72, entry: 3480, target: 3200, stopLoss: 3580, timeframe: '1H', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', pair: 'SOL/USDT', type: 'BUY', confidence: 91, entry: 175, target: 195, stopLoss: 168, timeframe: '15m', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', pair: 'BNB/USDT', type: 'BUY', confidence: 65, entry: 608, target: 640, stopLoss: 595, timeframe: '1D', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '5', pair: 'XRP/USDT', type: 'SELL', confidence: 78, entry: 0.63, target: 0.58, stopLoss: 0.65, timeframe: '4H', createdAt: new Date(Date.now() - 172800000).toISOString() },
];

export const mockTestimonials = [
  { id: 1, name: 'Sarah Chen', role: 'Day Trader', avatar: 'SC', content: 'TradeSignal AI cut my analysis time in half. The confidence scores are remarkably accurate.', rating: 5 },
  { id: 2, name: 'Marcus Williams', role: 'Crypto Investor', avatar: 'MW', content: 'Best signal platform I have used. Clean UI and real-time alerts keep me ahead of the market.', rating: 5 },
  { id: 3, name: 'Elena Rodriguez', role: 'Swing Trader', avatar: 'ER', content: 'The AI predictions combined with technical levels give me conviction on every trade.', rating: 4 },
  { id: 4, name: 'James Okonkwo', role: 'Fund Manager', avatar: 'JO', content: 'We integrated TradeSignal into our desk workflow. ROI on subscription paid for itself in week one.', rating: 5 },
];

const BASE_PRICES = { 'BTC/USDT': 65000, 'ETH/USDT': 3400, 'SOL/USDT': 175, 'BNB/USDT': 610 };

export const mockChartData = (count = 100, symbol = 'BTC/USDT') => {
  const data = [];
  let price = BASE_PRICES[symbol] || 1000;
  const now = Math.floor(Date.now() / 1000);
  const interval = symbol.includes('BTC') ? 3600 : 900;
  for (let i = count; i >= 0; i--) {
    const open = price;
    const change = (Math.random() - 0.48) * 800;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 200;
    const low = Math.min(open, close) - Math.random() * 200;
    data.push({ time: now - i * interval, open, high, low, close });
    price = close;
  }
  return data;
};

export const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', plan: 'Pro', status: 'active', joinedAt: '2025-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', plan: 'Free', status: 'active', joinedAt: '2025-02-20' },
  { id: '3', name: 'Admin User', email: 'admin@tradesignal.ai', role: 'admin', plan: 'Enterprise', status: 'active', joinedAt: '2024-11-01' },
];

export const pricingPlans = [
  { id: 'free', name: 'Starter', price: 0, period: 'forever', features: ['5 signals/day', 'Basic chart', 'Email alerts'], popular: false },
  { id: 'pro', name: 'Pro', price: 49, period: '/month', features: ['Unlimited signals', 'AI confidence scores', 'Real-time WebSocket', 'Priority support'], popular: true },
  { id: 'enterprise', name: 'Enterprise', price: 199, period: '/month', features: ['API access', 'Custom pairs', 'Dedicated analyst', 'SLA guarantee'], popular: false },
];

export const faqItems = [
  { q: 'How accurate are the AI signals?', a: 'Our models achieve 72-85% historical accuracy on major pairs, with confidence scores reflecting real-time model certainty.' },
  { q: 'Can I use TradeSignal on mobile?', a: 'Yes. The platform is fully responsive and works on all modern browsers and devices.' },
  { q: 'What markets do you support?', a: 'We cover crypto, forex, and major indices with 200+ trading pairs and growing.' },
  { q: 'Is there a free trial?', a: 'The Starter plan is free forever. Pro includes a 7-day trial with full feature access.' },
  { q: 'How do I cancel my subscription?', a: 'Cancel anytime from Settings > Subscription. Access continues until the end of your billing period.' },
];
