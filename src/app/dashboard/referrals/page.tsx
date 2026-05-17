'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Users, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user?.referralCode) {
        setReferralCode(d.user.referralCode);
        setReferralLink(`${window.location.origin}/signup?ref=${d.user.referralCode}`);
      }
    });
  }, []);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <DashboardLayout>
      <h1 className="mb-1 text-2xl font-bold text-white">Referrals</h1>
      <p className="mb-8 text-sm" style={{ color: '#71717a' }}>Earn commission by referring friends to Meta Trading Option.</p>

      <div className="max-w-2xl space-y-6">
        {/* How it works */}
        <div className="rounded-md p-5" style={{ background: '#0e0e0e', border: '1px solid #27272a' }}>
          <h2 className="mb-4 font-semibold text-white flex items-center gap-2">
            <Users size={18} style={{ color: 'var(--primary)' }} />
            How It Works
          </h2>
          <div className="space-y-3 text-sm" style={{ color: '#a1a1aa' }}>
            <p>1. Share your unique referral link with friends.</p>
            <p>2. When they sign up and make their first deposit, you earn a commission.</p>
            <p>3. Your commission is credited directly to your account balance.</p>
          </div>
        </div>

        {/* Referral link */}
        <div className="rounded-md p-5" style={{ background: '#0e0e0e', border: '1px solid #27272a' }}>
          <h2 className="mb-4 font-semibold text-white">Your Referral Link</h2>
          <div className="flex rounded-lg overflow-hidden mb-3" style={{ background: '#141414' }}>
            <input
              readOnly
              value={referralLink}
              className="flex-1 bg-transparent border-0 px-3 py-2.5 text-sm text-white focus:outline-none truncate min-w-0"
            />
            <button
              onClick={() => copy(referralLink, 'Link')}
              className="px-4 py-2 text-sm font-medium text-white flex items-center gap-1.5 flex-shrink-0"
              style={{ background: 'var(--primary)' }}
            >
              <Copy size={14} />
              Copy
            </button>
          </div>

          <h3 className="mb-2 text-sm font-medium" style={{ color: '#71717a' }}>Referral Code</h3>
          <div className="flex items-center gap-3 rounded-lg px-4 py-3" style={{ background: '#141414', border: '1px solid #27272a' }}>
            <span className="font-mono text-lg font-bold text-white flex-1">{referralCode}</span>
            <button
              onClick={() => copy(referralCode, 'Code')}
              className="text-xs flex items-center gap-1 hover:underline"
              style={{ color: 'var(--primary)' }}
            >
              <Copy size={12} /> Copy
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Referrals', value: '0' },
            { label: 'Total Earned', value: '$0.00' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-md p-4" style={{ background: '#0e0e0e', border: '1px solid #27272a' }}>
              <p className="text-xs mb-1" style={{ color: '#71717a' }}>{label}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
