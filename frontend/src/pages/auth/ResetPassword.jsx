import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function ResetPassword() {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.password || form.password.length < 8) e.password = 'Min. 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.resetPassword({
        email: sessionStorage.getItem('resetEmail'),
        otp: sessionStorage.getItem('resetOtp'),
        password: form.password,
      });
      sessionStorage.removeItem('resetEmail');
      sessionStorage.removeItem('resetOtp');
      toast.success('Password updated!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Reset Password — TradeSignal AI</title></Helmet>
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-100 text-center">New password</h1>
        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="New Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} icon={Lock} />
            <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} error={errors.confirmPassword} icon={Lock} />
            <Button type="submit" loading={loading} className="w-full">Update Password</Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-400">
            <Link to="/login" className="text-brand-400 hover:underline">Back to login</Link>
          </p>
        </Card>
      </div>
    </>
  );
}
