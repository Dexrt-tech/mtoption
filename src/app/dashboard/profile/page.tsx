'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  User, CreditCard, Shield, Settings, Lock, Bell, Eye, EyeOff,
  Plus, Pencil, Camera, Bitcoin, Building2, Trash2, ChartPie,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  referralCode: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalEarnings: number;
  isVerified: boolean;
  createdAt: string;
}

interface WalletAccount {
  id: number;
  type: 'crypto' | 'bank';
  name: string;
  address?: string;
  currency?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountType?: string;
  bankName?: string;
}

type Tab = 'personal' | 'accounts' | 'security' | 'settings';

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function AddAccountForm({ onAdd, onClose }: {
  onAdd: (a: Omit<WalletAccount, 'id'>) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<'crypto' | 'bank'>('crypto');
  const [form, setForm] = useState({
    name: '', address: '', currency: 'BTC',
    bankName: '', accountNumber: '', routingNumber: '', accountType: 'Checking',
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (type === 'crypto') {
      onAdd({ type: 'crypto', name: form.name, address: form.address, currency: form.currency });
    } else {
      onAdd({ type: 'bank', name: form.bankName, bankName: form.bankName, accountNumber: form.accountNumber, routingNumber: form.routingNumber, accountType: form.accountType });
    }
    onClose();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">Account Type</label>
        <select
          value={type}
          onChange={e => setType(e.target.value as 'crypto' | 'bank')}
          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-slate-100"
        >
          <option value="crypto">Crypto Wallet</option>
          <option value="bank">Bank Account</option>
        </select>
      </div>

      {type === 'crypto' ? (
        <>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Wallet Name</label>
            <input
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="My Bitcoin Wallet" required
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-slate-100 placeholder-zinc-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Wallet Address</label>
            <input
              value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" required
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-slate-100 placeholder-zinc-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Currency</label>
            <select
              value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-slate-100"
            >
              {['BTC', 'ETH', 'USDT', 'BNB', 'SOL'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Bank Name</label>
            <input
              value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })}
              placeholder="Chase Bank" required
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-slate-100 placeholder-zinc-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Account Number</label>
            <input
              value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })}
              placeholder="1234567890" required
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-slate-100 placeholder-zinc-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Routing Number</label>
            <input
              value={form.routingNumber} onChange={e => setForm({ ...form, routingNumber: e.target.value })}
              placeholder="021000021" required
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-slate-100 placeholder-zinc-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Account Type</label>
            <select
              value={form.accountType} onChange={e => setForm({ ...form, accountType: e.target.value })}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-slate-100"
            >
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
            </select>
          </div>
        </>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button" onClick={onClose}
          className="flex-1 rounded-md border border-zinc-700 py-2 text-sm text-slate-300 hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 rounded-md bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          Add Account
        </button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>('personal');
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '' });
  const [saving, setSaving] = useState(false);

  const [accounts, setAccounts] = useState<WalletAccount[]>([
    { id: 1, type: 'crypto', name: 'Bitcoin Wallet', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', currency: 'BTC' },
    { id: 2, type: 'bank', name: 'Chase Bank', accountNumber: '****1234', routingNumber: '021000021', accountType: 'Checking' },
  ]);
  const [showAddAccount, setShowAddAccount] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPass: false, confirm: false });
  const [changingPw, setChangingPw] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: true,
    marketingEmails: false,
    tradingAlerts: true,
    priceAlerts: true,
    portfolioUpdates: true,
    newsUpdates: false,
    pushNotifications: true,
    soundEffects: false,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/login'); return; }
        const { user: u } = await res.json();
        setUser(u);
        setForm({ firstName: u.firstName ?? '', lastName: u.lastName ?? '', email: u.email ?? '', phone: u.phone ?? '', dateOfBirth: '' });
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, phone: form.phone }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? 'Failed to save'); }
      const { user: u } = await res.json();
      setUser(u);
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) { toast.error('All fields are required'); return; }
    if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.newPass.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setChangingPw(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? 'Failed to change password');
      toast.success('Password changed successfully');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) { toast.error('Please select a JPEG, PNG or WebP image'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return; }
    setAvatar(URL.createObjectURL(file));
    toast.success('Profile photo updated');
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const kycLevel = 'Not verified';
  const accountTier = 'Standard';

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: 'Personal', icon: <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'accounts', label: 'Accounts', icon: <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-24 lg:pb-6">

        {/* Profile header card */}
        <div className="rounded-xl border p-5 sm:p-6" style={{ background: 'rgba(0,0,0,0.35)', borderColor: 'rgba(35,35,35,0.6)' }}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-orange-500/40 overflow-hidden bg-zinc-800 flex items-center justify-center">
                {avatar
                  ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-2xl sm:text-3xl font-bold text-orange-400">{initials(user.firstName, user.lastName)}</span>}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center border-2 border-black hover:bg-orange-600 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{user.firstName} {user.lastName}</h1>
              <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/15 text-orange-400 border border-orange-500/20">{accountTier}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-700/60 text-slate-300 border border-zinc-600/40">Member since {memberSince}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-700/60 text-slate-400 border border-zinc-600/40">KYC: {kycLevel}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-zinc-700/50">
            {[
              { label: 'Portfolio Value', value: `$${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
              { label: 'Total Deposits', value: `$${user.totalDeposited.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
              { label: 'Total Withdrawn', value: `$${user.totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-base sm:text-lg font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs container */}
        <div className="rounded-xl border" style={{ background: 'rgba(0,0,0,0.35)', borderColor: 'rgba(35,35,35,0.6)' }}>
          <div className="flex border-b border-zinc-800 p-1 gap-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2.5 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  tab === t.id ? 'bg-zinc-800 text-orange-400' : 'text-slate-500 hover:text-slate-300 hover:bg-zinc-800/50'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">

            {/* PERSONAL */}
            {tab === 'personal' && (
              <div
                className="rounded-xl border"
                style={{ background: 'rgba(14,14,14,0.6)', borderColor: 'rgba(39,39,42,0.8)' }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-zinc-800">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-white">Personal Information</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Update your personal details and contact information</p>
                  </div>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-md border border-zinc-700 text-sm text-slate-300 hover:bg-zinc-800 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditing(false); setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone ?? '', dateOfBirth: '' }); }}
                        className="px-4 py-2 rounded-md border border-zinc-700 text-sm text-slate-300 hover:bg-zinc-800"
                      >Cancel</button>
                      <button
                        onClick={saveProfile} disabled={saving}
                        className="px-4 py-2 rounded-md bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
                      >{saving ? 'Saving…' : 'Save Changes'}</button>
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Field label="First Name" id="firstName" value={form.firstName} disabled={!editing} onChange={v => setForm({ ...form, firstName: v })} />
                    <Field label="Last Name" id="lastName" value={form.lastName} disabled={!editing} onChange={v => setForm({ ...form, lastName: v })} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Field label="Email Address" id="email" value={form.email} disabled type="email" />
                    <Field label="Phone Number" id="phone" value={form.phone} disabled={!editing} onChange={v => setForm({ ...form, phone: v })} />
                  </div>
                  <Field label="Date of Birth" id="dob" value={form.dateOfBirth} disabled type="date" />
                </div>
              </div>
            )}

            {/* ACCOUNTS */}
            {tab === 'accounts' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-xl border" style={{ background: 'rgba(14,14,14,0.6)', borderColor: 'rgba(39,39,42,0.8)' }}>
                  <div className="flex items-center gap-2 p-4 sm:p-5 border-b border-zinc-800">
                    <ChartPie className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                    <h2 className="text-base sm:text-lg font-semibold text-white">Account Overview</h2>
                  </div>
                  <div className="p-4 sm:p-5 space-y-3">
                    {[
                      { label: 'Account Status', value: 'Active', cls: 'text-green-400' },
                      { label: 'Account Tier', value: accountTier },
                      { label: 'KYC Level', value: kycLevel },
                      { label: 'Member Since', value: memberSince },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span className="text-slate-500">{row.label}</span>
                        <span className={`font-medium ${row.cls ?? 'text-slate-200'}`}>{row.value}</span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-zinc-800">
                      <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span className="text-slate-500">Account Progress</span>
                        <span className="font-medium text-slate-300">Level 1</span>
                      </div>
                      <div className="w-full h-1.5 sm:h-2 rounded-full bg-zinc-800">
                        <div className="h-full rounded-full bg-orange-500" style={{ width: '25%' }} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Complete KYC to unlock higher levels</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border" style={{ background: 'rgba(14,14,14,0.6)', borderColor: 'rgba(39,39,42,0.8)' }}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-zinc-800">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-white">Withdrawal Accounts</h2>
                      <p className="text-sm text-slate-500 mt-0.5">Manage your crypto wallets and bank accounts for withdrawals</p>
                    </div>
                    <button
                      onClick={() => setShowAddAccount(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-md bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 w-full sm:w-auto justify-center"
                    >
                      <Plus className="w-4 h-4" /> Add Account
                    </button>
                  </div>
                  <div className="p-4 sm:p-5 space-y-3">
                    {accounts.map(acc => (
                      <div key={acc.id} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/40">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                          {acc.type === 'crypto' ? <Bitcoin className="w-4 h-4 text-orange-400" /> : <Building2 className="w-4 h-4 text-blue-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200">{acc.name}</p>
                          <p className="text-xs text-slate-500 truncate">
                            {acc.type === 'crypto' ? `${acc.currency} • ${acc.address?.slice(0, 16)}…` : `${acc.accountType} • ${acc.accountNumber}`}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${acc.type === 'crypto' ? 'bg-orange-500/15 text-orange-400' : 'bg-blue-500/15 text-blue-400'}`}>
                          {acc.type === 'crypto' ? 'Crypto' : 'Bank'}
                        </span>
                        <button onClick={() => setAccounts(a => a.filter(x => x.id !== acc.id))} className="text-slate-600 hover:text-red-400 transition-colors ml-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {accounts.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No accounts added yet</p>}
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY */}
            {tab === 'security' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-xl border" style={{ background: 'rgba(14,14,14,0.6)', borderColor: 'rgba(39,39,42,0.8)' }}>
                  <div className="flex items-center gap-2 p-4 sm:p-5 border-b border-zinc-800">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-white">Change Password</h2>
                      <p className="text-sm text-slate-500">Update your password to keep your account secure</p>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 space-y-4">
                    {([
                      { label: 'Current Password', key: 'current' as const, placeholder: 'Enter current password' },
                      { label: 'New Password', key: 'newPass' as const, placeholder: 'Enter new password' },
                      { label: 'Confirm New Password', key: 'confirm' as const, placeholder: 'Confirm new password' },
                    ]).map(f => (
                      <div key={f.key} className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-300">{f.label}</label>
                        <div className="relative">
                          <input
                            type={showPw[f.key] ? 'text' : 'password'}
                            value={passwords[f.key]}
                            onChange={e => setPasswords({ ...passwords, [f.key]: e.target.value })}
                            placeholder={f.placeholder}
                            className="w-full rounded-md border border-zinc-700 bg-zinc-800/60 px-3 py-2 pr-10 text-sm text-slate-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500/50"
                          />
                          <button type="button" onClick={() => setShowPw({ ...showPw, [f.key]: !showPw[f.key] })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                            {showPw[f.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={changePassword} disabled={changingPw}
                      className="w-full sm:w-auto px-6 py-2 rounded-md bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
                    >{changingPw ? 'Changing…' : 'Change Password'}</button>
                  </div>
                </div>

                <div className="rounded-xl border" style={{ background: 'rgba(14,14,14,0.6)', borderColor: 'rgba(39,39,42,0.8)' }}>
                  <div className="flex items-center gap-2 p-4 sm:p-5 border-b border-zinc-800">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-white">Security Settings</h2>
                      <p className="text-sm text-slate-500">Manage your account security preferences</p>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <ToggleRow
                      label="Two-Factor Authentication"
                      description="Add an extra layer of security to your account"
                      checked={settings.twoFactorAuth}
                      onChange={v => setSettings({ ...settings, twoFactorAuth: v })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {tab === 'settings' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-xl border" style={{ background: 'rgba(14,14,14,0.6)', borderColor: 'rgba(39,39,42,0.8)' }}>
                  <div className="flex items-center gap-2 p-4 sm:p-5 border-b border-zinc-800">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-white">Notifications</h2>
                      <p className="text-sm text-slate-500">Essential notification preferences</p>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 space-y-4">
                    <ToggleRow label="Email Notifications" description="Account activity and important updates" checked={settings.emailNotifications} onChange={v => setSettings({ ...settings, emailNotifications: v })} />
                    <ToggleRow label="Trading Alerts" description="Notifications for trade executions and signals" checked={settings.tradingAlerts} onChange={v => setSettings({ ...settings, tradingAlerts: v })} />
                    <ToggleRow label="Marketing Emails" description="Product updates and promotional offers" checked={settings.marketingEmails} onChange={v => setSettings({ ...settings, marketingEmails: v })} />
                  </div>
                </div>
                <button
                  onClick={() => toast.success('Settings saved')}
                  className="px-6 py-2 rounded-md bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
                >Save Settings</button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Add Account modal */}
      {showAddAccount && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowAddAccount(false)}
        >
            <div
              className="relative w-full max-w-md rounded-xl border p-5 sm:p-6 shadow-2xl overflow-y-auto"
              style={{ background: '#111111', borderColor: 'rgba(39,39,42,0.8)', maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white mb-1">Add Withdrawal Account</h2>
              <p className="text-sm text-slate-500 mb-5">Add a new crypto wallet or bank account for withdrawals</p>
              <AddAccountForm
                onAdd={acc => setAccounts(prev => [...prev, { id: Date.now(), ...acc }])}
                onClose={() => setShowAddAccount(false)}
              />
            </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Field({ label, id, value, disabled, onChange, type = 'text' }: {
  label: string; id: string; value: string; disabled?: boolean;
  onChange?: (v: string) => void; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">{label}</label>
      <input
        id={id} type={type} value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full rounded-md border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-slate-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm sm:text-base font-medium text-slate-200">{label}</p>
        <p className="text-xs sm:text-sm text-slate-500">{description}</p>
      </div>
      <button
        role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${checked ? 'bg-orange-500' : 'bg-zinc-700'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
