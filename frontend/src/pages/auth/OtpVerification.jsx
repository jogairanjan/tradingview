import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function OtpVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const email = sessionStorage.getItem('resetEmail') || '';

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter the full 6-digit code'); return; }
    setLoading(true);
    try {
      await authApi.verifyOtp({ email, otp: code });
      sessionStorage.setItem('resetOtp', code);
      toast.success('OTP verified');
      navigate('/reset-password');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Verify OTP — TradeSignal AI</title></Helmet>
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-100 text-center">Enter OTP</h1>
        <p className="text-center text-slate-400 text-sm mt-1">6-digit code sent to your email</p>
        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-12 text-center text-lg font-mono rounded-xl bg-surface-700 border border-white/10 focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                />
              ))}
            </div>
            <Button type="submit" loading={loading} className="w-full">Verify</Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-400">
            <Link to="/forgot-password" className="text-brand-400 hover:underline">Resend code</Link>
          </p>
        </Card>
      </div>
    </>
  );
}
