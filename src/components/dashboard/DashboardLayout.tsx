'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, User, Download, Upload, History, Briefcase,
  TrendingUp, BarChart3, Users, Shield, ChevronLeft,
  ChevronRight, LogOut, Menu, Bell, PieChart, Copy, MailWarning, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const navSections = [
  {
    title: 'Main',
    items: [
      { href: '/dashboard', icon: Home, label: 'Overview' },
      { href: '/dashboard/profile', icon: User, label: 'Profile' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { href: '/dashboard/deposit', icon: Download, label: 'Deposit' },
      { href: '/dashboard/withdraw', icon: Upload, label: 'Withdrawal' },
      { href: '/dashboard/transactions', icon: History, label: 'Transactions' },
    ],
  },
  {
    title: 'Investments',
    items: [
      { href: '/dashboard/investments', icon: Briefcase, label: 'Trading Plans' },
      { href: '/dashboard/active-plans', icon: PieChart, label: 'Active Plans' },
      // { href: '/dashboard/copy-trading', icon: TrendingUp, label: 'Copy Trading' }, // hidden until activated
    ],
  },
  {
    title: 'Services',
    items: [
      // { href: '/dashboard/stocks', icon: BarChart3, label: 'Stocks' }, // hidden until activated
      { href: '/dashboard/referrals', icon: Users, label: 'Referrals' },
      { href: '/dashboard/kyc', icon: Shield, label: 'KYC Verification' },
    ],
  },
];

const mobileNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/deposit', icon: Download, label: 'Deposit' },
  { href: '/dashboard/investments', icon: Briefcase, label: 'Plans' },
  { href: '/dashboard/transactions', icon: History, label: 'History' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
];

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
}

function SidebarContent({
  collapsed,
  setCollapsed,
  mobileClose,
  user,
  pathname,
  logout,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileClose: () => void;
  user: UserInfo | null;
  pathname: string;
  logout: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div
        className="flex items-center justify-between border-b px-3 py-4"
        style={{ borderColor: 'rgba(39,39,42,0.8)', minHeight: '3.5rem' }}
      >
        <Link href="/" className="flex items-center gap-2" onClick={mobileClose}>
          <TrendingUp size={18} style={{ color: 'var(--primary)' }} className="shrink-0" />
          {!collapsed && (
            <span className="text-base font-black tracking-tight">
              <span className="text-white">META</span>
              <span style={{ color: 'var(--primary)' }}>TRADING</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/10"
          style={{ color: '#71717a' }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <button
          className="lg:hidden h-6 w-6 flex items-center justify-center rounded"
          style={{ color: '#71717a' }}
          onClick={mobileClose}
        >
          ✕
        </button>
      </div>

      {/* Balance card */}
      {!collapsed && user && (
        <div
          className="mx-2 mt-3 mb-1 rounded-lg p-3"
          style={{ background: '#141414', border: '1px solid #27272a' }}
        >
          <p className="text-[11px] mb-1" style={{ color: '#71717a' }}>Account Balance</p>
          <p className="text-lg font-bold text-white">
            ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--primary)' }}>
            {user.firstName} {user.lastName}
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {navSections.map((section) => (
          <div key={section.title} className="mb-3">
            {!collapsed && (
              <p
                className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: '#52525b' }}
              >
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={mobileClose}
                  title={collapsed ? item.label : undefined}
                  className="mb-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150"
                  style={
                    active
                      ? { background: 'rgba(252,73,54,0.12)', color: 'var(--primary)' }
                      : { color: '#a1a1aa' }
                  }
                >
                  <Icon size={16} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer: user info + logout */}
      <div className="border-t p-2" style={{ borderColor: 'rgba(39,39,42,0.8)' }}>
        {user && !collapsed && (
          <div className="mb-1 flex items-center gap-2 rounded-md px-2 py-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: 'rgba(252,73,54,0.15)', color: 'var(--primary)' }}
            >
              {user.firstName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-[10px]" style={{ color: '#71717a' }}>
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          title={collapsed ? 'Logout' : undefined}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-red-900/20 hover:text-red-400"
          style={{ color: '#71717a' }}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user);
          setEmailVerified(d.user.isEmailVerified ?? false);
        }
      })
      .catch(() => {});
  }, []);

  async function resendVerification() {
    setResending(true);
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST' });
      const data = await res.json();
      if (res.ok) toast.success('Verification email sent! Check your inbox.');
      else toast.error(data.error || 'Failed to send email');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setResending(false);
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Logged out');
    window.location.href = '/login';
  };

  const sidebarProps = {
    collapsed,
    setCollapsed,
    mobileClose: () => setMobileOpen(false),
    user,
    pathname,
    logout,
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden lg:flex flex-col sticky top-0 h-screen shrink-0 overflow-hidden transition-all duration-300"
        style={{
          width: collapsed ? '3.5rem' : '15rem',
          background: '#0d0d0d',
          borderRight: '1px solid rgba(39,39,42,0.8)',
        }}
      >
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside
            className="absolute inset-y-0 left-0 flex w-60 flex-col"
            style={{ background: '#0d0d0d', borderRight: '1px solid rgba(39,39,42,0.8)' }}
          >
            <SidebarContent {...sidebarProps} collapsed={false} setCollapsed={() => {}} />
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between px-4"
          style={{ background: '#0d0d0d', borderBottom: '1px solid rgba(39,39,42,0.8)' }}
        >
          <button
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/10"
            style={{ color: '#71717a' }}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={19} />
          </button>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-2">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/10"
              style={{ color: '#71717a' }}
            >
              <Bell size={16} />
            </button>
            {user && (
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                  style={{ background: 'rgba(252,73,54,0.15)', color: 'var(--primary)' }}
                >
                  {user.firstName[0]}
                </div>
                <span className="hidden text-sm font-medium text-white sm:block">
                  {user.firstName}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Email verification banner */}
        {emailVerified === false && !bannerDismissed && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs"
            style={{ background: 'rgba(234,179,8,0.12)', borderBottom: '1px solid rgba(234,179,8,0.25)' }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <MailWarning size={15} className="text-amber-400 shrink-0" />
              <span className="text-amber-200">
                Please verify your email address to unlock all features.
              </span>
              <button
                onClick={resendVerification}
                disabled={resending}
                className="shrink-0 underline text-amber-300 hover:text-amber-100 disabled:opacity-50 transition-colors"
              >
                {resending ? 'Sending…' : 'Resend email'}
              </button>
            </div>
            <button onClick={() => setBannerDismissed(true)} className="shrink-0 text-amber-400 hover:text-amber-200">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Content wrapper */}
        <div
          className="flex flex-1 flex-col gap-3 p-2 sm:p-3 pt-2 pb-16 md:pb-3 min-h-0"
          style={{
            background:
              'linear-gradient(to right, rgba(237,87,23,0.015), rgba(228,72,29,0.025))',
          }}
        >
          <div
            className="rounded-md border p-3 sm:p-5 flex-1 overflow-auto"
            style={{
              borderColor: 'rgba(35,35,35,0.6)',
              background: 'rgba(0,0,0,0.35)',
            }}
          >
            {children}
          </div>
        </div>

        {/* Mobile bottom nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden"
          style={{ background: '#0d0d0d', borderTop: '1px solid rgba(39,39,42,0.8)' }}
        >
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors"
                style={{ color: active ? 'var(--primary)' : '#71717a' }}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
