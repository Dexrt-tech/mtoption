'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  Briefcase,
  CheckCircle,
  ChevronDown,
  X,
  Shield,
  Lock,
  Award,
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  Zap,
  Star,
  Calculator,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── types ────────────────────────────────────────────────────────────────────

interface Plan {
  _id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  roiPercent: number;
  durationDays: number;
  description: string;
  features: string[];
  isActive: boolean;
}

// ─── static content ───────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'Choose Your Plan',
    desc: 'Select an investment plan that fits your budget and goals',
  },
  {
    step: 2,
    icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'Make Investment',
    desc: 'Deposit your investment amount securely through our platform',
  },
  {
    step: 3,
    icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'Earn Daily Returns',
    desc: 'Watch your investment grow with guaranteed daily returns',
  },
  {
    step: 4,
    icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'Withdraw Anytime',
    desc: 'Withdraw your profits daily or let them compound',
  },
];

const FAQ = [
  {
    q: 'How are returns calculated?',
    a: 'Returns are calculated based on your investment amount and the ROI percentage of your chosen plan. The total return is paid out at the end of the investment duration.',
  },
  {
    q: 'When can I withdraw my profits?',
    a: 'You can withdraw your profits after the investment period is complete. Withdrawal requests are processed within 24-48 hours.',
  },
  {
    q: 'How secure are my investments?',
    a: 'All investments are secured with bank-level SSL encryption. Our funds are fully insured and we are licensed and regulated by financial authorities.',
  },
  {
    q: "What's the minimum investment?",
    a: 'The minimum investment varies by plan. Our starter plans begin from as low as $100, making it accessible for all types of investors.',
  },
  {
    q: 'Can I compound my returns?',
    a: 'Yes! You can choose to reinvest your returns to benefit from compound growth. Simply select the compounding option when managing your active investments.',
  },
];

const TRUST = [
  { icon: <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />, title: 'SSL Encryption', desc: 'Bank-level security' },
  { icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />, title: 'Insured Funds', desc: 'Fully insured investments' },
  { icon: <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />, title: 'Licensed & Regulated', desc: 'Financial compliance' },
  { icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />, title: 'Trusted by Thousands', desc: '12,000+ satisfied investors' },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function dailyRate(plan: Plan) {
  return ((plan.roiPercent / plan.durationDays)).toFixed(2);
}

// ─── sub-components ───────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-lg border transition-colors"
      style={{ borderColor: open ? 'rgba(249,115,22,0.4)' : 'oklch(0.25 0.02 264.695)' }}
    >
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-medium text-slate-900 dark:text-white hover:bg-white/5 transition-colors"
      >
        {q}
        <ChevronDown
          className="h-5 w-5 shrink-0 text-primary transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── plan card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  index,
  total,
  onInvest,
}: {
  plan: Plan;
  index: number;
  total: number;
  onInvest: (plan: Plan) => void;
}) {
  const isPopular = total > 1 && index === Math.floor(total / 2);

  return (
    <div
      className="relative flex flex-col rounded-xl transition-all duration-200 hover:-translate-y-1"
      style={{
        background: '#111111',
        border: isPopular ? '1px solid #f97316' : '1px solid rgba(255,255,255,0.15)',
        boxShadow: isPopular
          ? '0 0 0 1px rgba(249,115,22,0.1), 0 8px 32px rgba(0,0,0,0.5)'
          : '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap"
            style={{ background: '#f97316', color: '#fff' }}
          >
            <Star className="w-2.5 h-2.5 fill-current" />
            Popular
          </span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3">
        <h3 className="text-sm font-bold text-white mb-0.5">{plan.name}</h3>
        <p className="text-xs" style={{ color: '#6b7280' }}>
          ${plan.minAmount.toLocaleString()} – ${plan.maxAmount.toLocaleString()}
        </p>
      </div>

      {/* Separator */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 16px' }} />

      {/* ── Stats ── */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#9ca3af' }}>Duration</span>
          <span className="text-xs font-semibold text-white">{plan.durationDays} days</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#9ca3af' }}>Daily</span>
          <span className="text-xs font-semibold" style={{ color: isPopular ? '#f97316' : '#22c55e' }}>
            {dailyRate(plan)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#9ca3af' }}>Total</span>
          <span className="text-xs font-bold" style={{ color: isPopular ? '#f97316' : '#22c55e' }}>
            {plan.roiPercent}%
          </span>
        </div>
      </div>

      {/* Separator */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 16px' }} />

      {/* ── Features ── */}
      {plan.features?.length > 0 && (
        <div className="px-4 py-3 space-y-2">
          {plan.features.map((f) => (
            <div key={f} className="flex items-center gap-2">
              <span
                className="shrink-0 rounded-full"
                style={{
                  width: 5,
                  height: 5,
                  background: isPopular ? '#f97316' : 'rgba(255,255,255,0.3)',
                  display: 'inline-block',
                }}
              />
              <span className="text-xs" style={{ color: '#9ca3af' }}>{f}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Button ── */}
      <div className="px-4 pb-4 mt-auto pt-3">
        <button
          onClick={() => onInvest(plan)}
          className="w-full py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={
            isPopular
              ? { background: '#f97316', color: '#fff', border: 'none' }
              : { background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }
          }
        >
          Choose Plan
        </button>
      </div>
    </div>
  );
}

// ─── invest dialog ────────────────────────────────────────────────────────────

function InvestDialog({
  plan,
  onClose,
  onSuccess,
}: {
  plan: Plan;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const numAmount = parseFloat(amount) || 0;
  const expectedReturn = numAmount > 0 ? numAmount * (plan.roiPercent / 100) : 0;
  const totalReturn = numAmount + expectedReturn;
  const isValid = numAmount >= plan.minAmount && numAmount <= plan.maxAmount;

  async function handleConfirm() {
    if (!isValid) return;
    setLoading(true);
    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan._id, amount: numAmount }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to activate plan');
        return;
      }
      toast.success(`${plan.name} plan activated successfully!`);
      onSuccess();
      onClose();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
        <div
          className="w-full max-w-md rounded-xl border bg-[#18181b] overflow-y-auto"
          style={{ maxHeight: '90vh', borderColor: 'rgba(255,255,255,0.1)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white">Invest in {plan.name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {plan.roiPercent}% ROI over {plan.durationDays} days
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          {/* Amount input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Investment Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={plan.minAmount.toString()}
                min={plan.minAmount}
                max={plan.maxAmount}
                className="w-full h-10 sm:h-11 pl-7 pr-4 rounded-md border bg-transparent text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                style={{ borderColor: amount && !isValid ? '#ef4444' : 'rgba(255,255,255,0.12)' }}
              />
            </div>
            <p
              className="text-xs mt-1.5"
              style={{ color: amount && !isValid ? '#ef4444' : '#71717a' }}
            >
              Min: ${plan.minAmount.toLocaleString()} · Max: ${plan.maxAmount.toLocaleString()}
            </p>
          </div>

          {/* Return preview */}
          {numAmount > 0 && (
            <div
              className="rounded-lg p-4 space-y-2.5"
              style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Investment Amount</span>
                <span className="text-white font-medium">${fmt(numAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expected Return ({plan.roiPercent}%)</span>
                <span className="text-emerald-400 font-medium">+${fmt(expectedReturn)}</span>
              </div>
              <div
                className="flex justify-between text-sm pt-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="font-semibold text-white">Total After {plan.durationDays} Days</span>
                <span className="font-bold text-white">${fmt(totalReturn)}</span>
              </div>
            </div>
          )}

          {/* Warning */}
          <p className="text-xs text-amber-400/80 flex items-start gap-2">
            <span className="mt-0.5 shrink-0">⚠</span>
            Amount will be deducted from your account balance immediately upon confirmation.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-10 sm:h-11 rounded-md border text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50"
              style={{ borderColor: 'rgba(255,255,255,0.12)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValid || loading}
              className="flex-1 h-10 sm:h-11 rounded-md text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: isValid && !loading ? '#f97316' : '#3f3f46',
                color: isValid && !loading ? '#fff' : '#71717a',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                'Confirm Investment'
              )}
            </button>
          </div>
          </div>
        </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function InvestmentsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);

  // Calculator state
  const [calcAmount, setCalcAmount] = useState('');
  const [calcPlanId, setCalcPlanId] = useState('');
  const calcPlan = plans.find((p) => p._id === calcPlanId) ?? null;
  const calcNum = parseFloat(calcAmount) || 0;
  const calcReturn = calcPlan && calcNum > 0 ? calcNum * (calcPlan.roiPercent / 100) : null;

  useEffect(() => {
    fetch('/api/plans')
      .then((r) => r.json())
      .then((d) => {
        if (d.plans) {
          setPlans(d.plans);
          if (d.plans.length > 0) setCalcPlanId(d.plans[0]._id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="flex dark:bg-gradient-to-r dark:from-[#ed571705] dark:to-[#e4481d09] flex-1 flex-col gap-4 p-2 sm:p-4 pt-0 pb-20 md:pb-4 w-full overflow-x-hidden">
        <div className="bg-transparent border border-[#cbcaca26] dark:border dark:border-[rgba(35,35,35,0.6)] dark:bg-[rgba(0,0,0,0.38)] backdrop-blur-[1.5px] min-h-[calc(100vh-8rem)] p-3 sm:p-6 flex-1 rounded-md md:min-h-min w-full overflow-x-hidden space-y-8 sm:space-y-10">

          {/* ── Page header ── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 sm:gap-3">
                <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                Investment Plans
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Choose the perfect plan to grow your wealth
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                <Shield className="w-3 h-3" />
                Secured
              </span>
            </div>
          </div>

          {/* ── Plan Cards ── */}
          <section>
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground text-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary" />
                Loading plans...
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-16">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}
                >
                  <Briefcase className="w-7 h-7 text-primary opacity-60" />
                </div>
                <p className="font-semibold text-white mb-1">No plans available</p>
                <p className="text-muted-foreground text-sm">Investment plans will appear here once configured.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan, i) => (
                  <PlanCard
                    key={plan._id}
                    plan={plan}
                    index={i}
                    total={plans.length}
                    onInvest={setActivePlan}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Returns Calculator ── */}
          <section className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden dark:bg-[#0e0e0e]">
            <div className="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-zinc-800">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                Returns Calculator
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Investment Amount ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <input
                        type="number"
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full h-10 pl-7 pr-4 rounded-sm border border-slate-200 dark:border-zinc-800 bg-transparent text-slate-900 dark:text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  {/* Plan selector */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Plan
                    </label>
                    <select
                      value={calcPlanId}
                      onChange={(e) => setCalcPlanId(e.target.value)}
                      className="w-full h-10 px-3 rounded-sm border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    >
                      <option value="">Choose a plan</option>
                      {plans.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} — {p.roiPercent}% ROI
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Results */}
                <div
                  className="rounded-lg p-4 sm:p-5 flex flex-col justify-center"
                  style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.2)' }}
                >
                  {calcReturn !== null && calcPlan ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Principal</span>
                        <span className="font-medium text-slate-900 dark:text-white">${fmt(calcNum)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">ROI ({calcPlan.roiPercent}%)</span>
                        <span className="font-medium text-emerald-500">+${fmt(calcReturn)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium text-slate-900 dark:text-white">{calcPlan.durationDays} days</span>
                      </div>
                      <div
                        className="pt-3 mt-1"
                        style={{ borderTop: '1px solid rgba(249,115,22,0.2)' }}
                      >
                        <div className="flex justify-between">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">Total Return</span>
                          <span className="text-lg font-bold text-primary">${fmt(calcNum + calcReturn)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      <Calculator className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Enter an amount and select a plan to calculate your returns
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── How It Works + Security side by side ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* How It Works */}
            <section>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                How It Works
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {HOW_IT_WORKS.map(({ step, icon, title, desc }) => (
                  <div
                    key={step}
                    className="relative rounded-lg p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 dark:bg-[#0e0e0e] hover:border-primary/40 transition-colors duration-200"
                  >
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-3 sm:mb-4"
                      style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}
                    >
                      <span className="text-primary">{icon}</span>
                    </div>
                    <div
                      className="absolute top-3 right-3 text-2xl sm:text-3xl font-black opacity-5 select-none"
                      style={{ color: 'var(--primary)' }}
                    >
                      {step}
                    </div>
                    <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                      {title}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Security & Trust */}
            <section>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Security &amp; Trust
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {TRUST.map(({ icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex flex-col items-center text-center rounded-lg p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 dark:bg-[#0e0e0e] hover:border-primary/30 transition-colors duration-200"
                  >
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3"
                      style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}
                    >
                      {icon}
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {title}
                    </h4>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── FAQ ── */}
          <section>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Frequently Asked Questions
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {FAQ.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* ── Invest Dialog ── */}
      {activePlan && (
        <InvestDialog
          plan={activePlan}
          onClose={() => setActivePlan(null)}
          onSuccess={() => setActivePlan(null)}
        />
      )}
    </DashboardLayout>
  );
}
