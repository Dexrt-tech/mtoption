'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  RefreshCw,
  Plus,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart2,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Investment {
  _id: string;
  planName: string;
  amount: number;
  roiPercent: number;
  durationDays: number;
  earnings: number;
  status: 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDailyReturn(inv: Investment) {
  return (inv.amount * inv.roiPercent) / 100 / inv.durationDays;
}

function getProgress(inv: Investment) {
  const start = new Date(inv.startDate).getTime();
  const end = new Date(inv.endDate).getTime();
  const now = Date.now();
  return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
}

function getCurrentValue(inv: Investment) {
  return inv.amount + inv.earnings;
}

function getDaysLeft(inv: Investment) {
  const end = new Date(inv.endDate).getTime();
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Investment['status'] }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </span>
    );
  }
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
        <CheckCircle className="w-3 h-3" />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
      <XCircle className="w-3 h-3" />
      Cancelled
    </span>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 dark:border-zinc-800/60">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 rounded bg-zinc-800/40 animate-pulse" style={{ width: i === 0 ? '120px' : i === 5 ? '100px' : '60px' }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ActivePlansPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch('/api/investments');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInvestments(data.investments ?? []);
    } catch {
      // silent – keep previous data on refresh fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Computed stats (only active investments)
  const active = investments.filter((i) => i.status === 'active');
  const totalInvested = active.reduce((s, i) => s + i.amount, 0);
  const currentValue = active.reduce((s, i) => s + getCurrentValue(i), 0);
  const dailyReturns = active.reduce((s, i) => s + getDailyReturn(i), 0);
  const activeCount = active.length;
  const valueChange = currentValue - totalInvested;
  const valuePct = totalInvested > 0 ? (valueChange / totalInvested) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Active Investment Plans
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Monitor and manage your ongoing investments
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-slate-200 dark:border-zinc-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/dashboard/investments"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--primary)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              New Investment
            </Link>
          </div>
        </div>

        {/* ── Stat Cards ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Total Invested */}
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 dark:bg-[#0e0e0e] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Invested</span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(249,115,22,0.12)' }}
              >
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-28 rounded bg-zinc-800/50 animate-pulse" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                ${fmt(totalInvested)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Total capital deployed</p>
          </div>

          {/* Current Value */}
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 dark:bg-[#0e0e0e] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Current Value</span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.12)' }}
              >
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-28 rounded bg-zinc-800/50 animate-pulse" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                ${fmt(currentValue)}
              </p>
            )}
            <p className="text-xs text-emerald-500 mt-1">
              +${fmt(valueChange)} ({valuePct.toFixed(2)}%)
            </p>
          </div>

          {/* Daily Returns */}
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 dark:bg-[#0e0e0e] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Daily Returns</span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.12)' }}
              >
                <BarChart2 className="w-4 h-4 text-indigo-500" />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-28 rounded bg-zinc-800/50 animate-pulse" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                ${fmt(dailyReturns)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Average per day</p>
          </div>

          {/* Active Plans */}
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 dark:bg-[#0e0e0e] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Active Plans</span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(249,115,22,0.12)' }}
              >
                <Activity className="w-4 h-4 text-primary" />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-10 rounded bg-zinc-800/50 animate-pulse" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {activeCount}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Currently running</p>
          </div>

        </div>

        {/* ── Table ─────────────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 dark:bg-[#0e0e0e] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Plan Details', 'Investment', 'Current Value', 'ROI', 'Daily Return', 'Progress', 'Status', 'Actions'].map(
                    (col, i) => (
                      <th
                        key={col}
                        className={`px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap ${
                          i === 0 || i >= 5 ? 'text-left' : 'text-right'
                        }`}
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : investments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{
                            background: 'rgba(249,115,22,0.08)',
                            border: '1px solid rgba(249,115,22,0.2)',
                          }}
                        >
                          <Activity className="w-7 h-7 text-primary opacity-60" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white mb-1">
                            No Active Plans
                          </p>
                          <p className="text-xs text-muted-foreground max-w-xs">
                            You have no active investment plans at the moment. Choose a plan to get started.
                          </p>
                        </div>
                        <Link
                          href="/dashboard/investments"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90 mt-1"
                          style={{ background: 'var(--primary)' }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Browse Plans
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  investments.map((inv) => {
                    const progress = getProgress(inv);
                    const dailyReturn = getDailyReturn(inv);
                    const curVal = getCurrentValue(inv);
                    const daysLeft = getDaysLeft(inv);

                    return (
                      <tr
                        key={inv._id}
                        className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors last:border-0"
                      >
                        {/* Plan Details */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                              style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)' }}
                            >
                              <TrendingUp className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                                {inv.planName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {inv.durationDays} days &middot; Started {fmtDate(inv.startDate)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Investment */}
                        <td className="px-4 py-4 text-right">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            ${fmt(inv.amount)}
                          </span>
                        </td>

                        {/* Current Value */}
                        <td className="px-4 py-4 text-right">
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              ${fmt(curVal)}
                            </span>
                            {inv.earnings > 0 && (
                              <p className="text-xs text-emerald-500 mt-0.5">+${fmt(inv.earnings)}</p>
                            )}
                          </div>
                        </td>

                        {/* ROI */}
                        <td className="px-4 py-4 text-right">
                          <span className="font-semibold text-primary">{inv.roiPercent}%</span>
                        </td>

                        {/* Daily Return */}
                        <td className="px-4 py-4 text-right">
                          <span className="font-semibold text-emerald-500">+${fmt(dailyReturn)}</span>
                        </td>

                        {/* Progress */}
                        <td className="px-4 py-4 min-w-[150px]">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{progress}%</span>
                              <span>
                                {inv.status === 'active'
                                  ? daysLeft === 0
                                    ? 'Ends today'
                                    : `${daysLeft}d left`
                                  : 'Done'}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${progress}%`,
                                  background: progress >= 100 ? '#22c55e' : 'var(--primary)',
                                  transition: 'width 0.4s ease',
                                }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">Ends {fmtDate(inv.endDate)}</p>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <StatusBadge status={inv.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <Link
                            href="/dashboard/investments"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
