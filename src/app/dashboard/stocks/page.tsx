'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BarChart3 } from 'lucide-react';

export default function StocksPage() {
  return (
    <DashboardLayout>
      <h1 className="mb-1 text-2xl font-bold text-white">Stocks</h1>
      <p className="mb-8 text-sm" style={{ color: '#71717a' }}>Trade global stocks and equities.</p>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: '#141414' }}>
          <BarChart3 size={36} style={{ color: '#52525b' }} />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-white">Coming Soon</h2>
        <p className="max-w-sm text-sm" style={{ color: '#71717a' }}>
          Stock trading is currently in development. Soon you&apos;ll be able to invest in global equities directly from your account.
        </p>
      </div>
    </DashboardLayout>
  );
}
