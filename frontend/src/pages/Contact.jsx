import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.message.trim()) e.message = 'Message is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Message sent! We will reply within 24 hours.');
    setForm({ name: '', email: '', message: '' });
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Contact — TradeSignal AI</title>
      </Helmet>
      <div className="max-w-xl mx-auto px-4 py-16 lg:py-24">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-slate-100">
          Get in touch
        </motion.h1>
        <p className="mt-2 text-slate-400">We typically respond within one business day.</p>
        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} icon={MessageSquare} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} icon={Mail} />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                className="w-full rounded-xl bg-surface-700/80 border border-white/10 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
              {errors.message && <p className="mt-1 text-xs text-accent-rose">{errors.message}</p>}
            </div>
            <Button type="submit" loading={loading} icon={Send} className="w-full">Send Message</Button>
          </form>
        </Card>
      </div>
    </>
  );
}
