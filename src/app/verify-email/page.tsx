'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, TrendingUp } from 'lucide-react';

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const success = params.get('success');
  const error = params.get('error');

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!success) return;
    const id = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(id); router.push('/dashboard'); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [success, router]);

  const errorMessage =
    error === 'missing' ? 'No verification token was provided.' :
    error === 'invalid' ? 'This verification link is invalid or has expired. Please request a new one.' :
    error === 'server'  ? 'Something went wrong on our end. Please try again.' :
    'An unknown error occurred.';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: '#0a0a0a' }}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10">
        <TrendingUp size={22} style={{ color: 'var(--primary)' }} />
        <span className="text-xl font-black tracking-tight">
          <span className="text-white">META</span>
          <span style={{ color: 'var(--primary)' }}>TRADING</span>
        </span>
      </Link>

      <div className="w-full max-w-md rounded-2xl border p-8 text-center"
        style={{
          background: '#0d0d0d',
          borderColor: success ? 'rgba(34,197,94,0.3)' : error ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)',
        }}
      >
        {/* Loading state — no params yet */}
        {!success && !error && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(249,115,22,0.1)' }}>
              <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Verifying your email…</h1>
            <p className="text-sm text-slate-400">Please wait a moment.</p>
          </>
        )}

        {/* Success */}
        {success && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(34,197,94,0.12)' }}>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Email Verified!</h1>
            <p className="text-sm text-slate-400 mb-6">
              Your email address has been verified successfully. Welcome to Meta Trading Option!
            </p>
            <div className="rounded-xl px-4 py-3 mb-6 text-sm text-green-300"
              style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
              Redirecting to your dashboard in {countdown} second{countdown !== 1 ? 's' : ''}…
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center w-full rounded-xl py-3 text-sm font-semibold text-white"
              style={{ background: '#f97316' }}
            >
              Go to Dashboard Now
            </Link>
          </>
        )}

        {/* Error */}
        {error && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Verification Failed</h1>
            <p className="text-sm text-slate-400 mb-6">{errorMessage}</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center w-full rounded-xl py-3 text-sm font-semibold text-white"
                style={{ background: '#f97316' }}
              >
                Go to Dashboard
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center w-full rounded-xl border py-3 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              >
                Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
