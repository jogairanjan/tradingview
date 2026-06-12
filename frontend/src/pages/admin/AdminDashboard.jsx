import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Users, Radio, DollarSign, Activity } from 'lucide-react';
import { adminApi } from '../../api/admin';
import Card, { CardTitle } from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';

const defaultStats = [
  { label: 'Total Users', value: '12,450', icon: Users, color: 'text-brand-400' },
  { label: 'Active Signals', value: '847', icon: Radio, color: 'text-accent-emerald' },
  { label: 'Revenue (MTD)', value: '$48.2K', icon: DollarSign, color: 'text-amber-400' },
  { label: 'API Uptime', value: '99.9%', icon: Activity, color: 'text-cyan-400' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.dashboard()
      .then((res) => {
        const d = res.data;
        if (d) {
          setStats([
            { label: 'Total Users', value: d.users?.toLocaleString?.() ?? d.users ?? '—', icon: Users, color: 'text-brand-400' },
            { label: 'Active Signals', value: d.signals?.toLocaleString?.() ?? d.signals ?? '—', icon: Radio, color: 'text-accent-emerald' },
            { label: 'Revenue (MTD)', value: d.revenue ?? '—', icon: DollarSign, color: 'text-amber-400' },
            { label: 'API Uptime', value: d.uptime ?? '99.9%', icon: Activity, color: 'text-cyan-400' },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet><title>Admin Dashboard — TradeSignal AI</title></Helmet>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
            : stats.map((s) => (
              <Card key={s.label}>
                <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{s.value}</p>
              </Card>
            ))}
        </div>
        <Card>
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-slate-400 mt-2">Manage users and signals from the sidebar navigation.</p>
        </Card>
      </div>
    </>
  );
}
