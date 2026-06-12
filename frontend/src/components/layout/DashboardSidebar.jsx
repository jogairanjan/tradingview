import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Radio, User, Settings, CreditCard, TrendingUp, X, Code2,
  ScanSearch, Bell, LineChart, LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Charts', end: true },
  { to: '/scanner', icon: ScanSearch, label: 'Scanner' },
  { to: '/signals', icon: Radio, label: 'Signals' },
  { to: '/strategy', icon: LineChart, label: 'Strategy' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/python-engine', icon: Code2, label: 'Script Editor' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/subscription', icon: CreditCard, label: 'Subscription' },
];

export default function DashboardSidebar({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose?.();
    await logout();
    navigate('/login');
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          role="presentation"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-[60] w-64 flex flex-col border-r border-[#2a2e39] bg-[#1e222d] transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm gradient-text">TradeSignal</span>
          </div>
          <button type="button" onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-accent-rose hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
