'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

declare global { interface Window { TradingView: any; } }
import {
  TrendingUp, ArrowDownToLine, ArrowUpFromLine, Eye, EyeOff,
  Gift, Users, Briefcase, Activity, Copy, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalEarnings: number;
  referralCode: string;
}

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

interface Transaction {
  _id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: string;
  createdAt: string;
}

interface Investment {
  _id: string;
  planName: string;
  amount: number;
  roiPercent: number;
  earnings: number;
  status: string;
  startDate: string;
  endDate: string;
}

const COIN_LOGOS: Record<string, string> = {
  BTC: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400',
  ETH: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628',
  USDT: 'https://coin-images.coingecko.com/coins/images/325/large/Tether.png?1696501661',
  XRP: 'https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png?1696501442',
  SOL: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1696504756',
  BNB: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1696501970',
};

const SPARKLINE = 'M0,15 C20,5 40,25 60,15 S80,5 100,15';

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [slide, setSlide] = useState(0);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const DISPLAY_COINS = ['BTC', 'ETH', 'USDT', 'XRP'];

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setUser(d.user); });
    fetch('/api/prices').then(r => r.json()).then(d => { if (d.prices) setPrices(d.prices); });
    fetch('/api/investments').then(r => r.json()).then(d => { if (d.investments) setInvestments(d.investments); });

    Promise.all([
      fetch('/api/deposits').then(r => r.json()),
      fetch('/api/withdrawals').then(r => r.json()),
    ]).then(([dep, wit]) => {
      const all: Transaction[] = [
        ...(dep.deposits || []).map((d: Transaction) => ({ ...d, type: 'deposit' as const })),
        ...(wit.withdrawals || []).map((w: Transaction) => ({ ...w, type: 'withdrawal' as const })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(all.slice(0, 5));
    });
  }, []);

  // Carousel auto-advance
  useEffect(() => {
    slideTimer.current = setInterval(() => setSlide(s => (s + 1) % DISPLAY_COINS.length), 5000);
    return () => { if (slideTimer.current) clearInterval(slideTimer.current); };
  }, []);

  const cryptos = DISPLAY_COINS.map(sym => prices.find(p => p.symbol === sym)).filter(Boolean) as CryptoPrice[];

  useEffect(() => {
    function createDashChart() {
      const el = document.getElementById('tv-dashboard-chart');
      if (!el) return;
      el.innerHTML = '';
      new window.TradingView.widget({
        autosize: true,
        symbol: 'COINBASE:BTCUSD',
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#0e0e0e',
        hide_side_toolbar: true,
        withdateranges: false,
        allow_symbol_change: true,
        enable_publishing: false,
        save_image: false,
        container_id: 'tv-dashboard-chart',
      });
    }
    if (typeof window.TradingView !== 'undefined') { createDashChart(); return; }
    const existing = document.querySelector('script[src*="tradingview.com/tv.js"]');
    if (existing) {
      const id = setInterval(() => { if (typeof window.TradingView !== 'undefined') { clearInterval(id); createDashChart(); } }, 100);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = createDashChart;
    document.head.appendChild(script);
  }, []);

  const copyReferral = () => {
    if (!user) return;
    const link = `${window.location.origin}/signup?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied!');
  };

  const statusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'approved' || s === 'completed') {
      return 'bg-emerald-900/20 text-emerald-400 border border-emerald-800';
    }
    if (s === 'pending') return 'bg-amber-900/20 text-amber-400 border border-amber-800';
    return 'bg-red-900/20 text-red-400 border border-red-800';
  };

  const typeBadge = (type: string) =>
    type === 'deposit'
      ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-800'
      : 'bg-red-900/20 text-red-400 border border-red-800';

  const statCardStyle = {
    background: '#0e0e0e',
    border: '1px solid #27272a',
    borderRadius: '4px',
    padding: '10px 12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const statIconStyle = {
    background: 'rgba(252,73,54,0.1)',
    borderRadius: '50%',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <DashboardLayout>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-7">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Welcome Back, {user?.firstName || '—'}
          </h2>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: '#71717a' }}>
            Here&apos;s a quick overview of your account
          </p>
        </div>
        <Link
          href="/dashboard/deposit"
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
          style={{ background: 'var(--primary)' }}
        >
          <ArrowDownToLine size={15} />
          Quick Deposit
        </Link>
      </div>

      {/* ── Balance + Stats ── */}
      <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Account Balance card */}
        <div
          className="rounded-md p-3 sm:p-4 lg:p-5 w-full xl:min-w-[22rem] xl:max-w-[22rem]"
          style={{ background: '#0e0e0e', border: '1px solid #27272a' }}
        >
          <h2 className="text-base sm:text-lg font-semibold text-white">Account Balance</h2>
          <p className="text-xs sm:text-[13px] -mt-0.5" style={{ color: '#71717a' }}>
            Your current available balance
          </p>

          <div className="flex items-center gap-2 mt-3 sm:mt-4 mb-1.5">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              {showBalance
                ? `$${user ? fmt(user.balance) : '0.00'}`
                : '••••••••'}
            </p>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="transition-colors hover:text-white"
              style={{ color: '#71717a' }}
            >
              {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <span className="inline-block text-xs rounded-lg px-2 py-1 bg-green-900/20 text-green-400">
            Available for withdrawal
          </span>
          <p className="text-xs mt-2 sm:mt-3" style={{ color: '#71717a' }}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="flex mt-4 sm:mt-5 w-full gap-2">
            <button
              onClick={() => router.push('/dashboard/withdraw')}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border px-3 h-8 text-xs sm:text-sm font-medium transition-all hover:scale-105 active:scale-95"
              style={{ borderColor: '#166534', color: '#4ade80', background: 'transparent' }}
            >
              <ArrowUpFromLine size={14} className="mr-1" />
              Withdraw
            </button>
            <button
              onClick={() => router.push('/dashboard/deposit')}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-3 h-8 text-xs sm:text-sm font-medium text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--primary)' }}
            >
              <ArrowDownToLine size={14} className="mr-1" />
              Deposit
            </button>
          </div>
        </div>

        {/* 2×2 Stat cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
          {/* Total Profit */}
          <div style={statCardStyle} className="group">
            <div className="flex mb-2 sm:mb-3 items-center justify-between">
              <h2 className="text-xs sm:text-sm" style={{ color: '#a1a1aa' }}>Total Profit</h2>
              <div style={statIconStyle}>
                <TrendingUp size={14} style={{ color: 'var(--primary)' }} />
              </div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              ${user ? fmt(user.totalEarnings) : '0.00'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#22c55e' }}>+2.5% Last period</p>
          </div>

          {/* Bonus */}
          <div style={statCardStyle} className="group">
            <div className="flex mb-2 sm:mb-3 items-center justify-between">
              <h2 className="text-xs sm:text-sm" style={{ color: '#a1a1aa' }}>Bonus</h2>
              <div style={statIconStyle}>
                <Gift size={14} style={{ color: 'var(--primary)' }} />
              </div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">$0.00</p>
            <p className="text-xs mt-0.5" style={{ color: '#22c55e' }}>+2.5% Last period</p>
          </div>

          {/* Total Deposit */}
          <div style={statCardStyle} className="group">
            <div className="flex mb-2 sm:mb-3 items-center justify-between">
              <h2 className="text-xs sm:text-sm" style={{ color: '#a1a1aa' }}>Total Deposit</h2>
              <div style={statIconStyle}>
                <ArrowDownToLine size={14} style={{ color: 'var(--primary)' }} />
              </div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              ${user ? fmt(user.totalDeposited) : '0.00'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#22c55e' }}>+2.5% Last period</p>
          </div>

          {/* Total Withdrawal */}
          <div style={statCardStyle} className="group">
            <div className="flex mb-2 sm:mb-3 items-center justify-between">
              <h2 className="text-xs sm:text-sm" style={{ color: '#a1a1aa' }}>Total Withdrawal</h2>
              <div style={statIconStyle}>
                <ArrowUpFromLine size={14} style={{ color: 'var(--primary)' }} />
              </div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              ${user ? fmt(user.totalWithdrawn) : '0.00'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#22c55e' }}>+2.5% Last period</p>
          </div>
        </div>
      </div>

      {/* ── Bottom grid: left (2/3) + right (1/3) ── */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {/* ── Left column ── */}
        <div className="md:col-span-2 space-y-4 min-w-0">

          {/* Market Overview carousel */}
          <div
            className="rounded-md overflow-hidden"
            style={{ border: '1px solid #27272a', background: '#0e0e0e' }}
          >
            <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-b" style={{ borderColor: '#27272a' }}>
              <h3 className="text-sm sm:text-base font-bold text-white">Market Overview</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSlide(s => (s - 1 + DISPLAY_COINS.length) % DISPLAY_COINS.length)}
                  className="h-7 w-7 flex items-center justify-center rounded border transition-colors hover:bg-white/10"
                  style={{ borderColor: '#27272a', color: '#71717a' }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setSlide(s => (s + 1) % DISPLAY_COINS.length)}
                  className="h-7 w-7 flex items-center justify-center rounded border transition-colors hover:bg-white/10"
                  style={{ borderColor: '#27272a', color: '#71717a' }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div className="p-2 sm:p-4 overflow-hidden">
              <div
                className="flex gap-2 sm:gap-3 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${slide * 100}%)` }}
              >
                {(cryptos.length > 0 ? cryptos : DISPLAY_COINS.map(s => ({ symbol: s, name: s, price: 0, change24h: 0 }))).map((coin) => (
                  <div
                    key={coin.symbol}
                    className="rounded-xl border p-3 sm:p-4 flex-shrink-0 w-full"
                    style={{ border: '1px solid #27272a', background: 'rgba(255,255,255,0.02)' }}
                  >
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <img
                        src={COIN_LOGOS[coin.symbol] || ''}
                        alt={coin.name}
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div>
                        <div className="font-medium text-sm text-white">{coin.name}</div>
                        <div className="text-xs" style={{ color: '#71717a' }}>{coin.symbol}</div>
                      </div>
                      <span
                        className="ml-auto text-xs px-2 py-0.5 rounded-full flex items-center gap-0.5"
                        style={{
                          background: coin.change24h >= 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: coin.change24h >= 0 ? '#4ade80' : '#f87171',
                        }}
                      >
                        {coin.change24h >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                        {Math.abs(coin.change24h).toFixed(2)}%
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-xs" style={{ color: '#71717a' }}>Price</span>
                        <span className="text-xs" style={{ color: '#71717a' }}>24h Change</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-sm text-white">
                          ${coin.price >= 1 ? coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : coin.price.toFixed(4)}
                        </span>
                        <span
                          className="text-sm"
                          style={{ color: coin.change24h >= 0 ? '#4ade80' : '#f87171' }}
                        >
                          {coin.change24h >= 0 ? '+' : ''}{(coin.price * coin.change24h / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="h-8 sm:h-10 w-full">
                      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
                        <path d={SPARKLINE} stroke="#4A9D7F" strokeWidth="1.5" fill="none" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
              {/* Dots */}
              <div className="flex justify-center gap-1 mt-3">
                {DISPLAY_COINS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === slide ? '1.5rem' : '0.4rem',
                      background: i === slide ? 'var(--primary)' : '#3f3f46',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Active Plans */}
          <div
            className="rounded-md overflow-hidden"
            style={{ border: '1px solid #27272a', background: '#0e0e0e' }}
          >
            <div className="flex items-center justify-between border-b px-3 sm:px-5 py-3 sm:py-4" style={{ borderColor: '#27272a' }}>
              <h3 className="text-sm sm:text-base font-bold text-white">Active Plans</h3>
              <button
                onClick={() => router.push('/dashboard/investments')}
                className="text-xs px-3 py-1.5 rounded-md font-medium text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: 'var(--primary)' }}
              >
                View All Plans
              </button>
            </div>
            <div className="p-3 sm:p-5">
              {investments.filter(i => i.status === 'active').length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <div
                    className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ background: '#1c1c1c' }}
                  >
                    <Briefcase size={32} style={{ color: '#52525b' }} />
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-white mb-2">No Active Plans</h4>
                  <p className="text-xs sm:text-sm mb-4 max-w-sm mx-auto" style={{ color: '#71717a' }}>
                    Start your investment journey by choosing from our carefully curated investment plans
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                    <button
                      onClick={() => router.push('/dashboard/investments')}
                      className="inline-flex items-center gap-2 justify-center rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium text-white transition-all hover:scale-105"
                      style={{ background: 'var(--primary)' }}
                    >
                      <ArrowDownToLine size={14} />
                      Start Investing
                    </button>
                    <button
                      onClick={() => router.push('/dashboard/investments')}
                      className="inline-flex items-center gap-2 justify-center rounded-md border px-3 py-1.5 text-xs sm:text-sm font-medium transition-all hover:scale-105"
                      style={{ borderColor: '#27272a', color: '#a1a1aa' }}
                    >
                      View Plans
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {investments.filter(i => i.status === 'active').map((inv) => (
                    <div
                      key={inv._id}
                      className="flex items-center justify-between rounded-lg p-3"
                      style={{ background: '#141414', border: '1px solid #27272a' }}
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{inv.planName}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>
                          Ends {new Date(inv.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-400">+${fmt(inv.earnings)}</p>
                        <p className="text-xs" style={{ color: '#71717a' }}>{inv.roiPercent}% ROI</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chart Overview */}
          <div
            className="rounded-md overflow-hidden"
            style={{ border: '1px solid #27272a', background: '#0e0e0e' }}
          >
            <div
              id="tv-dashboard-chart"
              className="h-[300px] md:h-[340px]"
              style={{ background: '#0e0e0e' }}
            />
          </div>

          {/* Recent Transactions */}
          <div
            className="rounded-md overflow-hidden"
            style={{ border: '1px solid #27272a', background: '#0e0e0e' }}
          >
            <div className="flex items-center justify-between border-b px-3 sm:px-5 py-3" style={{ borderColor: '#27272a' }}>
              <h3 className="text-sm sm:text-base font-semibold text-white">Recent Transactions</h3>
              <button
                onClick={() => router.push('/dashboard/transactions')}
                className="text-xs px-3 py-1.5 rounded-md font-medium text-white transition-all hover:scale-105"
                style={{ background: 'var(--primary)' }}
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b"
                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: '#27272a' }}
                  >
                    {['Transaction', 'Type', 'Amount', 'Status', 'Date'].map((h) => (
                      <th
                        key={h}
                        className="h-10 sm:h-12 px-3 sm:px-5 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wider"
                        style={{ color: '#71717a' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm" style={{ color: '#71717a' }}>
                        No transactions yet
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr
                        key={tx._id}
                        className="border-b transition-colors hover:bg-white/[0.02]"
                        style={{ borderColor: 'rgba(39,39,42,0.5)' }}
                      >
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div
                              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg"
                              style={{
                                background:
                                  tx.type === 'deposit'
                                    ? 'rgba(34,197,94,0.15)'
                                    : 'rgba(239,68,68,0.15)',
                              }}
                            >
                              {tx.type === 'deposit' ? (
                                <ArrowDownToLine size={14} className="text-emerald-400" />
                              ) : (
                                <ArrowUpFromLine size={14} className="text-red-400" />
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-white truncate max-w-[80px] sm:max-w-none">
                              {tx._id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge(tx.type)}`}>
                            {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <span className="text-sm font-semibold text-white">${fmt(tx.amount)}</span>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(tx.status)}`}>
                            {(tx.status || 'pending').charAt(0).toUpperCase() + (tx.status || 'pending').slice(1)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <div className="text-xs sm:text-sm" style={{ color: '#71717a' }}>
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-3 sm:space-y-4 min-w-0">
          {/* Platform Stats */}
          <div
            className="rounded-md overflow-hidden"
            style={{ border: '1px solid #27272a', background: '#0e0e0e' }}
          >
            <div className="border-b px-3 sm:px-4 py-3" style={{ borderColor: '#27272a' }}>
              <h3 className="font-bold text-sm text-white">Platform Stats</h3>
            </div>
            <div className="p-3 sm:p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm" style={{ color: '#71717a' }}>Platform Activity</span>
                  <span className="text-xs bg-blue-900/20 text-blue-400 px-2 py-0.5 rounded-full">Active</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: 'rgba(252,73,54,0.15)' }}>
                  <div
                    className="h-2 rounded-full"
                    style={{ width: '85%', background: 'linear-gradient(to right, var(--primary), rgba(252,73,54,0.7))' }}
                  />
                </div>
              </div>
              {[
                { icon: Users, color: 'text-green-500', bg: 'bg-green-900/20', label: 'Total Users', value: '12,458+' },
                { icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-900/20', label: 'Total Investments', value: '$35.1B+' },
                { icon: Activity, color: 'text-purple-400', bg: 'bg-purple-900/20', label: 'Server Uptime', value: '99.9%' },
              ].map(({ icon: Icon, color, bg, label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-full ${bg} flex items-center justify-center`}>
                      <Icon size={14} className={color} />
                    </div>
                    <span className="text-xs sm:text-sm" style={{ color: '#71717a' }}>{label}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Refer & Earn */}
          <div
            className="rounded-md overflow-hidden"
            style={{ border: '1px solid #27272a', background: '#0e0e0e' }}
          >
            <div className="flex items-center justify-between border-b px-3 sm:px-4 py-3" style={{ borderColor: '#27272a' }}>
              <h3 className="font-bold text-sm text-white">Refer &amp; Earn</h3>
              <Link
                href="/dashboard/referrals"
                className="text-xs px-3 py-1.5 rounded-md font-medium text-white transition-all hover:scale-105"
                style={{ background: 'var(--primary)' }}
              >
                More Details
              </Link>
            </div>
            <div className="p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users size={15} className="text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-xs sm:text-sm text-white">Earn Through Referrals</h4>
                  <p className="text-xs" style={{ color: '#71717a' }}>
                    Earn commission when someone signs up using your link
                  </p>
                </div>
              </div>

              <div className="mb-3 sm:mb-4">
                <label className="block text-xs mb-2" style={{ color: '#71717a' }}>Your Referral Link</label>
                <div className="flex rounded-lg overflow-hidden" style={{ background: '#141414' }}>
                  <input
                    readOnly
                    value={user ? `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${user.referralCode}` : ''}
                    className="flex-1 bg-transparent border-0 px-2 sm:px-3 py-2 text-xs text-white focus:outline-none truncate min-w-0"
                  />
                  <button
                    onClick={copyReferral}
                    className="px-2 sm:px-3 py-2 text-xs font-medium text-white flex items-center gap-1 flex-shrink-0 transition-colors"
                    style={{ background: 'linear-gradient(135deg, var(--primary), #e03f2a)' }}
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-2 sm:p-3" style={{ background: '#141414' }}>
                  <p className="text-xs mb-1" style={{ color: '#71717a' }}>Total Referrals</p>
                  <p className="text-base sm:text-lg xl:text-xl font-bold text-white">0</p>
                </div>
                <div className="rounded-lg p-2 sm:p-3" style={{ background: '#141414' }}>
                  <p className="text-xs mb-1" style={{ color: '#71717a' }}>Earnings</p>
                  <p className="text-base sm:text-lg xl:text-xl font-bold text-white">$0.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
