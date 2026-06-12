import { Link } from 'react-router-dom';
import { TrendingUp, Share2, Code2, Link2 } from 'lucide-react';

const links = {
  Product: [
    { to: '/pricing', label: 'Pricing' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/signals', label: 'Signals' },
  ],
  Company: [
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ],
  Legal: [
    { to: '#', label: 'Privacy' },
    { to: '#', label: 'Terms' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold gradient-text">TradeSignal</span>
            </Link>
            <p className="text-sm text-slate-400 mb-4">AI-powered trading signals for the modern trader.</p>
            <div className="flex gap-3">
              {[Share2, Code2, Link2].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg glass hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-slate-200 mb-3">{title}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-sm text-slate-400 hover:text-brand-400 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} TradeSignal AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
