'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Mail, Lock, TrendingUp, Star, AlertCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const testimonials = [
  {
    initials: 'SJ', name: 'Sarah Johnson', role: 'Professional Trader',
    quote: 'Meta Trading Option has transformed my trading experience. The advanced analytics and real-time data help me make informed decisions every day.',
  },
  {
    initials: 'MC', name: 'Michael Chen', role: 'Investment Advisor',
    quote: 'The security features are outstanding. I feel completely safe knowing my investments are protected with bank-level security.',
  },
  {
    initials: 'ER', name: 'Emily Rodriguez', role: 'Copy Trader',
    quote: 'Copy trading has been a game-changer for me. Following successful traders has significantly improved my portfolio performance.',
  },
  {
    initials: 'DT', name: 'David Thompson', role: 'Global Investor',
    quote: 'Access to international markets through Meta Trading Option has allowed me to diversify my portfolio like never before. Highly recommended!',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  const [retryMsg, setRetryMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRetryMsg('');
    setLoading(true);

    const MAX_ATTEMPTS = 5;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        if (attempt > 1) {
          setRetryMsg(`Connecting to server… (attempt ${attempt} of ${MAX_ATTEMPTS})`);
          await new Promise(r => setTimeout(r, 4000));
        }

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });

        const data = await res.json();

        if (res.status === 500 && attempt < MAX_ATTEMPTS) {
          // Temporary server/DB issue — retry silently
          continue;
        }

        if (!res.ok) {
          setError(data.error || 'Login failed');
          setRetryMsg('');
          setLoading(false);
          return;
        }

        setRetryMsg('');
        toast.success('Welcome back!');
        if (data.user.role === 'admin') router.push('/admin');
        else router.push('/dashboard');
        return;
      } catch {
        if (attempt < MAX_ATTEMPTS) continue;
        setError('Something went wrong. Please try again.');
      }
    }

    setError('Unable to reach server. Please check your connection and try again.');
    setRetryMsg('');
    setLoading(false);
  };

  const t = testimonials[testimonialIdx];

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background: 'var(--landing-bg)',
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      }}
    >
      <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2">

        {/* ── Left: Form ── */}
        <div className="mx-auto w-full max-w-[26rem]">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">
              Hello,<br />
              <span>Welcome Back</span>
            </h1>
            <p className="mt-2 text-sm" style={{ color: '#62748e' }}>
              Sign in to your account to continue trading
            </p>
          </div>

          {retryMsg && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-400">
              <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
              {retryMsg}
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#62748e' }} />
              <input
                type="email"
                className="input-field h-11 pl-10 transition-all duration-200 focus:scale-[1.02]"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#62748e' }} />
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field h-11 pl-10 pr-10 transition-all duration-200 focus:scale-[1.02]"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#62748e' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2" style={{ color: '#62748e' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                Remember me
              </label>
              <a href="#" className="hover:underline" style={{ color: 'var(--primary)' }}>Forgot password?</a>
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-10 h-11 w-full">
              {loading
                ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Signing in...</>
                : <>Sign In <ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#62748e' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
              Sign up for free
            </Link>
          </p>

          {/* Mobile fallback */}
          <div className="mt-8 lg:hidden">
            <p className="mb-4 text-center text-sm font-semibold text-white">Why choose Meta Trading Option?</p>
            <div className="grid grid-cols-2 gap-3">
              {[{ Icon: Shield, label: 'Secure' }, { Icon: TrendingUp, label: 'Advanced' }].map(({ Icon, label }) => (
                <div key={label} className="card-dark flex items-center gap-2 p-3">
                  <Icon size={16} style={{ color: 'var(--primary)' }} />
                  <span className="text-sm text-white">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Image panel ── */}
        <div
          className="relative hidden min-h-[41rem] w-full rounded-lg bg-cover bg-center bg-no-repeat lg:block"
          style={{ backgroundImage: 'url(/login-bg.jpg)' }}
        >
          {/* Floating badge top-right */}
          <div className="absolute right-4 top-4 rounded-lg p-3 transition-transform hover:scale-110" style={{ background: 'var(--landing-card)' }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--primary)' }}>
              <TrendingUp size={16} className="text-white" />
            </div>
          </div>

          {/* Rotating testimonial card */}
          <div
            className="absolute bottom-6 left-6 right-6 rounded-xl border p-6"
            style={{ background: 'rgba(2,2,4,0.9)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="mb-4 text-sm leading-relaxed text-white">&ldquo;{t.quote}&rdquo;</p>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-semibold" style={{ background: 'rgba(252,73,54,0.1)', color: 'var(--primary)' }}>
                {t.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs" style={{ color: '#62748e' }}>{t.role}</p>
              </div>
            </div>
            {/* Progress dots */}
            <div className="mt-4 flex gap-1">
              {testimonials.map((_, i) => (
                <div key={i} className="h-1 rounded-full transition-all" style={{ flex: i === testimonialIdx ? '1 0 auto' : undefined, width: i === testimonialIdx ? undefined : 8, background: i === testimonialIdx ? 'var(--primary)' : 'rgba(255,255,255,0.3)' }} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
