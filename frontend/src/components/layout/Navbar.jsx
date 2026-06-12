import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, TrendingUp, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-surface-900/80 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">TradeSignal</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'text-brand-400 bg-brand-500/10' : 'text-slate-400 hover:text-slate-100'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} icon={LayoutDashboard}>
                  Dashboard
                </Button>
                <Button variant="secondary" size="sm" onClick={handleLogout} icon={LogOut}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
                <Button size="sm" onClick={() => navigate('/register')}>Get Started</Button>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button type="button" onClick={() => setOpen(!open)} className="p-2 rounded-lg glass">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-white/10"
            >
              <div className="py-4 space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5"
                  >
                    {link.label}
                  </NavLink>
                ))}
                {isAuthenticated ? (
                  <>
                    <button type="button" onClick={() => { setOpen(false); navigate('/dashboard'); }} className="w-full text-left px-3 py-2 text-slate-300">Dashboard</button>
                    <button type="button" onClick={handleLogout} className="w-full text-left px-3 py-2 text-accent-rose">Logout</button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => { setOpen(false); navigate('/login'); }} className="w-full text-left px-3 py-2 text-slate-300">Login</button>
                    <button type="button" onClick={() => { setOpen(false); navigate('/register'); }} className="w-full text-left px-3 py-2 text-brand-400">Get Started</button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
