'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  History,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowDownToLine,
  ArrowUpFromLine,
  Gift,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
} from 'lucide-react';

// ─── types ────────────────────────────────────────────────────────────────────

interface TxRecord {
  _id: string;
  type: 'deposit' | 'withdrawal' | 'earning' | 'bonus';
  amount: number;
  currency?: string;
  status: string;
  paymentMethod?: string;
  method?: string;
  accountDetails?: { network?: string; bankName?: string };
  network?: string;
  createdAt: string;
}

interface Stats {
  totalCount: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalEarnings: number;
}

interface Page {
  transactions: TxRecord[];
  total: number;
  page: number;
  totalPages: number;
  stats: Stats;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string) {
  const dt = new Date(d);
  return {
    date: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}

function txMethod(tx: TxRecord): string {
  if (tx.type === 'deposit') {
    return tx.paymentMethod === 'crypto' ? `${tx.currency ?? 'Crypto'} Wallet` : tx.paymentMethod === 'bank' ? 'Bank Transfer' : tx.paymentMethod ?? '—';
  }
  if (tx.type === 'withdrawal') {
    return tx.accountDetails?.network ?? tx.accountDetails?.bankName ?? tx.network ?? tx.method ?? 'Crypto';
  }
  if (tx.type === 'earning') return 'Investment Return';
  if (tx.type === 'bonus') return 'Bonus Reward';
  return '—';
}

function typeLabel(t: string) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function statusLabel(s: string) {
  if (s === 'approved') return 'Completed';
  if (s === 'rejected') return 'Failed';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function statusClasses(s: string) {
  const norm = s === 'approved' ? 'completed' : s === 'rejected' ? 'failed' : s;
  if (norm === 'completed') return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
  if (norm === 'pending') return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
  if (norm === 'failed') return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800';
  return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
}

function StatusIcon({ s }: { s: string }) {
  const norm = s === 'approved' ? 'completed' : s === 'rejected' ? 'failed' : s;
  if (norm === 'completed') return <CheckCircle className="w-3 h-3 mr-1" />;
  if (norm === 'failed') return <AlertTriangle className="w-3 h-3 mr-1" />;
  return <Clock className="w-3 h-3 mr-1" />;
}

function TypeIcon({ type }: { type: string }) {
  if (type === 'deposit') {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-all duration-150">
        <ArrowDownToLine className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
      </span>
    );
  }
  if (type === 'withdrawal') {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-red-50 dark:bg-red-900/20 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-all duration-150">
        <ArrowUpFromLine className="w-3 h-3 text-red-600 dark:text-red-400" />
      </span>
    );
  }
  if (type === 'earning') {
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-all duration-150">
        <TrendingUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-900/20 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-all duration-150">
      <Gift className="w-3 h-3 text-amber-600 dark:text-amber-400" />
    </span>
  );
}

function amountColor(type: string) {
  if (type === 'withdrawal') return 'text-red-600 dark:text-red-400';
  if (type === 'earning' || type === 'bonus') return 'text-emerald-600 dark:text-emerald-400';
  return 'text-slate-900 dark:text-slate-100';
}

function amountSign(type: string) {
  if (type === 'withdrawal') return '-';
  return '+';
}

// ─── stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  iconClass: string;
}) {
  return (
    <div className="p-3 sm:p-4 bg-slate-100 dark:bg-[#0e0e0e] rounded-sm border border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-zinc-400">{label}</span>
        <span className={iconClass}>{icon}</span>
      </div>
      <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      {sub && <p className="text-xs text-slate-500 dark:text-zinc-500">{sub}</p>}
    </div>
  );
}

// ─── select ───────────────────────────────────────────────────────────────────

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 sm:h-10 rounded-sm border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 dark:[color-scheme:dark] text-slate-900 dark:text-slate-100 text-xs sm:text-sm px-2 sm:px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'earning', label: 'Earning' },
  { value: 'bonus', label: 'Bonus' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Failed' },
];

const LIMIT_OPTIONS = [
  { value: '10', label: '10 / page' },
  { value: '20', label: '20 / page' },
  { value: '50', label: '50 / page' },
];

export default function TransactionsPage() {
  const [data, setData] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchData = useCallback(
    async (p = page) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(p),
          limit: String(limit),
          type: typeFilter,
          status: statusFilter,
          search,
        });
        const res = await fetch(`/api/transactions?${params}`);
        if (res.ok) setData(await res.json());
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [page, limit, typeFilter, statusFilter, search]
  );

  useEffect(() => {
    setPage(1);
  }, [typeFilter, statusFilter, limit]);

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, typeFilter, statusFilter, limit]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchData(1);
  }

  function handleExport() {
    if (!data?.transactions.length) return;
    const header = ['ID', 'Type', 'Amount', 'Currency', 'Status', 'Method', 'Date'];
    const rows = data.transactions.map((t) => [
      t._id,
      t.type,
      t.amount,
      t.currency ?? 'USD',
      statusLabel(t.status),
      txMethod(t),
      new Date(t.createdAt).toISOString(),
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const stats = data?.stats;
  const transactions = data?.transactions ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <DashboardLayout>
      <div className="flex dark:bg-gradient-to-r dark:from-[#ed571705] dark:to-[#e4481d09] flex-1 flex-col gap-4 p-2 sm:p-4 pt-0 pb-20 md:pb-4 w-full overflow-x-hidden">
        <div className="bg-transparent border border-[#cbcaca26] dark:border dark:border-[rgba(35,35,35,0.6)] dark:bg-[rgba(0,0,0,0.38)] backdrop-blur-[1.5px] min-h-[calc(100vh-8rem)] p-3 sm:p-6 flex-1 rounded-md md:min-h-min w-full overflow-x-hidden">

          {/* ── Page header ── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 sm:gap-3">
                <History className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                Transaction History
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                View and manage all your account transactions
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 h-9 sm:h-10 px-3 sm:px-4 rounded-sm border border-slate-200 dark:border-zinc-800 bg-white dark:bg-transparent text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              Export CSV
            </button>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 w-full mb-4 sm:mb-6">
            <StatCard
              icon={<History className="w-3 h-3 sm:w-4 sm:h-4" />}
              label="Total Transactions"
              value={String(stats?.totalCount ?? 0)}
              sub="All time"
              iconClass="text-primary"
            />
            <StatCard
              icon={<TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />}
              label="Total Deposits"
              value={`$${fmt(stats?.totalDeposits ?? 0)}`}
              iconClass="text-emerald-500"
            />
            <StatCard
              icon={<TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
              label="Total Withdrawals"
              value={`$${fmt(stats?.totalWithdrawals ?? 0)}`}
              iconClass="text-red-500"
            />
            <StatCard
              icon={<DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />}
              label="Total Earnings"
              value={`$${fmt(stats?.totalEarnings ?? 0)}`}
              iconClass="text-blue-500"
            />
          </div>

          {/* ── Filter bar ── */}
          <div className="border border-slate-200 dark:border-zinc-800 rounded-md bg-white dark:bg-[#0e0e0e] p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 min-w-0 flex gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search transactions..."
                    className="w-full h-9 sm:h-10 pl-9 pr-3 rounded-sm border border-slate-200 dark:border-zinc-800 bg-transparent text-slate-900 dark:text-slate-100 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => { setSearch(''); setPage(1); fetchData(1); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="h-9 sm:h-10 px-3 sm:px-4 rounded-sm bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <Select value={typeFilter} onChange={setTypeFilter} options={TYPE_OPTIONS} />
                <Select value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
                <Select value={String(limit)} onChange={(v) => setLimit(Number(v))} options={LIMIT_OPTIONS} />
              </div>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="border border-slate-200 dark:border-zinc-800 rounded-md overflow-hidden dark:bg-[#0e0e0e]">
            {/* Table header row info */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {loading ? 'Loading...' : `${total} transaction${total !== 1 ? 's' : ''} found`}
              </span>
              {totalPages > 1 && (
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
              )}
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30">
                    {['Type', 'Amount', 'Status', 'Method', 'Date'].map((h) => (
                      <th
                        key={h}
                        className="h-8 sm:h-10 px-2 sm:px-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                          Loading transactions...
                        </div>
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <History className="w-10 h-10 text-slate-300 dark:text-zinc-700" />
                          <p>No transactions found</p>
                          {(typeFilter !== 'all' || statusFilter !== 'all' || search) && (
                            <button
                              onClick={() => { setTypeFilter('all'); setStatusFilter('all'); setSearch(''); setPage(1); }}
                              className="text-primary text-xs hover:underline"
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      const { date, time } = fmtDate(tx.createdAt);
                      return (
                        <tr
                          key={tx._id}
                          className="border-b border-slate-100/50 dark:border-slate-700/50 hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors duration-150 group"
                        >
                          {/* Type */}
                          <td className="px-2 sm:px-3 py-2 sm:py-3">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <TypeIcon type={tx.type} />
                              <div>
                                <div className="font-medium text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                                  {typeLabel(tx.type)}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">
                                  #{tx._id.toString().slice(-8).toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="px-2 sm:px-3 py-2 sm:py-3">
                            <div className={`font-semibold text-xs sm:text-sm ${amountColor(tx.type)}`}>
                              {amountSign(tx.type)}${fmt(tx.amount)}
                            </div>
                            <div className="text-xs text-muted-foreground">{tx.currency ?? 'USD'}</div>
                          </td>

                          {/* Status */}
                          <td className="px-2 sm:px-3 py-2 sm:py-3">
                            <span
                              className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${statusClasses(tx.status)}`}
                            >
                              <StatusIcon s={tx.status} />
                              {statusLabel(tx.status)}
                            </span>
                          </td>

                          {/* Method */}
                          <td className="px-2 sm:px-3 py-2 sm:py-3">
                            <span className="text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                              {txMethod(tx)}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-right">
                            <div className="text-xs text-slate-600 dark:text-slate-300">{date}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{time}</div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-slate-800/20">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="h-7 sm:h-8 w-7 sm:w-8 flex items-center justify-center rounded-sm border border-slate-200 dark:border-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p: number;
                    if (totalPages <= 5) p = i + 1;
                    else if (page <= 3) p = i + 1;
                    else if (page >= totalPages - 2) p = totalPages - 4 + i;
                    else p = page - 2 + i;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`h-7 sm:h-8 w-7 sm:w-8 flex items-center justify-center rounded-sm border text-xs font-medium transition-colors ${
                          p === page
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="h-7 sm:h-8 w-7 sm:w-8 flex items-center justify-center rounded-sm border border-slate-200 dark:border-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
