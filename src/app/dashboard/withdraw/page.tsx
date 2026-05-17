'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  DollarSign,
  TrendingDown,
  Clock,
  ArrowUpFromLine,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  Copy,
  X,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

// ─── types ────────────────────────────────────────────────────────────────────

interface WithdrawalAccount {
  id: string;
  type: 'crypto' | 'bank';
  name: string;
  address?: string;
  accountNumber?: string;
  network?: string;
  bankName?: string;
  icon: string;
  processingTime: string;
  fee: string;
}

interface WithdrawalRecord {
  _id: string;
  amount: number;
  method?: string;
  accountDetails?: { network?: string; bankName?: string };
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  createdAt: string;
}

// ─── static data ──────────────────────────────────────────────────────────────

const ACCOUNTS: WithdrawalAccount[] = [
  {
    id: 'btc-1',
    type: 'crypto',
    name: 'Bitcoin Wallet',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    network: 'Bitcoin',
    icon: '₿',
    processingTime: '10-30 minutes',
    fee: '0.0005 BTC',
  },
  {
    id: 'eth-1',
    type: 'crypto',
    name: 'Ethereum Wallet',
    address: '0x742d35Cc6634C0532925a3b8D4C9C0F9b1b3e4F',
    network: 'Ethereum',
    icon: 'Ξ',
    processingTime: '5-15 minutes',
    fee: '0.002 ETH',
  },
  {
    id: 'usdt-1',
    type: 'crypto',
    name: 'USDT Wallet',
    address: 'TQn9Y2khEsLJW1Ch9zWhmdmfnBDRcjdGq8',
    network: 'TRC20',
    icon: '₮',
    processingTime: '5-10 minutes',
    fee: '1 USDT',
  },
  {
    id: 'bank-1',
    type: 'bank',
    name: 'Chase Bank',
    accountNumber: '****1234',
    bankName: 'Chase Bank',
    icon: '🏦',
    processingTime: '1-3 business days',
    fee: '$5.00',
  },
  {
    id: 'bank-2',
    type: 'bank',
    name: 'Wells Fargo',
    accountNumber: '****5678',
    bankName: 'Wells Fargo',
    icon: '🏦',
    processingTime: '1-3 business days',
    fee: '$5.00',
  },
];

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000, 2500];

// ─── helpers ──────────────────────────────────────────────────────────────────

function statusColor(s: string) {
  if (s === 'completed' || s === 'approved') return '#22c55e';
  if (s === 'pending') return '#eab308';
  if (s === 'rejected') return '#ef4444';
  return '#a1a1aa';
}

function statusLabel(s: string) {
  if (s === 'approved') return 'Completed';
  if (s === 'rejected') return 'Failed';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── sub-components ───────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'rgba(35,35,35,0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: 12, color: '#a1a1aa' }}>{label}</span>
      </div>
      <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>${value}</span>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function WithdrawPage() {
  const [kycStatus, setKycStatus] = useState<'loading' | 'none' | 'pending' | 'approved' | 'rejected'>('loading');
  const [stats, setStats] = useState({ balance: 0, totalWithdrawals: 0, pendingWithdrawals: 0, withdrawalsThisMonth: 0 });
  const [selectedAccount, setSelectedAccount] = useState<WithdrawalAccount>(ACCOUNTS[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quickAmount, setQuickAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [recentWithdrawals, setRecentWithdrawals] = useState<WithdrawalRecord[]>([]);

  // dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [dialogState, setDialogState] = useState<'idle' | 'validating' | 'processing' | 'submitting' | 'success'>('idle');
  const [copied, setCopied] = useState(false);

  const amount = quickAmount ?? (customAmount ? parseFloat(customAmount) : 0);

  useEffect(() => {
    fetch('/api/kyc/status')
      .then(r => r.json())
      .then(d => setKycStatus(d.status ?? 'none'))
      .catch(() => setKycStatus('none'));

    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((d) =>
        setStats({
          balance: d.balance ?? 0,
          totalWithdrawals: d.totalWithdrawals ?? 0,
          pendingWithdrawals: d.pendingWithdrawals ?? 0,
          withdrawalsThisMonth: d.withdrawalsThisMonth ?? 0,
        })
      )
      .catch(() => {});

    fetch('/api/withdrawals')
      .then((r) => r.json())
      .then((d) => setRecentWithdrawals(d.withdrawals ?? []))
      .catch(() => {});
  }, []);

  function handleQuick(v: number) {
    setQuickAmount(v);
    setCustomAmount('');
  }

  function handleCustom(v: string) {
    setCustomAmount(v);
    setQuickAmount(null);
  }

  function openDialog() {
    if (!amount || amount <= 0 || amount > stats.balance) return;
    setOtp('');
    setDialogState('idle');
    setDialogOpen(true);
  }

  function closeDialog() {
    if (dialogState === 'validating' || dialogState === 'processing' || dialogState === 'submitting') return;
    setDialogOpen(false);
  }

  async function handleConfirm() {
    if (otp.length !== 6) return;
    setDialogState('validating');
    await new Promise((r) => setTimeout(r, 800));
    setDialogState('processing');
    await new Promise((r) => setTimeout(r, 800));
    setDialogState('submitting');

    const accountDetails =
      selectedAccount.type === 'crypto'
        ? { type: 'crypto', address: selectedAccount.address, network: selectedAccount.network }
        : { type: 'bank', bankName: selectedAccount.bankName, accountNumber: selectedAccount.accountNumber };

    try {
      const res = await fetch('/api/withdrawals/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method: selectedAccount.type, accountDetails }),
      });
      if (res.ok) {
        setDialogState('success');
        setStats((prev) => ({ ...prev, balance: prev.balance - amount }));
        const data = await res.json();
        setRecentWithdrawals((prev) => [data.transaction, ...prev].slice(0, 20));
      } else {
        setDialogState('idle');
      }
    } catch {
      setDialogState('idle');
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const btnLabel =
    dialogState === 'validating'
      ? 'Validating...'
      : dialogState === 'processing'
      ? 'Processing...'
      : dialogState === 'submitting'
      ? 'Submitting...'
      : 'Confirm Withdrawal';

  const isLoading = dialogState === 'validating' || dialogState === 'processing' || dialogState === 'submitting';

  if (kycStatus === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (kycStatus !== 'approved') {
    const isPending = kycStatus === 'pending';
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border p-8 text-center"
            style={{ background: '#0d0d0d', borderColor: isPending ? 'rgba(234,179,8,0.3)' : 'rgba(239,68,68,0.25)' }}>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: isPending ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)' }}>
              <Shield className="h-8 w-8" style={{ color: isPending ? '#eab308' : '#ef4444' }} />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">
              {isPending ? 'KYC Under Review' : 'KYC Verification Required'}
            </h2>
            <p className="mb-6 text-sm text-slate-400">
              {isPending
                ? 'Your identity verification is currently being reviewed by our team. Withdrawals will be unlocked once approved (usually within 24–48 hours).'
                : 'You must complete identity verification (KYC) before you can make withdrawals. This ensures the security of your funds.'}
            </p>
            {!isPending && (
              <Link
                href="/dashboard/kyc"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: '#f97316' }}
              >
                <Shield className="h-4 w-4" /> Start KYC Verification
              </Link>
            )}
            {isPending && (
              <div className="rounded-xl px-4 py-3 text-sm text-amber-300"
                style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)' }}>
                We'll notify you by email when your verification is complete.
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        {/* header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>Withdraw Funds</h1>
            <span
              style={{
                background: 'rgba(234,179,8,0.15)',
                border: '1px solid rgba(234,179,8,0.3)',
                color: '#eab308',
                borderRadius: 20,
                padding: '2px 10px',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              Secure
            </span>
            <span
              style={{
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#22c55e',
                borderRadius: 20,
                padding: '2px 10px',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              Verified
            </span>
          </div>
          <p style={{ color: '#a1a1aa', margin: 0, fontSize: 14 }}>
            Withdraw funds securely to your registered accounts
          </p>
        </div>

        {/* grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="withdraw-grid">
          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Account Overview */}
            <Card style={{ padding: 20 }}>
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 16, margin: '0 0 16px' }}>
                Account Overview
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <StatCard
                  icon={<DollarSign size={16} />}
                  label="Available Balance"
                  value={fmt(stats.balance)}
                  color="var(--primary, #f97316)"
                />
                <StatCard
                  icon={<TrendingDown size={16} />}
                  label="Total Withdrawn"
                  value={fmt(stats.totalWithdrawals)}
                  color="#ef4444"
                />
                <StatCard
                  icon={<Clock size={16} />}
                  label="Pending"
                  value={fmt(stats.pendingWithdrawals)}
                  color="#eab308"
                />
                <StatCard
                  icon={<ArrowUpFromLine size={16} />}
                  label="This Month"
                  value={fmt(stats.withdrawalsThisMonth)}
                  color="var(--primary, #f97316)"
                />
              </div>
            </Card>

            {/* Select Withdrawal Account */}
            <Card style={{ padding: 20 }}>
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 16, margin: '0 0 16px' }}>
                Select Withdrawal Account
              </h3>

              {/* dropdown */}
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <button
                  onClick={() => setDropdownOpen((p) => !p)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{selectedAccount.icon}</span>
                    {selectedAccount.name}
                  </span>
                  <ChevronDown size={16} color="#a1a1aa" />
                </button>

                {dropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 50,
                      background: '#1c1c1e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      marginTop: 4,
                      overflow: 'hidden',
                    }}
                  >
                    {ACCOUNTS.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          setSelectedAccount(acc);
                          setDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          background: selectedAccount.id === acc.id ? 'rgba(249,115,22,0.1)' : 'transparent',
                          border: 'none',
                          padding: '10px 14px',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: 'pointer',
                          fontSize: 14,
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{acc.icon}</span>
                        <span>{acc.name}</span>
                        {acc.type === 'crypto' && (
                          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#a1a1aa' }}>{acc.network}</span>
                        )}
                        {acc.type === 'bank' && (
                          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#a1a1aa' }}>{acc.accountNumber}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* account preview */}
              <div
                style={{
                  background: 'rgba(249,115,22,0.05)',
                  border: '1px solid rgba(249,115,22,0.2)',
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(249,115,22,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                    }}
                  >
                    {selectedAccount.icon}
                  </span>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{selectedAccount.name}</div>
                    <div style={{ color: '#a1a1aa', fontSize: 12 }}>
                      {selectedAccount.type === 'crypto' ? selectedAccount.network : selectedAccount.accountNumber}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 24 }}>
                  <div>
                    <div style={{ color: '#a1a1aa', fontSize: 12, marginBottom: 2 }}>Processing Time</div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{selectedAccount.processingTime}</div>
                  </div>
                  <div>
                    <div style={{ color: '#a1a1aa', fontSize: 12, marginBottom: 2 }}>Fee</div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{selectedAccount.fee}</div>
                  </div>
                </div>

                {selectedAccount.type === 'crypto' && selectedAccount.address && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ color: '#a1a1aa', fontSize: 12, marginBottom: 4 }}>Wallet Address</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#d4d4d8', fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {selectedAccount.address}
                      </span>
                      <button
                        onClick={() => handleCopy(selectedAccount.address!)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: copied ? '#22c55e' : '#a1a1aa',
                          flexShrink: 0,
                          padding: 0,
                        }}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Withdrawal Amount */}
            <Card style={{ padding: 20 }}>
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 16, margin: '0 0 6px' }}>
                Withdrawal Amount
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: 13, margin: '0 0 16px' }}>
                Available balance: <span style={{ color: '#fff', fontWeight: 600 }}>${fmt(stats.balance)}</span>
              </p>

              {/* quick select */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                {QUICK_AMOUNTS.map((v) => (
                  <button
                    key={v}
                    onClick={() => handleQuick(v)}
                    style={{
                      background: quickAmount === v ? 'rgba(249,115,22,0.2)' : 'rgba(0,0,0,0.35)',
                      border: `1px solid ${quickAmount === v ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 8,
                      padding: '8px 0',
                      color: quickAmount === v ? '#f97316' : '#d4d4d8',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    ${v.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* custom input */}
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#a1a1aa',
                    fontSize: 14,
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  placeholder="Enter custom amount"
                  value={customAmount}
                  onChange={(e) => handleCustom(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    padding: '10px 12px 10px 28px',
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                onClick={openDialog}
                disabled={!amount || amount <= 0 || amount > stats.balance}
                style={{
                  width: '100%',
                  background: !amount || amount <= 0 || amount > stats.balance ? '#3f3f46' : '#f97316',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 0',
                  color: !amount || amount <= 0 || amount > stats.balance ? '#71717a' : '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: !amount || amount <= 0 || amount > stats.balance ? 'not-allowed' : 'pointer',
                }}
              >
                Continue Withdrawal
              </button>
            </Card>

            {/* Recent Withdrawals */}
            <Card style={{ padding: 20 }}>
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 16, margin: '0 0 16px' }}>
                Recent Withdrawals
              </h3>

              {recentWithdrawals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#71717a', fontSize: 14 }}>
                  No withdrawals yet
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['Transaction', 'Amount', 'Method', 'Status', 'Date'].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: '8px 12px',
                              textAlign: 'left',
                              color: '#71717a',
                              fontSize: 12,
                              fontWeight: 500,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentWithdrawals.map((w) => (
                        <tr key={w._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '12px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: '50%',
                                  background: 'rgba(239,68,68,0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <ArrowUpFromLine size={14} color="#ef4444" />
                              </span>
                              <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>Withdrawal</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 12px' }}>
                            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                              ${fmt(w.amount)}
                            </div>
                            <div style={{ color: '#71717a', fontSize: 11 }}>Fee included</div>
                          </td>
                          <td style={{ padding: '12px 12px', color: '#a1a1aa', fontSize: 13 }}>
                            {w.accountDetails?.network ?? w.accountDetails?.bankName ?? w.method ?? 'Crypto'}
                          </td>
                          <td style={{ padding: '12px 12px' }}>
                            <span
                              style={{
                                background: `${statusColor(w.status)}20`,
                                color: statusColor(w.status),
                                borderRadius: 20,
                                padding: '2px 8px',
                                fontSize: 12,
                                fontWeight: 500,
                              }}
                            >
                              {statusLabel(w.status)}
                            </span>
                          </td>
                          <td style={{ padding: '12px 12px', color: '#a1a1aa', fontSize: 13 }}>
                            {fmtDate(w.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Withdrawal Process */}
            <Card style={{ padding: 20 }}>
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 16, margin: '0 0 16px' }}>
                Withdrawal Process
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { step: 1, title: 'Select Account', desc: 'Choose your withdrawal account and method' },
                  { step: 2, title: 'Enter Amount', desc: 'Specify the amount you want to withdraw' },
                  { step: 3, title: 'Verify OTP', desc: 'Confirm with your 6-digit verification code' },
                  { step: 4, title: 'Processing', desc: 'Funds transferred to your account' },
                ].map(({ step, title, desc }) => (
                  <div key={step} style={{ display: 'flex', gap: 12 }}>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'rgba(249,115,22,0.2)',
                        border: '1px solid rgba(249,115,22,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#f97316',
                        flexShrink: 0,
                      }}
                    >
                      {step}
                    </span>
                    <div>
                      <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{title}</div>
                      <div style={{ color: '#a1a1aa', fontSize: 12, marginTop: 2 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Security Tips */}
            <Card style={{ padding: 20 }}>
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 16, margin: '0 0 16px' }}>
                Security Tips
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: <CheckCircle size={15} color="#22c55e" />, text: 'Always verify the withdrawal address before confirming' },
                  { icon: <CheckCircle size={15} color="#22c55e" />, text: 'Never share your OTP with anyone' },
                  { icon: <CheckCircle size={15} color="#22c55e" />, text: 'Withdrawals are processed within 24-48 hours' },
                  { icon: <AlertTriangle size={15} color="#eab308" />, text: 'Contact support for amounts over $10,000' },
                ].map(({ icon, text }, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ marginTop: 1, flexShrink: 0 }}>{icon}</span>
                    <span style={{ color: '#a1a1aa', fontSize: 13 }}>{text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── CONFIRM DIALOG ── */}
      {dialogOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16,
          }}
          onClick={closeDialog}
        >
          <div
            style={{
              background: '#18181b',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: 28,
              width: '100%',
              maxWidth: 440,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {dialogState === 'success' ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'rgba(34,197,94,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <CheckCircle size={32} color="#22c55e" />
                </div>
                <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>
                  Withdrawal Submitted
                </h3>
                <p style={{ color: '#a1a1aa', fontSize: 14, margin: '0 0 24px' }}>
                  Your withdrawal request has been submitted and is being processed.
                </p>
                <button
                  onClick={() => {
                    setDialogOpen(false);
                    setQuickAmount(null);
                    setCustomAmount('');
                  }}
                  style={{
                    width: '100%',
                    background: '#f97316',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 0',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>
                    Confirm Withdrawal
                  </h3>
                  <button
                    onClick={closeDialog}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a1a1aa', padding: 0 }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* summary */}
                <div
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 20,
                  }}
                >
                  {[
                    { label: 'Amount', value: `$${fmt(amount)}` },
                    { label: 'Fee', value: selectedAccount.fee },
                    { label: 'To', value: selectedAccount.name },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                      }}
                    >
                      <span style={{ color: '#a1a1aa', fontSize: 14 }}>{label}</span>
                      <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* OTP */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: '#d4d4d8', fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 8 }}>
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.35)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      padding: '12px 16px',
                      color: '#fff',
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: '0.25em',
                      textAlign: 'center',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <p style={{ color: '#71717a', fontSize: 12, marginTop: 6 }}>
                    Enter the OTP sent to your registered email
                  </p>
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={otp.length !== 6 || isLoading}
                  style={{
                    width: '100%',
                    background: otp.length !== 6 || isLoading ? '#3f3f46' : '#f97316',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 0',
                    color: otp.length !== 6 || isLoading ? '#71717a' : '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: otp.length !== 6 || isLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {btnLabel}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 1280px) {
          .withdraw-grid {
            grid-template-columns: 2fr 1fr !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
