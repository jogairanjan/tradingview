import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardTitle, CardDescription } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { Mail, Calendar, Shield } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  return (
    <>
      <Helmet><title>Profile — TradeSignal AI</title></Helmet>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">Profile</h1>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">{user?.name || 'Trader'}</h2>
              <p className="text-slate-400 text-sm flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user?.email || '—'}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="brand">{user?.plan || 'Free'}</Badge>
                {user?.role === 'admin' && <Badge variant="warning">Admin</Badge>}
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Manage your personal information</CardDescription>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500 flex items-center gap-1"><Calendar className="w-4 h-4" /> Member since</dt><dd className="text-slate-200">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 flex items-center gap-1"><Shield className="w-4 h-4" /> Role</dt><dd className="text-slate-200 capitalize">{user?.role || 'user'}</dd></div>
          </dl>
          <Link to="/settings" className="inline-block mt-6">
            <Button variant="secondary" size="sm">Edit Settings</Button>
          </Link>
        </Card>
      </div>
    </>
  );
}
