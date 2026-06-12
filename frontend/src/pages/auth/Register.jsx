import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import { setUser } from '../../store/slices/authSlice';
import { setTokens } from '../../utils/authStorage';
import { unwrapApi } from '../../utils/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.register({ name: form.name, email: form.email, password: form.password });
      const { accessToken, refreshToken, user } = unwrapApi(res);
      setTokens(accessToken, refreshToken);
      dispatch(setUser(user));
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Register — TradeSignal AI</title></Helmet>
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-100 text-center">Create account</h1>
        <p className="text-center text-slate-400 text-sm mt-1">Start trading with AI signals</p>
        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} icon={User} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} icon={Mail} />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} icon={Lock} hint="Min. 8 characters" />
            <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} error={errors.confirmPassword} icon={Lock} />
            <Button type="submit" loading={loading} className="w-full">Create Account</Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-400">
            Have an account? <Link to="/login" className="text-brand-400 hover:underline">Sign in</Link>
          </p>
        </Card>
      </div>
    </>
  );
}
