import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';
import SignalCard from '../signals/SignalCard';
import { mockSignals } from '../../utils/mockData';

export default function AiShowcase() {
  const featured = mockSignals[0];

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-brand-400 text-sm font-medium mb-4">
              <Cpu className="w-4 h-4" />
              Neural Signal Engine
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
              AI that reads the market like a pro desk
            </h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Our models analyze order flow, momentum, and multi-timeframe structure to deliver
              high-conviction BUY and SELL signals with transparent confidence scores.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {['LSTM + transformer ensemble', 'Backtested on 5 years of data', 'Updated every 15 minutes'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <SignalCard signal={featured} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
