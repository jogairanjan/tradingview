import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, BarChart3 } from 'lucide-react';
import Button from '../ui/Button';
import TradingChart from '../charts/TradingChart';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-600/10 via-transparent to-transparent pointer-events-none" />
      <motion.div
        className="absolute top-20 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-brand-300 mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Trading Signals
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
            >
              Trade smarter with{' '}
              <span className="gradient-text">institutional-grade</span> signals
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg text-slate-400 max-w-xl"
            >
              Real-time BUY/SELL alerts, confidence scoring, and pro charts — built for traders who demand an edge.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link to="/register">
                <Button size="lg" icon={ArrowRight}>Start Free</Button>
              </Link>
              <Link to="/pricing">
                <Button variant="secondary" size="lg" icon={BarChart3}>View Plans</Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex gap-8 text-sm text-slate-500"
            >
              <div><span className="text-2xl font-bold text-slate-200">72%</span><br />Win Rate</div>
              <div><span className="text-2xl font-bold text-slate-200">50K+</span><br />Signals Sent</div>
              <div><span className="text-2xl font-bold text-slate-200">200+</span><br />Trading Pairs</div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative"
          >
            <TradingChart height={360} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
