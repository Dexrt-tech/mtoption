'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to change password'); return; }
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm" style={{ color: '#62748e' }}>Manage your admin account</p>
      </div>

      <div className="max-w-lg">
        <div className="card">
          <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: '#1d222b' }}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'rgba(255,106,94,0.12)', border: '1px solid rgba(255,106,94,0.25)' }}>
              <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Change Password</p>
              <p className="text-xs" style={{ color: '#62748e' }}>Update your admin account password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {[
              { label: 'Current Password', value: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
              { label: 'New Password', value: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(v => !v) },
              { label: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(v => !v) },
            ].map(({ label, value, set, show, toggle }) => (
              <div key={label}>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#a1a1aa' }}>{label}</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#62748e' }} />
                  <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    required
                    className="input-field w-full pl-9 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-white"
                    style={{ color: '#62748e' }}
                  >
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="btn-primary w-full mt-2 disabled:opacity-50"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
