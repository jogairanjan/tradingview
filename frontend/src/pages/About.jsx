import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Target, Users, Award } from 'lucide-react';
import Card from '../components/ui/Card';

const values = [
  { icon: Target, title: 'Precision', desc: 'Every signal is backed by rigorous backtesting and live performance tracking.' },
  { icon: Users, title: 'Community', desc: 'Built with feedback from 10,000+ active traders across global markets.' },
  { icon: Award, title: 'Transparency', desc: 'Open confidence scores and historical accuracy — no black boxes.' },
];

export default function About() {
  return (
    <>
      <Helmet>
        <title>About — TradeSignal AI</title>
        <meta name="description" content="Learn about TradeSignal AI and our mission to democratize institutional trading tools." />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 py-16 lg:py-24">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold gradient-text"
        >
          About TradeSignal
        </motion.h1>
        <p className="mt-6 text-lg text-slate-400 leading-relaxed">
          We started TradeSignal to level the playing field. Retail traders deserve the same
          AI-driven edge that hedge funds have used for years — without six-figure subscriptions.
        </p>
        <p className="mt-4 text-slate-400 leading-relaxed">
          Our team combines quant researchers, ML engineers, and veteran traders to deliver
          signals you can trust, on a platform you will love using.
        </p>
        <div className="grid sm:grid-cols-3 gap-6 mt-12">
          {values.map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="text-center h-full">
                <v.icon className="w-8 h-8 mx-auto text-brand-400 mb-3" />
                <h3 className="font-semibold text-slate-100">{v.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{v.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
