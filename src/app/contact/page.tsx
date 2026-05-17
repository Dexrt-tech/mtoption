'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Mail, Clock, Globe, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const subjects = [
  'General Inquiry',
  'Deposit Issue',
  'Withdrawal Issue',
  'Account Problem',
  'Investment Plans',
  'Technical Support',
  'Other',
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(data.message);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: 'var(--landing-bg)' }}>
        {/* Header */}
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Get In Touch</p>
          <h1 className="mb-4 text-4xl font-black text-white md:text-5xl">Contact Us</h1>
          <p className="mx-auto max-w-xl text-lg" style={{ color: '#62748e' }}>
            Have a question or need support? We&apos;re here to help.
          </p>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            {/* Info Panel */}
            <div className="space-y-5">
              {[
                { icon: Mail,  label: 'Support',          value: 'support@metatradingoption.com', sub: 'Send us an email anytime' },
                { icon: Clock, label: 'Availability',     value: '24/7 Support',         sub: 'We typically respond within 24 hours.' },
                { icon: Globe, label: 'Office',           value: 'Global',               sub: 'Remote support — worldwide' },
              ].map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="card p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: 'rgba(252,73,54,0.1)', border: '1px solid rgba(252,73,54,0.2)' }}>
                    <Icon size={20} style={{ color: 'var(--primary)' }} />
                  </div>
                  <p className="mb-1 text-xs uppercase tracking-wider" style={{ color: '#62748e' }}>{label}</p>
                  <p className="mb-1 font-bold text-white">{value}</p>
                  <p className="text-xs" style={{ color: '#62748e' }}>{sub}</p>
                </div>
              ))}

              <div className="card p-6">
                <p className="mb-3 text-xs uppercase tracking-wider" style={{ color: '#62748e' }}>Follow us</p>
                <div className="flex gap-3">
                  {['Twitter', 'Telegram', 'Discord'].map((s) => (
                    <button key={s} className="flex-1 rounded-lg border py-2 text-xs font-medium transition-all hover:text-white" style={{ borderColor: 'var(--landing-border)', color: '#62748e' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card p-8 lg:col-span-2">
              <h2 className="mb-6 text-xl font-bold text-white">Send a message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium" style={{ color: '#62748e' }}>Name</label>
                    <input type="text" className="input-field" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium" style={{ color: '#62748e' }}>Email</label>
                    <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: '#62748e' }}>Subject</label>
                  <select className="input-field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                    <option value="">Select a subject</option>
                    {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: '#62748e' }}>Message</label>
                  <textarea className="input-field min-h-[160px] resize-y" placeholder="Describe your issue or question in detail..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-xs" style={{ color: '#62748e' }}>We&apos;ll get back within 24 hours.</p>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Sending...' : <><Send size={15} /> Send message</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
