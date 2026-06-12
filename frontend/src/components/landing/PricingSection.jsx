import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { pricingPlans } from '../../utils/mockData';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { cn } from '../../utils/cn';

export default function PricingSection({ showAllLink }) {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text">Simple, transparent pricing</h2>
          <p className="mt-4 text-slate-400">Start free. Upgrade when you are ready.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={cn(
                  'h-full flex flex-col relative',
                  plan.popular && 'border-brand-500/40 ring-1 ring-brand-500/20'
                )}
              >
                {plan.popular && (
                  <Badge variant="brand" className="absolute -top-2.5 left-1/2 -translate-x-1/2">Most Popular</Badge>
                )}
                <h3 className="text-xl font-semibold text-slate-100">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-slate-100">${plan.price}</span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-accent-emerald shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button variant={plan.popular ? 'primary' : 'secondary'} className="w-full">
                    {plan.price === 0 ? 'Get Started' : 'Subscribe'}
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
        {showAllLink && (
          <p className="text-center mt-8 text-sm text-slate-500">
            <Link to="/pricing" className="text-brand-400 hover:underline">Compare all features →</Link>
          </p>
        )}
      </div>
    </section>
  );
}
