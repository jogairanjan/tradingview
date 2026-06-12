import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import { setUser } from '../../store/slices/authSlice';
import { unwrapApi } from '../../utils/api';
import { setTokens } from '../../utils/authStorage';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.login(form);
      const { accessToken, refreshToken, user } = unwrapApi(res);
      setTokens(accessToken, refreshToken);
      dispatch(setUser(user));
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Login — TradeSignal AI</title></Helmet>
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-100 text-center">Welcome back</h1>
        <p className="text-center text-slate-400 text-sm mt-1">Sign in to your account</p>
        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} icon={Mail} />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} icon={Lock} />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-brand-400 hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" loading={loading} className="w-full">Sign In</Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-400">
            No account? <Link to="/register" className="text-brand-400 hover:underline">Register</Link>
          </p>
        </Card>
      </div>
    </>
  );
}
