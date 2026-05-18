'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PlusCircle, Trash2, Edit3, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Plan {
  _id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  roiPercent: number;
  bonusPercent: number;
  durationDays: number;
  description: string;
  features: string[];
  isActive: boolean;
}

const DEFAULT_FORM = {
  name: '', minAmount: '', maxAmount: '', roiPercent: '',
  bonusPercent: '0', durationDays: '', description: '', features: '', isActive: true,
};

const COLORS = ['#ff6a5e', '#f7931a', '#627eea', '#26a17b', '#f59e0b'];

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);

  const fetchPlans = () => {
    fetch('/api/admin/plans').then(r => r.json()).then(d => { if (d.plans) setPlans(d.plans); });
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const body = {
      name: form.name,
      minAmount: parseFloat(form.minAmount),
      maxAmount: parseFloat(form.maxAmount),
      roiPercent: parseFloat(form.roiPercent),
      bonusPercent: parseFloat(form.bonusPercent) || 0,
      durationDays: parseInt(form.durationDays),
      description: form.description,
      features: form.features.split('\n').filter(f => f.trim()),
      isActive: form.isActive,
      ...(editingId && { planId: editingId }),
    };
    const res = await fetch('/api/admin/plans', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(editingId ? 'Plan updated' : 'Plan created');
      setShowForm(false); setEditingId(null); setForm(DEFAULT_FORM); fetchPlans();
    } else toast.error(data.error);
    setLoading(false);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Delete this plan?')) return;
    const res = await fetch('/api/admin/plans', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    if (res.ok) { toast.success('Plan deleted'); fetchPlans(); }
  };

  const startEdit = (plan: Plan) => {
    setEditingId(plan._id);
    setForm({
      name: plan.name, minAmount: plan.minAmount.toString(), maxAmount: plan.maxAmount.toString(),
      roiPercent: plan.roiPercent.toString(), bonusPercent: (plan.bonusPercent || 0).toString(),
      durationDays: plan.durationDays.toString(),
      description: plan.description, features: plan.features?.join('\n') || '', isActive: plan.isActive,
    });
    setShowForm(true);
  };

  const labelStyle = { color: '#62748e' };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Investment Plans</h1>
          <p className="text-sm" style={labelStyle}>{plans.length} plans configured</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(DEFAULT_FORM); }} className="btn-primary">
          <PlusCircle size={16} /> New Plan
        </button>
      </div>

      {showForm && (
        <div className="card mb-8 p-6">
          <h2 className="mb-5 font-bold text-white">{editingId ? 'Edit Plan' : 'Create New Plan'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium" style={labelStyle}>Plan Name</label>
              <input className="input-field" placeholder="e.g. Starter Plan" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" style={labelStyle}>ROI % (total return)</label>
              <input className="input-field" type="number" placeholder="e.g. 15" value={form.roiPercent} onChange={e => setForm({...form, roiPercent: e.target.value})} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" style={labelStyle}>Bonus % (added on top of ROI)</label>
              <input className="input-field" type="number" placeholder="e.g. 5" min="0" value={form.bonusPercent} onChange={e => setForm({...form, bonusPercent: e.target.value})} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" style={labelStyle}>Min Amount ($)</label>
              <input className="input-field" type="number" placeholder="100" value={form.minAmount} onChange={e => setForm({...form, minAmount: e.target.value})} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" style={labelStyle}>Max Amount ($)</label>
              <input className="input-field" type="number" placeholder="5000" value={form.maxAmount} onChange={e => setForm({...form, maxAmount: e.target.value})} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" style={labelStyle}>Duration (days)</label>
              <input className="input-field" type="number" placeholder="30" value={form.durationDays} onChange={e => setForm({...form, durationDays: e.target.value})} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" style={labelStyle}>Active</label>
              <select className="input-field" value={form.isActive ? 'true' : 'false'} onChange={e => setForm({...form, isActive: e.target.value === 'true'})}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium" style={labelStyle}>Description</label>
              <input className="input-field" placeholder="Brief description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium" style={labelStyle}>Features (one per line)</label>
              <textarea className="input-field min-h-[80px] resize-y" placeholder={'Auto-compounding\nPriority withdrawals\n24/7 support'} value={form.features} onChange={e => setForm({...form, features: e.target.value})} />
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving...' : editingId ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan, i) => {
          const color = COLORS[i % COLORS.length];
          return (
            <div key={plan._id} className={`card p-6 ${!plan.isActive ? 'opacity-50' : ''}`}>
              <div className="mb-3 flex items-start justify-between">
                <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: `${color}15`, color }}>
                  {plan.name}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(plan)} className="transition-colors hover:text-white" style={{ color: '#62748e' }}><Edit3 size={15} /></button>
                  <button onClick={() => handleDelete(plan._id)} className="text-red-400 transition-colors hover:text-red-300"><Trash2 size={15} /></button>
                </div>
              </div>
              <p className="mb-1 text-4xl font-black" style={{ color }}>{plan.roiPercent}%</p>
              <p className="mb-1 text-xs" style={{ color: '#62748e' }}>ROI over {plan.durationDays} days</p>
              {plan.bonusPercent > 0 && (
                <p className="mb-3 text-xs font-semibold" style={{ color: '#22c55e' }}>+{plan.bonusPercent}% Bonus</p>
              )}
              <div className="space-y-1.5 border-t pt-3 text-sm" style={{ borderColor: '#1d222b' }}>
                <div className="flex justify-between">
                  <span style={{ color: '#62748e' }}>Min</span>
                  <span className="text-white">${plan.minAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#62748e' }}>Max</span>
                  <span className="text-white">${plan.maxAmount.toLocaleString()}</span>
                </div>
              </div>
              {plan.features?.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs" style={{ color: '#62748e' }}>
                      <CheckCircle size={10} style={{ color }} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {plans.length === 0 && (
          <div className="card p-12 text-center md:col-span-3">
            <p className="mb-4" style={{ color: '#62748e' }}>No plans yet. Create your first investment plan.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <PlusCircle size={16} /> Create Plan
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
