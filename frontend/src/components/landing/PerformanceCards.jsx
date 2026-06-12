import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock } from 'lucide-react';
import Card from '../ui/Card';

const stats = [
  { icon: TrendingUp, label: 'Avg. Monthly Return', value: '+18.4%', color: 'text-accent-emerald' },
  { icon: Target, label: 'Signal Accuracy', value: '78.2%', color: 'text-brand-400' },
  { icon: Clock, label: 'Avg. Hold Time', value: '4.2h', color: 'text-cyan-400' },
];

export default function PerformanceCards() {
  return (
    <section className="py-16 bg-surface-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="text-center">
                <s.icon className={`w-8 h-8 mx-auto mb-3 ${s.color}`} />
                <p className={`text-3xl font-bold font-mono ${s.color}`}>{s.value}</p>
                <p className="mt-2 text-sm text-slate-400">{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
