'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { HeadphonesIcon, Mail, MessageSquare, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setUser(d.user); });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    try {
      const name = user ? `${user.firstName} ${user.lastName}` : 'Dashboard User';
      const email = user?.email ?? 'noreply@dashboard';
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to send'); return; }
      setSent(true);
      toast.success('Message sent! We\'ll respond within 24 hours.');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto flex flex-col gap-5">

        {/* Header */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <HeadphonesIcon size={24} style={{ color: 'var(--primary)' }} />
            Contact Support
          </h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: '#71717a' }}>
            Our support team is here to help you
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Mail, label: 'Email Us', value: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@metatradingoption.com', color: '#60a5fa' },
            { icon: Clock, label: 'Response Time', value: 'Within 24 hours', color: '#22c55e' },
            { icon: MessageSquare, label: 'Support Hours', value: '24/7 Available', color: 'var(--primary)' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-lg p-4 flex items-center gap-3" style={{ background: '#0e0e0e', border: '1px solid #27272a' }}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: `${color}18` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs" style={{ color: '#71717a' }}>{label}</p>
                <p className="text-xs font-semibold text-white truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="rounded-lg" style={{ background: '#0e0e0e', border: '1px solid #27272a' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: '#27272a' }}>
            <p className="text-sm font-semibold text-white">Send us a message</p>
          </div>

          {sent ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(34,197,94,0.1)' }}>
                <Send size={28} className="text-green-400" />
              </div>
              <p className="text-base font-semibold text-white mb-1">Message Sent!</p>
              <p className="text-sm mb-5" style={{ color: '#71717a' }}>We&apos;ll get back to you within 24 hours.</p>
              <button
                onClick={() => { setSent(false); setSubject(''); setMessage(''); }}
                className="text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:opacity-90"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#a1a1aa' }}>Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Withdrawal issue, Account question..."
                  className="w-full rounded-lg border px-3 py-2.5 text-sm text-white bg-transparent placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors"
                  style={{ borderColor: '#27272a' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#a1a1aa' }}>Message <span style={{ color: 'var(--primary)' }}>*</span></label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  required
                  className="w-full rounded-lg border px-3 py-2.5 text-sm text-white bg-transparent placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors resize-none"
                  style={{ borderColor: '#27272a' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--primary)' }}
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {loading ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
