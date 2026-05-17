'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { TrendingUp } from 'lucide-react';

export default function CopyTradingPage() {
  return (
    <DashboardLayout>
      <h1 className="mb-1 text-2xl font-bold text-white">Copy Trading</h1>
      <p className="mb-8 text-sm" style={{ color: '#71717a' }}>Follow and copy top-performing traders automatically.</p>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: '#141414' }}>
          <TrendingUp size={36} style={{ color: '#52525b' }} />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-white">Coming Soon</h2>
        <p className="max-w-sm text-sm" style={{ color: '#71717a' }}>
          Copy Trading is currently in development. This feature will let you automatically mirror successful traders&apos; portfolios.
        </p>
      </div>
    </DashboardLayout>
  );
}
