import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Bell, Lock, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import Card, { CardTitle } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/ui/ThemeToggle';

export default function Settings() {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, push: true, signals: true });

  const handlePasswordChange = async (ev) => {
    ev.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword: passwords.current, newPassword: passwords.new });
      toast.success('Password updated');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Settings — TradeSignal AI</title></Helmet>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-brand-400" />
              <CardTitle className="!mb-0">Appearance</CardTitle>
            </div>
            <ThemeToggle />
          </div>
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-brand-400" /> Notifications</CardTitle>
          <div className="mt-4 space-y-3">
            {Object.entries(notifications).map(([key, val]) => (
              <label key={key} className="flex items-center justify-between text-sm text-slate-300 capitalize">
                {key} alerts
                <input
                  type="checkbox"
                  checked={val}
                  onChange={() => setNotifications({ ...notifications, [key]: !val })}
                  className="w-4 h-4 rounded accent-brand-500"
                />
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-brand-400" /> Change Password</CardTitle>
          <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
            <Input label="Current Password" type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} icon={Lock} />
            <Input label="New Password" type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} icon={Lock} />
            <Input label="Confirm Password" type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} icon={Lock} />
            <Button type="submit" loading={loading}>Update Password</Button>
          </form>
        </Card>
      </div>
    </>
  );
}
