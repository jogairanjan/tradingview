import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { mockTestimonials } from '../../utils/mockData';
import Card from '../ui/Card';

export default function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-surface-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">Trusted by traders worldwide</h2>
          <p className="mt-4 text-slate-400">Join thousands who rely on TradeSignal every day.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockTestimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full flex flex-col">
                <Quote className="w-8 h-8 text-brand-500/30 mb-3" />
                <p className="text-sm text-slate-300 flex-1">&ldquo;{t.content}&rdquo;</p>
                <div className="flex gap-0.5 mt-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
