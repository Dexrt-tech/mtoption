'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Users, ArrowDownCircle, ArrowUpCircle, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, pendingDeposits: 0, pendingWithdrawals: 0, totalVolume: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/deposits').then(r => r.json()),
      fetch('/api/admin/withdrawals').then(r => r.json()),
    ]).then(([users, deps, wits]) => {
      const pendingDeps = (deps.deposits || []).filter((d: { status: string }) => d.status === 'pending');
      const pendingWits = (wits.withdrawals || []).filter((w: { status: string }) => w.status === 'pending');
      const totalVol = (deps.deposits || []).filter((d: { status: string }) => d.status === 'approved')
        .reduce((sum: number, d: { amount: number }) => sum + d.amount, 0);
      setStats({
        users: (users.users || []).length,
        pendingDeposits: pendingDeps.length,
        pendingWithdrawals: pendingWits.length,
        totalVolume: totalVol,
      });
    });
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.users, icon: Users },
    { label: 'Pending Deposits', value: stats.pendingDeposits, icon: ArrowDownCircle },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: ArrowUpCircle },
    { label: 'Total Volume', value: `$${stats.totalVolume.toLocaleString()}`, icon: TrendingUp },
  ];

  return (
    <AdminLayout>
      <h1 className="mb-2 text-2xl font-bold text-white">Admin Overview</h1>
      <p className="mb-8 text-sm" style={{ color: '#62748e' }}>Meta Trading Option platform management dashboard.</p>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'rgba(255,106,94,0.1)', border: '1px solid rgba(255,106,94,0.2)' }}>
                <Icon size={20} style={{ color: 'var(--primary)' }} />
              </div>
              <p className="mb-1 text-xs uppercase tracking-wider" style={{ color: '#62748e' }}>{card.label}</p>
              <p className="text-3xl font-bold text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-bold text-white">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { href: '/admin/deposits', label: `Review ${stats.pendingDeposits} pending deposits` },
              { href: '/admin/withdrawals', label: `Process ${stats.pendingWithdrawals} pending withdrawals` },
              { href: '/admin/users', label: `Manage ${stats.users} users` },
              { href: '/admin/plans', label: 'Edit investment plans' },
            ].map((action) => (
              <a key={action.href} href={action.href} className="group flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-white/5">
                <span className="text-sm transition-colors group-hover:text-white" style={{ color: '#62748e' }}>{action.label}</span>
                <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>→</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
