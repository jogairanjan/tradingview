import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Radio, TrendingUp, Shield,
} from 'lucide-react';
import { cn } from '../../utils/cn';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/signals', icon: Radio, label: 'Signals' },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 flex flex-col border-r border-white/10 bg-surface-800 min-h-screen">
      <div className="flex items-center gap-2 p-4 border-b border-white/10">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-accent-rose">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-semibold text-sm text-slate-100">Admin Panel</span>
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> TradeSignal
          </p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
