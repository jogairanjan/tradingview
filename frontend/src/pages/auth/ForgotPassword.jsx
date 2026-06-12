import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      sessionStorage.setItem('resetEmail', email);
      setSent(true);
      toast.success('OTP sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Forgot Password — TradeSignal AI</title></Helmet>
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-100 text-center">Reset password</h1>
        <Card className="mt-8">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-slate-300 text-sm">Check your email for a 6-digit OTP code.</p>
              <Link to="/verify-otp"><Button className="w-full">Enter OTP</Button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} icon={Mail} />
              <Button type="submit" loading={loading} className="w-full">Send OTP</Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-slate-400">
            <Link to="/login" className="text-brand-400 hover:underline">Back to login</Link>
          </p>
        </Card>
      </div>
    </>
  );
}
