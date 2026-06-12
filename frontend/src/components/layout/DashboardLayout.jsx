import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, LayoutGrid, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { useAlertEngine } from '../../hooks/useAlertEngine';
import DashboardSidebar from './DashboardSidebar';
import ThemeToggle from '../ui/ThemeToggle';
import SearchBar from '../ui/SearchBar';
import Badge from '../ui/Badge';
import { cn } from '../../utils/cn';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [notifications] = useState(3);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  const location = useLocation();
  const isTerminal = ['/dashboard', '/scanner', '/strategy', '/alerts', '/python-engine'].includes(location.pathname);
  useSocket(true);
  useAlertEngine(true);

  return (
    <div className={cn('min-h-screen flex', isTerminal ? 'h-screen overflow-hidden bg-[#131722]' : 'bg-surface-900')}>
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header
          className={cn(
            'z-30 flex items-center gap-3 px-3 py-2 shrink-0',
            isTerminal
              ? 'border-b border-[#2a2e39] bg-[#1e222d]'
              : 'sticky top-0 border-b border-white/10 bg-surface-900/90 backdrop-blur-xl px-4 py-3'
          )}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className={cn('p-2 rounded', isTerminal ? 'hover:bg-[#2a2e39] text-[#787b86]' : 'lg:hidden glass')}
            title={isTerminal ? 'Menu' : 'Open sidebar'}
          >
            {isTerminal ? <LayoutGrid className="w-4 h-4" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className={cn('flex-1 max-w-sm', isTerminal && 'max-w-md')}>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search symbol..."
              className={isTerminal ? 'bg-[#131722] border-[#2a2e39] text-[#d1d4dc]' : ''}
            />
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <button
              type="button"
              className={cn(
                'relative p-2 rounded',
                isTerminal ? 'hover:bg-[#2a2e39] text-[#787b86]' : 'glass hover:bg-white/10'
              )}
            >
              <Bell className="w-4 h-4" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ef5350]" />
              )}
            </button>
            {!isTerminal && <ThemeToggle />}
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className={cn(
                'p-2 rounded',
                isTerminal ? 'hover:bg-[#2a2e39] text-[#787b86] hover:text-[#ef5350]' : 'glass hover:bg-white/10 text-slate-400 hover:text-accent-rose'
              )}
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className={cn(
                'flex items-center gap-2 pl-1 pr-2 py-1 rounded',
                isTerminal ? 'hover:bg-[#2a2e39]' : 'glass hover:bg-white/10'
              )}
            >
              <div className="w-7 h-7 rounded bg-[#2962ff] flex items-center justify-center text-[10px] font-bold text-white">
                {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              {!isTerminal && (
                <span className="hidden md:block text-sm text-slate-300">
                  {user?.first_name || user?.email?.split('@')[0] || 'Trader'}
                </span>
              )}
              {user?.plan && !isTerminal && <Badge variant="brand" className="hidden lg:inline-flex">{user.plan}</Badge>}
            </button>
          </div>
        </header>
        <main
          className={cn(
            'flex-1 min-h-0',
            isTerminal ? 'overflow-hidden' : 'p-4 lg:p-6 overflow-auto'
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
