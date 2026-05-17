'use client';

import { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  Shield, CheckCircle, Clock, XCircle, Upload, ChevronRight,
  ChevronLeft, AlertTriangle, FileText, Camera, User, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── types ──────────────────────────────────────────────────────────────────────

type KYCStatus = 'none' | 'pending' | 'approved' | 'rejected';
type IdType = 'passport' | 'drivers_license' | 'national_id';

interface KYCRecord {
  status: KYCStatus;
  nameOnId: string;
  idType: IdType;
  rejectionReason?: string | null;
  submittedAt: string;
}

// ── helpers ────────────────────────────────────────────────────────────────────

function normName(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

function FileZone({
  label, hint, file, onChange, required = true,
}: {
  label: string; hint: string; file: File | null;
  onChange: (f: File) => void; required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-300">
        {label}{required && <span className="ml-1 text-red-400">*</span>}
      </p>
      <div
        onClick={() => ref.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 transition-colors"
        style={{
          borderColor: file ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.12)',
          background: file ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)',
        }}
      >
        {file ? (
          <>
            <Check className="h-6 w-6 text-green-400" />
            <p className="text-xs font-medium text-green-400 text-center break-all">{file.name}</p>
            <p className="text-xs text-slate-500">Click to replace</p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-slate-500" />
            <p className="text-xs text-slate-400 text-center">{hint}</p>
            <p className="text-xs text-slate-600">JPG, PNG, PDF · Max 10 MB</p>
          </>
        )}
      </div>
      <input
        ref={ref} type="file"
        accept="image/jpeg,image/jpg,image/png,application/pdf"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onChange(f); }}
      />
    </div>
  );
}

// ── step indicators ────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Government ID', icon: FileText },
  { label: 'Proof of Address', icon: User },
  { label: 'Selfie', icon: Camera },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = s.icon;
        return (
          <div key={i} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all"
                style={{
                  background: done ? '#22c55e' : active ? '#f97316' : 'rgba(255,255,255,0.07)',
                  border: done ? '1px solid #22c55e' : active ? '1px solid #f97316' : '1px solid rgba(255,255,255,0.12)',
                  color: done || active ? '#fff' : '#52525b',
                }}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <p className="text-[10px] text-center" style={{ color: active ? '#f97316' : done ? '#22c55e' : '#52525b' }}>
                {s.label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-px mx-1 mb-4"
                style={{ background: done ? '#22c55e' : 'rgba(255,255,255,0.08)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── main ───────────────────────────────────────────────────────────────────────

export default function KYCPage() {
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [kycRecord, setKycRecord] = useState<KYCRecord | null>(null);
  const [accountName, setAccountName] = useState('');
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 0: Government ID
  const [nameOnId, setNameOnId] = useState('');
  const [idType, setIdType] = useState<IdType>('passport');
  const [govIdFront, setGovIdFront] = useState<File | null>(null);
  const [govIdBack, setGovIdBack] = useState<File | null>(null);

  // Step 1: Proof of Address
  const [proofOfAddress, setProofOfAddress] = useState<File | null>(null);

  // Step 2: Selfie
  const [selfie, setSelfie] = useState<File | null>(null);

  useEffect(() => {
    // Load KYC status
    fetch('/api/kyc/status')
      .then(r => r.json())
      .then(d => {
        setKycStatus(d.status ?? 'none');
        setKycRecord(d.kyc ?? null);
      })
      .catch(() => setKycStatus('none'));

    // Load account name
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) setAccountName(`${d.user.firstName} ${d.user.lastName}`);
      })
      .catch(() => {});
  }, []);

  const nameMismatch = nameOnId.length > 2 && accountName
    ? normName(nameOnId) !== normName(accountName)
    : false;

  function canProceedStep0() {
    return nameOnId.trim().length > 1 && govIdFront !== null;
  }

  function canProceedStep1() {
    return proofOfAddress !== null;
  }

  function canSubmit() {
    return selfie !== null;
  }

  async function handleSubmit() {
    if (!canSubmit()) return;
    setSubmitting(true);

    const form = new FormData();
    form.append('nameOnId', nameOnId.trim());
    form.append('idType', idType);
    form.append('govIdFront', govIdFront!);
    if (govIdBack) form.append('govIdBack', govIdBack);
    form.append('proofOfAddress', proofOfAddress!);
    form.append('selfie', selfie!);

    try {
      const res = await fetch('/api/kyc/submit', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Submission failed');
        return;
      }
      toast.success('KYC submitted! We will review it within 24 hours.');
      setKycStatus('pending');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading ──
  if (kycStatus === null) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  // ── Already approved ──
  if (kycStatus === 'approved') {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-lg py-10">
          <div className="rounded-2xl border p-8 text-center" style={{ background: '#0d0d0d', borderColor: 'rgba(34,197,94,0.3)' }}>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(34,197,94,0.12)' }}>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Identity Verified</h2>
            <p className="text-sm text-slate-400 mb-4">
              Your KYC verification has been approved. You have full access to all features including withdrawals.
            </p>
            {kycRecord && (
              <div className="rounded-lg px-4 py-3 text-left space-y-1.5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <Row label="Name on ID" value={kycRecord.nameOnId} />
                <Row label="ID Type" value={{ passport: 'Passport', drivers_license: "Driver's License", national_id: 'National ID' }[kycRecord.idType]} />
                <Row label="Verified on" value={new Date(kycRecord.submittedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })} />
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Under review ──
  if (kycStatus === 'pending') {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-lg py-10">
          <div className="rounded-2xl border p-8 text-center" style={{ background: '#0d0d0d', borderColor: 'rgba(234,179,8,0.3)' }}>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(234,179,8,0.1)' }}>
              <Clock className="h-8 w-8 text-amber-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Under Review</h2>
            <p className="text-sm text-slate-400 mb-4">
              Your documents have been submitted and are being reviewed by our compliance team. This usually takes 24–48 hours.
            </p>
            {kycRecord && (
              <div className="rounded-lg px-4 py-3 text-left space-y-1.5" style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.15)' }}>
                <Row label="Name on ID" value={kycRecord.nameOnId} />
                <Row label="Submitted" value={new Date(kycRecord.submittedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })} />
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Rejected — allow resubmission ──
  const showRejection = kycStatus === 'rejected' && kycRecord;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-xl py-6 px-1">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-orange-500" />
            <h1 className="text-xl font-bold text-white">KYC Verification</h1>
          </div>
          <p className="text-sm text-slate-400">
            Verify your identity to unlock withdrawals and full account access.
          </p>
        </div>

        {/* Rejection notice */}
        {showRejection && (
          <div className="mb-6 rounded-xl border p-4 flex gap-3" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.3)' }}>
            <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400 mb-0.5">Previous submission rejected</p>
              <p className="text-xs text-slate-400">{kycRecord!.rejectionReason || 'Your documents did not pass verification. Please resubmit with clearer images.'}</p>
            </div>
          </div>
        )}

        {/* Step bar */}
        <StepBar current={step} />

        {/* Card */}
        <div className="rounded-2xl border p-5 sm:p-6" style={{ background: '#0d0d0d', borderColor: 'rgba(255,255,255,0.08)' }}>

          {/* ── STEP 0: Government ID ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white mb-0.5">Government-Issued ID</h2>
                <p className="text-xs text-slate-500">Upload a valid government ID. The name on your ID must match your account name.</p>
              </div>

              {/* Name on ID */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Full name as it appears on your ID <span className="text-red-400">*</span>
                </label>
                <input
                  value={nameOnId}
                  onChange={e => setNameOnId(e.target.value)}
                  placeholder={accountName || 'e.g. John Michael Doe'}
                  className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
                  style={{ borderColor: nameMismatch ? 'rgba(234,179,8,0.5)' : 'rgba(255,255,255,0.12)' }}
                />
                {nameMismatch && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg p-2.5" style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.25)' }}>
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-300">
                      This doesn't match your account name <strong className="text-amber-200">"{accountName}"</strong>. Our team will cross-check manually — make sure you enter the name exactly as printed on your ID.
                    </p>
                  </div>
                )}
                {!nameMismatch && nameOnId.trim().length > 2 && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-green-400">
                    <Check className="h-3 w-3" /> Name matches your account
                  </p>
                )}
              </div>

              {/* ID Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">ID Type <span className="text-red-400">*</span></label>
                <select
                  value={idType}
                  onChange={e => setIdType(e.target.value as IdType)}
                  className="w-full rounded-lg border bg-zinc-900 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  style={{ borderColor: 'rgba(255,255,255,0.12)' }}
                >
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="national_id">National ID Card</option>
                </select>
              </div>

              {/* Upload front */}
              <FileZone
                label="Front of ID"
                hint="Upload a clear photo of the front side of your ID"
                file={govIdFront}
                onChange={setGovIdFront}
              />

              {/* Upload back (not required for passport) */}
              <FileZone
                label={idType === 'passport' ? 'Back of ID (optional for passport)' : 'Back of ID'}
                hint="Upload a clear photo of the back side of your ID"
                file={govIdBack}
                onChange={setGovIdBack}
                required={idType !== 'passport'}
              />

              {/* Tips */}
              <div className="rounded-lg p-3 space-y-1.5 text-xs text-slate-500" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="font-medium text-slate-400">Tips for a successful submission:</p>
                <p>• Ensure the ID is not expired</p>
                <p>• All four corners of the ID must be visible</p>
                <p>• The photo/text must be clearly legible, not blurry</p>
                <p>• No glare or flash covering the ID details</p>
              </div>
            </div>
          )}

          {/* ── STEP 1: Proof of Address ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white mb-0.5">Proof of Address</h2>
                <p className="text-xs text-slate-500">Upload a document that proves your current residential address. It must be dated within the last 3 months.</p>
              </div>

              <FileZone
                label="Address Document"
                hint="Utility bill, bank statement, or government letter showing your name and address"
                file={proofOfAddress}
                onChange={setProofOfAddress}
              />

              <div className="rounded-lg p-3 space-y-1.5 text-xs text-slate-500" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="font-medium text-slate-400">Accepted documents:</p>
                <p>• Utility bill (electricity, water, gas, internet)</p>
                <p>• Bank or credit card statement</p>
                <p>• Government-issued letter or tax document</p>
                <p>• Must show your full name and address clearly</p>
                <p>• Must be dated within the last 3 months</p>
              </div>
            </div>
          )}

          {/* ── STEP 2: Selfie ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white mb-0.5">Selfie Verification</h2>
                <p className="text-xs text-slate-500">Take a clear photo of yourself holding your government ID next to your face.</p>
              </div>

              <FileZone
                label="Selfie with ID"
                hint="Hold your ID next to your face so both are clearly visible"
                file={selfie}
                onChange={setSelfie}
              />

              <div className="rounded-lg p-3 space-y-1.5 text-xs text-slate-500" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="font-medium text-slate-400">Requirements:</p>
                <p>• Hold the same ID you submitted in Step 1</p>
                <p>• Your full face must be clearly visible</p>
                <p>• Ensure good lighting — no sunglasses or hats</p>
                <p>• The ID text must be legible in the photo</p>
              </div>

              {/* Summary before submit */}
              <div className="rounded-lg border p-4 space-y-2" style={{ background: 'rgba(249,115,22,0.04)', borderColor: 'rgba(249,115,22,0.2)' }}>
                <p className="text-xs font-semibold text-orange-400 mb-2">Submission Summary</p>
                <Row label="Name on ID" value={nameOnId} />
                <Row label="ID Type" value={{ passport: 'Passport', drivers_license: "Driver's License", national_id: 'National ID' }[idType]} />
                <Row label="Gov ID (front)" value={govIdFront?.name ?? '—'} />
                <Row label="Gov ID (back)" value={govIdBack?.name ?? 'Not provided'} />
                <Row label="Proof of Address" value={proofOfAddress?.name ?? '—'} />
              </div>

              {nameMismatch && (
                <div className="flex items-start gap-2 rounded-lg p-3" style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.25)' }}>
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">
                    Reminder: The name on your ID doesn't match your account name. Our team will verify this manually.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-6 flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 disabled:opacity-40"
                style={{ borderColor: 'rgba(255,255,255,0.12)' }}
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}

            {step < 2 && (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={
                  (step === 0 && !canProceedStep0()) ||
                  (step === 1 && !canProceedStep1())
                }
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: '#f97316' }}
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit() || submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: !canSubmit() || submitting ? '#3f3f46' : '#f97316' }}
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" /> Submit Verification
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-300 text-right truncate">{value}</span>
    </div>
  );
}
