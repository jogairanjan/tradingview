import { motion } from 'framer-motion';
import { Brain, Zap, Shield, LineChart, Bell, Globe } from 'lucide-react';
import Card from '../ui/Card';

const features = [
  { icon: Brain, title: 'AI Confidence Scores', desc: 'Every signal includes a model confidence meter so you know when to size up.' },
  { icon: Zap, title: 'Real-Time WebSocket', desc: 'Sub-second delivery of signals and market ticks directly to your dashboard.' },
  { icon: LineChart, title: 'Pro Charts', desc: 'TradingView-quality candlestick charts powered by lightweight-charts.' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Push, email, and in-app notifications for entries, targets, and stops.' },
  { icon: Shield, title: 'Risk Management', desc: 'Built-in stop-loss and take-profit levels on every signal.' },
  { icon: Globe, title: '200+ Pairs', desc: 'Crypto, forex, and indices — one platform for all your markets.' },
];

export default function Features() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text">Everything you need to win</h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">Professional tools without the institutional price tag.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card hover className="h-full">
                <div className="p-2.5 w-fit rounded-xl bg-brand-500/15 text-brand-400 mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
