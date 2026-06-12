import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { mockSignals } from '../../utils/mockData';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

export default function SignalManagement() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ pair: '', type: 'BUY', confidence: 80, entry: '', target: '', stopLoss: '' });

  const load = () => {
    setLoading(true);
    adminApi.signals({ limit: 50 })
      .then((res) => setSignals(res.data.signals || res.data))
      .catch(() => setSignals(mockSignals))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (ev) => {
    ev.preventDefault();
    try {
      await adminApi.createSignal({
        ...form,
        confidence: Number(form.confidence),
        entry: Number(form.entry),
        target: Number(form.target),
        stopLoss: Number(form.stopLoss),
      });
      toast.success('Signal created');
      setModalOpen(false);
      load();
    } catch {
      toast.error('Failed to create signal');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this signal?')) return;
    try {
      await adminApi.deleteSignal(id);
      toast.success('Signal deleted');
      setSignals((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  const columns = [
    { key: 'pair', label: 'Pair' },
    { key: 'type', label: 'Type', render: (r) => <Badge variant={r.type === 'BUY' ? 'buy' : 'sell'}>{r.type}</Badge> },
    { key: 'confidence', label: 'Confidence', render: (r) => `${r.confidence}%` },
    { key: 'entry', label: 'Entry' },
    { key: 'timeframe', label: 'TF' },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
          <Trash2 className="w-4 h-4 text-accent-rose" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Signals — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Signal Management</h1>
          <Button icon={Plus} onClick={() => setModalOpen(true)}>New Signal</Button>
        </div>
        <DataTable columns={columns} data={signals} loading={loading} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Signal">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Pair" value={form.pair} onChange={(e) => setForm({ ...form, pair: e.target.value })} placeholder="BTC/USDT" />
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-xl bg-surface-700 border border-white/10 px-4 py-2 text-sm text-slate-100"
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
          <Input label="Confidence %" type="number" value={form.confidence} onChange={(e) => setForm({ ...form, confidence: e.target.value })} />
          <Input label="Entry" type="number" value={form.entry} onChange={(e) => setForm({ ...form, entry: e.target.value })} />
          <Input label="Target" type="number" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
          <Input label="Stop Loss" type="number" value={form.stopLoss} onChange={(e) => setForm({ ...form, stopLoss: e.target.value })} />
          <Button type="submit" className="w-full">Create</Button>
        </form>
      </Modal>
    </>
  );
}
