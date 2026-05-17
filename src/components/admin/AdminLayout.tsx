'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, ArrowDownCircle, ArrowUpCircle,
  Settings, LogOut, Menu, X, Shield, Wallet, BadgeCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/deposits', icon: ArrowDownCircle, label: 'Deposits' },
  { href: '/admin/withdrawals', icon: ArrowUpCircle, label: 'Withdrawals' },
  { href: '/admin/kyc', icon: BadgeCheck, label: 'KYC Verifications' },
  { href: '/admin/plans', icon: Settings, label: 'Investment Plans' },
  { href: '/admin/wallets', icon: Wallet, label: 'Wallet Addresses' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.user || d.user.role !== 'admin') {
          router.replace(d.user ? '/dashboard' : '/login');
        } else {
          setChecking(false);
        }
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#020204' }}>
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--primary)' }} />
          <span className="text-sm" style={{ color: '#62748e' }}>Verifying access…</span>
        </div>
      </div>
    );
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Logged out');
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#020204' }}>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:inset-auto lg:translate-x-0`}
        style={{ background: '#03060d', borderRight: '1px solid #1d222b' }}
      >
        <div className="flex items-center justify-between border-b p-6" style={{ borderColor: '#1d222b' }}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'rgba(255,106,94,0.15)', border: '1px solid rgba(255,106,94,0.3)' }}>
              <Shield size={14} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Admin Panel</p>
              <p className="text-xs" style={{ color: '#62748e' }}>Meta Trading Option</p>
            </div>
          </div>
          <button className="lg:hidden" style={{ color: '#62748e' }} onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200"
                style={active
                  ? { background: 'rgba(255,106,94,0.1)', color: 'var(--primary)', border: '1px solid rgba(255,106,94,0.2)' }
                  : { color: '#62748e' }
                }
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4" style={{ borderColor: '#1d222b' }}>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-red-400/5 hover:text-red-400"
            style={{ color: '#62748e' }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 sm:px-6" style={{ background: '#03060d', borderColor: '#1d222b' }}>
          <button className="lg:hidden hover:text-white" style={{ color: '#62748e' }} onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-medium" style={{ color: '#62748e' }}>Administrator</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
