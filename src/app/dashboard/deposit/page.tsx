'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  ArrowDownToLine, CreditCard, DollarSign, Shield, Wallet, TrendingUp,
  Lock, Eye, AlertTriangle, Clock, CheckCircle, Copy, Check,
  Upload, ArrowRight, Zap, Bitcoin, Building2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  type: 'crypto' | 'bank';
  name: string;
  currency?: string;
  address?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountType?: string;
  processingTime: string;
  fee: string;
}

interface DepositRecord {
  id: string;
  amount: string;
  method: string;
  status: 'Completed' | 'Processing' | 'Failed';
  date: string;
  time: string;
  txHash: string | null;
}

interface Stats { balance: number; totalProfit: number; totalDeposits: number; }

export default function DepositPage() {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [reviewDialog, setReviewDialog] = useState(false);

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState(true);

  const amount = customAmount || quickAmount;
  const activeMethod = methods.find(m => m.id === selectedMethod);

  useEffect(() => {
    fetch('/api/payment-methods')
      .then(r => r.ok ? r.json() : null)
      .then(d => setMethods(d?.paymentMethods ?? []))
      .catch(() => setMethods([]))
      .finally(() => setLoadingMethods(false));

    fetch('/api/dashboard/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setStats({ balance: d.balance ?? 0, totalProfit: d.totalProfit ?? 0, totalDeposits: d.totalDeposits ?? 0 }))
      .catch(() => {})
      .finally(() => setLoadingStats(false));

    loadDeposits();
  }, []);

  function loadDeposits() {
    fetch('/api/deposits')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        setDeposits((d?.deposits ?? []).slice(0, 5).map((dep: {
          _id: string; amount: number; paymentMethod?: string; currency?: string;
          status: string; createdAt: string; transactionHash?: string; txHash?: string;
        }) => ({
          id: dep._id.toString().slice(-8).toUpperCase(),
          amount: `$${Number(dep.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          method: dep.paymentMethod === 'crypto' ? `${dep.currency ?? 'Crypto'} Wallet` : 'Bank Transfer',
          status: dep.status === 'approved' ? 'Completed' : dep.status === 'pending' ? 'Processing' : 'Failed',
          date: new Date(dep.createdAt).toISOString().split('T')[0],
          time: new Date(dep.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          txHash: (dep.transactionHash || dep.txHash) ? `${(dep.transactionHash || dep.txHash)!.slice(0, 12)}...` : null,
        })));
      })
      .catch(() => setDeposits([]))
      .finally(() => setLoadingDeposits(false));
  }

  async function submitDeposit() {
    if (!proofFile || !activeMethod) return;
    if (!amount || parseFloat(amount) <= 0) { toast.error('Please enter a valid amount'); return; }

    setSubmitting(true);
    setSubmitStatus('Uploading proof of payment…');

    const MAX_ATTEMPTS = 4;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        if (attempt > 1) {
          setSubmitStatus(`Retrying… (attempt ${attempt} of ${MAX_ATTEMPTS})`);
          await new Promise(r => setTimeout(r, 3000));
        }

        const form = new FormData();
        form.append('proofOfPayment', proofFile);
        form.append('amount', amount);
        form.append('paymentMethod', activeMethod.type);
        form.append('currency', activeMethod.currency ?? 'USD');
        if (activeMethod.address) form.append('address', activeMethod.address);
        if (activeMethod.accountNumber) form.append('accountNumber', activeMethod.accountNumber);

        const res = await fetch('/api/deposits/submit', { method: 'POST', body: form });
        const data = await res.json().catch(() => ({}));

        // 500 = transient server/upload error — retry silently
        if (res.status === 500 && attempt < MAX_ATTEMPTS) continue;

        if (!res.ok) {
          toast.error(data.error ?? 'Failed to submit deposit');
          setSubmitting(false);
          setSubmitStatus('');
          return;
        }

        // Success
        setShowDialog(false);
        setSubmitted(true);
        setReviewDialog(true);
        setSelectedMethod('');
        setQuickAmount('');
        setCustomAmount('');
        setProofFile(null);
        loadDeposits();
        setTimeout(() => setSubmitted(false), 5000);
        setSubmitting(false);
        setSubmitStatus('');
        return;
      } catch {
        if (attempt < MAX_ATTEMPTS) continue;
        toast.error('Failed to submit deposit. Please try again.');
      }
    }

    setSubmitting(false);
    setSubmitStatus('');
  }

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-3 sm:gap-4 pb-20 lg:pb-4 max-w-full overflow-hidden">

        {/* Success alert */}
        {submitted && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-green-800 bg-green-900/20 text-green-200 text-xs sm:text-sm">
            <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Deposit submitted successfully!</strong> Your deposit of ${amount} is now under review.
              You'll receive a confirmation email once the transaction is processed. This typically takes 10–30 minutes for crypto deposits.
            </div>
          </div>
        )}

        {/* Page title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-100 flex items-center gap-2 sm:gap-3">
              <ArrowDownToLine className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
              Deposit Funds
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Add funds to your account using crypto or bank transfer</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800">
              <Shield className="w-3 h-3" /> Secure
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-zinc-700 text-slate-400">
              <Zap className="w-3 h-3" /> Instant
            </span>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">

          {/* Left — forms */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">

            {/* Select Payment Method */}
            <Card>
              <CardHeader icon={<CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />} title="Select Payment Method" desc="Choose how you want to deposit funds" />
              <div className="p-3 sm:p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {loadingMethods ? (
                    <p className="text-sm text-slate-500 col-span-full">Loading payment methods...</p>
                  ) : methods.length === 0 ? (
                    <p className="text-sm text-slate-500 col-span-full">No payment methods available.</p>
                  ) : methods.map(m => {
                    const Icon = m.type === 'crypto' ? Bitcoin : Building2;
                    const active = selectedMethod === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMethod(m.id)}
                        className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:border-orange-500/50 ${active ? 'border-orange-500 bg-orange-500/5' : 'border-zinc-800'}`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className={`p-1.5 sm:p-2 rounded-full ${m.type === 'crypto' ? 'bg-orange-900/30' : 'bg-blue-900/30'}`}>
                            <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${m.type === 'crypto' ? 'text-orange-400' : 'text-blue-400'}`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-xs sm:text-sm text-slate-200">{m.name}</h4>
                            <p className="text-xs text-slate-500">{m.type === 'crypto' ? `${m.currency} Wallet` : `${m.accountType ?? 'Bank'} Account`}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Processing Time:</span>
                            <span className="text-slate-300">{m.processingTime}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Fee:</span>
                            <span className="text-slate-300">{m.fee}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Deposit Amount */}
            <Card>
              <CardHeader icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />} title="Deposit Amount" desc="Select or enter the amount you want to deposit" />
              <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-300 mb-2 sm:mb-3 block">Quick Select</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2">
                    {[50, 100, 250, 500, 1000, 2500].map(v => (
                      <button
                        key={v}
                        onClick={() => { setQuickAmount(v.toString()); setCustomAmount(''); }}
                        className={`h-8 sm:h-12 text-xs sm:text-sm rounded-md border font-medium transition-colors ${quickAmount === v.toString() ? 'bg-orange-500 border-orange-500 text-white' : 'border-zinc-700 text-slate-300 hover:border-orange-500/50 hover:bg-zinc-800'}`}
                      >
                        ${v.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Custom Amount</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <input
                      type="number" min="10" max="50000"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={e => { setCustomAmount(e.target.value); setQuickAmount(''); }}
                      className="w-full h-12 pl-10 pr-4 text-base rounded-md border border-zinc-700 bg-zinc-800/60 text-slate-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <p className="flex items-center gap-1 text-sm text-slate-500">
                    Minimum: $10 • Maximum: $50,000 per transaction
                  </p>
                </div>

                {amount && (
                  <div className="p-3 sm:p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs sm:text-sm text-slate-500">Deposit Amount:</span>
                      <span className="font-medium text-sm sm:text-base text-slate-200">${amount}</span>
                    </div>
                    {activeMethod && (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs sm:text-sm text-slate-500">Processing Fee:</span>
                          <span className="font-medium text-sm sm:text-base text-slate-200">{activeMethod.fee}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-zinc-700">
                          <span className="text-xs sm:text-sm font-medium text-slate-300">You'll Receive:</span>
                          <span className="font-bold text-base sm:text-lg text-white">${amount}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => { if (!selectedMethod || !amount) { toast.error('Please select a payment method and enter an amount'); return; } setShowDialog(true); }}
                    disabled={!selectedMethod || !amount}
                    className="flex-1 h-10 sm:h-11 flex items-center justify-center gap-2 rounded-md bg-orange-500 text-sm sm:text-base font-medium text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" /> Continue
                  </button>
                  <button
                    onClick={() => { setSelectedMethod(''); setQuickAmount(''); setCustomAmount(''); }}
                    className="flex-1 h-10 sm:h-11 rounded-md border border-zinc-700 text-sm sm:text-base text-slate-300 hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4 sm:space-y-6">

            {/* Account Balance */}
            <Card>
              <CardHeader icon={<Wallet className="w-4 h-4 sm:w-5 sm:h-5" />} title="Account Balance" />
              <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                <div className="text-center">
                  <p className="text-xl sm:text-3xl font-bold text-slate-100">
                    {loadingStats ? '...' : fmt(stats?.balance ?? 0)}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">Available Balance</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="text-center p-2 sm:p-3 bg-zinc-800/50 rounded-lg">
                    <p className="text-sm sm:text-lg font-semibold text-green-400">{loadingStats ? '...' : fmt(stats?.totalProfit ?? 0)}</p>
                    <p className="text-xs text-slate-500">Total Profit</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-zinc-800/50 rounded-lg">
                    <p className="text-sm sm:text-lg font-semibold text-blue-400">{loadingStats ? '...' : fmt(stats?.totalDeposits ?? 0)}</p>
                    <p className="text-xs text-slate-500">Total Deposits</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Security Tips */}
            <Card>
              <CardHeader icon={<Shield className="w-4 h-4 sm:w-5 sm:h-5" />} title="Security Tips" />
              <div className="p-3 sm:p-6 space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-400">
                {[
                  { icon: <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mt-0.5 flex-shrink-0" />, text: 'Always verify the wallet address before sending funds' },
                  { icon: <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mt-0.5 flex-shrink-0" />, text: 'Double-check transaction details before confirming' },
                  { icon: <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mt-0.5 flex-shrink-0" />, text: 'Never share your private keys or seed phrases' },
                  { icon: <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 mt-0.5 flex-shrink-0" />, text: 'Contact support if you notice any suspicious activity' },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {tip.icon}
                    <p>{tip.text}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Deposit Process */}
            <Card>
              <CardHeader icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />} title="Deposit Process" />
              <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                {[
                  { n: 1, label: 'Select Payment Method', sub: 'Choose crypto or bank transfer', active: true },
                  { n: 2, label: 'Enter Amount', sub: 'Specify deposit amount', active: true },
                  { n: 3, label: 'Send Funds', sub: 'Transfer to provided address', active: true },
                  { n: 4, label: 'Confirmation', sub: 'Funds appear in your account', active: false },
                ].map(step => (
                  <div key={step.n} className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 ${step.active ? 'bg-orange-500 text-white' : 'bg-zinc-700 text-slate-400'}`}>
                      {step.n}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-200">{step.label}</p>
                      <p className="text-xs text-slate-500">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Deposits */}
        <Card className="mt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-6 border-b border-zinc-800 gap-3 sm:gap-0">
            <div>
              <h3 className="flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-200">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" /> Recent Deposits
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Your latest deposit transactions</p>
            </div>
            <button className="px-3 py-1.5 rounded-md border border-zinc-700 text-xs sm:text-sm text-slate-300 hover:bg-zinc-800 transition-colors bg-transparent h-8 sm:h-9">
              View All
            </button>
          </div>
          <div className="overflow-x-auto py-2 sm:py-4">
            <table className="w-full min-w-[540px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/40">
                  {['Transaction ID', 'Amount', 'Method', 'Status', 'Date'].map((h, i) => (
                    <th key={h} className={`h-8 sm:h-10 px-2 sm:px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingDeposits ? (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-500 text-sm">Loading recent deposits...</td></tr>
                ) : deposits.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-500 text-sm">No recent deposits</td></tr>
                ) : deposits.map(dep => (
                  <tr key={dep.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-2 sm:px-3 py-2 sm:py-3">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-900/20 group-hover:bg-emerald-900/30">
                          <ArrowDownToLine className="w-2 h-2 sm:w-3 sm:h-3 text-emerald-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-100 text-xs">{dep.id}</div>
                          {dep.txHash && <div className="text-xs text-slate-500 font-mono">{dep.txHash}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 font-semibold text-slate-100 text-xs sm:text-sm">{dep.amount}</td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-slate-400">{dep.method}</td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3">
                      <StatusBadge status={dep.status} />
                    </td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 text-right">
                      <div className="text-xs text-slate-400">{dep.date} <span className="text-slate-500">{dep.time}</span></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ── Complete Your Deposit dialog ── */}
      {showDialog && activeMethod && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => !submitting && setShowDialog(false)}
        >
          <div
            className="relative w-full max-w-md rounded-xl border border-zinc-800 shadow-2xl overflow-y-auto"
            style={{ background: '#0f0f0f', maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-zinc-800 p-4 sm:p-5">
              <h2 className="flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-100">
                <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" /> Complete Your Deposit
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Send ${amount} to the address below and upload proof of payment
              </p>
            </div>

            {/* Body */}
            <div className={`p-4 sm:p-5 space-y-3 sm:space-y-4 ${submitting ? 'pointer-events-none opacity-70' : ''}`}>

              {activeMethod.type === 'crypto' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-slate-300">{activeMethod.currency} Wallet Address</label>
                    <div className="flex items-center gap-2">
                      <input
                        value={activeMethod.address} readOnly
                        className="flex-1 font-mono text-xs h-8 sm:h-10 px-3 rounded-md border border-zinc-700 bg-zinc-800/60 text-slate-100"
                      />
                      <button
                        onClick={() => { navigator.clipboard.writeText(activeMethod.address ?? ''); toast.success('Address copied'); }}
                        className="h-8 sm:h-10 w-8 sm:w-10 flex items-center justify-center rounded-md border border-zinc-700 text-slate-400 hover:text-slate-200 hover:bg-zinc-800"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-white rounded-xl border border-zinc-700 shadow-lg">
                      <QRCodeSVG
                        value={activeMethod.address ?? ''}
                        size={148}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="M"
                        marginSize={1}
                      />
                    </div>
                    <p className="text-xs text-slate-500">Scan to get wallet address</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs sm:text-sm text-slate-500">Amount to Send:</span>
                      <span className="font-bold text-sm sm:text-lg text-white">${amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-slate-500">Network:</span>
                      <span className="text-xs sm:text-sm text-slate-300">{activeMethod.currency}</span>
                    </div>
                  </div>
                </>
              )}

              {activeMethod.type === 'bank' && (
                <>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-slate-300">Account Number</label>
                      <input value={activeMethod.accountNumber ?? ''} readOnly className="mt-1 w-full h-8 sm:h-10 px-3 text-xs sm:text-sm rounded-md border border-zinc-700 bg-zinc-800/60 text-slate-100" />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-slate-300">Routing Number</label>
                      <input value={activeMethod.routingNumber ?? ''} readOnly className="mt-1 w-full h-8 sm:h-10 px-3 text-xs sm:text-sm rounded-md border border-zinc-700 bg-zinc-800/60 text-slate-100" />
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs sm:text-sm text-slate-500">Transfer Amount:</span>
                      <span className="font-bold text-sm sm:text-lg text-white">${amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-slate-500">Reference:</span>
                      <span className="text-xs sm:text-sm font-mono text-slate-300">DEP-{Date.now().toString().slice(-6)}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Proof upload */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-slate-300">Upload Proof of Payment</label>
                <div className="border-2 border-dashed border-zinc-700 rounded-lg p-3 sm:p-4 text-center">
                  <input
                    type="file" accept="image/*,.pdf" id="proof-upload"
                    className="hidden" disabled={submitting}
                    onChange={e => { const f = e.target.files?.[0]; if (f) setProofFile(f); }}
                  />
                  <label htmlFor="proof-upload" className={`cursor-pointer ${submitting ? 'pointer-events-none' : ''}`}>
                    {proofFile ? (
                      <div className="flex items-center justify-center gap-2 text-green-400">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm font-medium">{proofFile.name}</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-slate-500" />
                        <p className="text-xs sm:text-sm text-slate-500">Click to upload screenshot or receipt</p>
                        <p className="text-xs text-slate-600">Supports: JPG, PNG, PDF (Max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={submitDeposit} disabled={!proofFile || submitting}
                  className="flex-1 h-9 sm:h-10 flex items-center justify-center gap-2 rounded-md bg-orange-500 text-xs sm:text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <><div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {submitStatus || 'Submitting…'}</>
                  ) : (
                    <><Check className="w-3 h-3 sm:w-4 sm:h-4" /> Submit Deposit</>
                  )}
                </button>
                <button
                  onClick={() => setShowDialog(false)} disabled={submitting}
                  className="flex-1 h-9 sm:h-10 rounded-md border border-zinc-700 text-xs sm:text-sm text-slate-300 hover:bg-zinc-800 bg-transparent disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-zinc-800/40 border border-zinc-700 text-xs text-slate-400">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 text-slate-500" />
                <p>Your deposit will be reviewed and processed within {activeMethod.processingTime}. You'll receive an email confirmation once completed.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Deposit Under Review dialog ── */}
      {reviewDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setReviewDialog(false)}
        >
          <div
            className="relative w-full max-w-md rounded-xl border border-zinc-800 p-5 sm:p-6 shadow-2xl overflow-y-auto"
            style={{ background: '#0f0f0f', maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-900/30 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-100">Deposit Under Review</h2>
                <p className="text-sm text-slate-500">Your deposit is being processed</p>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              <p className="text-sm text-slate-400">
                Your deposit of <span className="font-semibold text-slate-200">${amount}</span> via <span className="font-semibold text-slate-200">{activeMethod?.name ?? 'your chosen method'}</span> is currently under review.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                <span>Expected processing time: {activeMethod?.processingTime ?? 'a few minutes'}</span>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-zinc-800/40 border border-zinc-700 text-xs text-slate-400">
                <Shield className="w-3 h-3 mt-0.5 flex-shrink-0 text-slate-500" />
                <p>You'll receive a confirmation email once the transaction is processed and your funds are available.</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setReviewDialog(false)}
                className="px-5 py-2 rounded-md bg-orange-500 text-sm font-medium text-white hover:bg-orange-600"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// ── small shared components ───────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc?: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-3 sm:p-6 border-b border-zinc-800">
      <h3 className="flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-200">
        <span className="text-orange-400">{icon}</span> {title}
      </h3>
      {desc && <p className="text-xs sm:text-sm text-slate-500 ml-6">{desc}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: 'Completed' | 'Processing' | 'Failed' }) {
  const map = {
    Completed: { cls: 'bg-emerald-900/20 text-emerald-400 border-emerald-800', icon: <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" /> },
    Processing: { cls: 'bg-amber-900/20 text-amber-400 border-amber-800', icon: <Clock className="w-2 h-2 sm:w-3 sm:h-3 mr-1" /> },
    Failed: { cls: 'bg-red-900/20 text-red-400 border-red-800', icon: <AlertTriangle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" /> },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${s.cls}`}>
      {s.icon}{status}
    </span>
  );
}
