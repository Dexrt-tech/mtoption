'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Wallet, Save, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

interface Wallets {
  btc: string;
  eth: string;
  usdtBep20: string;
  usdtTrc20: string;
}

const COINS = [
  {
    key: 'btc' as keyof Wallets,
    label: 'Bitcoin',
    ticker: 'BTC',
    network: 'Bitcoin Network',
    color: '#f7931a',
    placeholder: 'bc1q… or 1… or 3…',
  },
  {
    key: 'eth' as keyof Wallets,
    label: 'Ethereum',
    ticker: 'ETH',
    network: 'ERC-20 / Ethereum Mainnet',
    color: '#627eea',
    placeholder: '0x…',
  },
  {
    key: 'usdtBep20' as keyof Wallets,
    label: 'USDT',
    ticker: 'BEP-20',
    network: 'Binance Smart Chain (BEP-20)',
    color: '#f0b90b',
    placeholder: '0x…',
  },
  {
    key: 'usdtTrc20' as keyof Wallets,
    label: 'USDT',
    ticker: 'TRC-20',
    network: 'Tron Network (TRC-20)',
    color: '#eb0029',
    placeholder: 'T…',
  },
];

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<Wallets>({ btc: '', eth: '', usdtBep20: '', usdtTrc20: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/wallets');
      const data = await res.json();
      if (data.wallets) {
        setWallets({
          btc:       data.wallets.btc       || '',
          eth:       data.wallets.eth        || '',
          usdtBep20: data.wallets.usdtBep20  || '',
          usdtTrc20: data.wallets.usdtTrc20  || '',
        });
      }
    } catch {
      toast.error('Failed to load wallet addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWallets(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/wallets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wallets),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to save'); return; }
      toast.success(data.message);
    } catch {
      toast.error('Failed to save wallet addresses');
    } finally {
      setSaving(false);
    }
  };

  const copyAddress = (address: string, key: string) => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Wallet Addresses</h1>
          <p className="text-sm" style={{ color: '#62748e' }}>
            Update the deposit addresses shown to users. Changes take effect immediately.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchWallets}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-white/5 disabled:opacity-50"
            style={{ borderColor: '#1d222b', color: '#62748e' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-6 flex items-start gap-3 rounded-xl p-4 border" style={{ background: 'rgba(255,106,94,0.06)', borderColor: 'rgba(255,106,94,0.2)' }}>
        <Wallet size={18} style={{ color: 'var(--primary)' }} className="mt-0.5 shrink-0" />
        <div className="text-sm" style={{ color: '#9ba3af' }}>
          <p className="font-semibold text-white mb-0.5">Live wallet addresses</p>
          <p>Any address you save here is instantly shown to users on the Deposit page when they select that payment method. Leave a field empty to hide that coin option.</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {COINS.map((coin) => {
          const value = wallets[coin.key];
          const isCopied = copied === coin.key;

          return (
            <div key={coin.key} className="card p-6 space-y-4">
              {/* Coin header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black"
                    style={{ background: `${coin.color}20`, border: `1px solid ${coin.color}40`, color: coin.color }}
                  >
                    {coin.ticker}
                  </div>
                  <div>
                    <p className="font-bold text-white">{coin.label}</p>
                    <p className="text-xs" style={{ color: '#62748e' }}>{coin.network}</p>
                  </div>
                </div>
                <div
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={value
                    ? { background: 'rgba(34,197,94,0.12)', color: '#22c55e' }
                    : { background: 'rgba(100,100,100,0.12)', color: '#62748e' }
                  }
                >
                  {value ? 'Active' : 'Not set'}
                </div>
              </div>

              {/* Address input */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#62748e' }}>
                  Wallet Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1 font-mono text-xs"
                    placeholder={coin.placeholder}
                    value={value}
                    onChange={(e) => setWallets(prev => ({ ...prev, [coin.key]: e.target.value }))}
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <button
                    onClick={() => copyAddress(value, coin.key)}
                    disabled={!value}
                    title="Copy address"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors disabled:opacity-30 hover:bg-white/5"
                    style={{ borderColor: '#1d222b', color: isCopied ? '#22c55e' : '#62748e' }}
                  >
                    {isCopied ? <CheckCircle size={15} /> : <Copy size={15} />}
                  </button>
                </div>
                {value && (
                  <p className="mt-1.5 truncate font-mono text-xs" style={{ color: '#62748e' }}>
                    {value}
                  </p>
                )}
              </div>

              {/* QR preview */}
              {value && (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="p-3 bg-white rounded-xl">
                    <QRCodeSVG value={value} size={120} bgColor="#ffffff" fgColor="#000000" level="M" marginSize={1} />
                  </div>
                  <p className="text-xs" style={{ color: '#62748e' }}>QR preview — exactly what users will scan</p>
                </div>
              )}

              {/* Save individual button */}
              <button
                onClick={async () => {
                  setSaving(true);
                  try {
                    const res = await fetch('/api/admin/wallets', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ [coin.key]: value }),
                    });
                    const data = await res.json();
                    if (!res.ok) { toast.error(data.error || 'Failed'); return; }
                    toast.success(`${coin.label} (${coin.ticker}) address saved`);
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="w-full rounded-lg border py-2 text-sm font-medium transition-all hover:bg-white/5 disabled:opacity-50"
                style={{ borderColor: `${coin.color}30`, color: coin.color }}
              >
                Save {coin.label} Address
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom save all */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="btn-primary flex items-center gap-2 px-8 disabled:opacity-50"
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving all addresses…' : 'Save All Addresses'}
        </button>
      </div>
    </AdminLayout>
  );
}
