import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { Shield, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import { setUser } from '../../store/slices/authSlice';
import { unwrapApi } from '../../utils/api';
import { setTokens, clearAuthTokens } from '../../utils/authStorage';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function AdminLogin() {
  const [form, setForm] = useState({
    email: 'admin@tradingview.local',
    password: 'Admin@123456',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      const { accessToken, refreshToken, user } = unwrapApi(res);
      if (user?.role !== 'admin') {
        toast.error('Admin access required. Use the admin account.');
        clearAuthTokens();
        return;
      }
      setTokens(accessToken, refreshToken);
      dispatch(setUser(user));
      toast.success('Admin login successful');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 px-4">
      <Helmet><title>Admin Login — TradeSignal AI</title></Helmet>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-accent-rose">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">Admin Portal</h1>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} icon={Mail} />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} icon={Lock} />
            <Button type="submit" loading={loading} className="w-full">Sign In</Button>
          </form>
          <p className="mt-4 text-xs text-slate-500 text-center">
            Dev admin: admin@tradingview.local / Admin@123456
          </p>
        </Card>
      </div>
    </div>
  );
}
