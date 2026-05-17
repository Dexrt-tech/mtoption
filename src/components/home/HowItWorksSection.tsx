import Link from 'next/link';
import { Layers, ArrowRight } from 'lucide-react';

const steps = [
  {
    step: '01', title: 'REGISTRATION', sub: 'Create', subAccent: 'An Account',
    desc: 'Getting started with us is really easy. Fill in the requested fields regarding your personal information and trading expertise to complete registration.',
  },
  {
    step: '02', title: 'FINANCIAL GROWTH', sub: 'Trading', subAccent: 'Interception',
    desc: 'Connect with our platform and gain access to real-time market data, professional analysis tools, and expert trading signals.',
  },
  {
    step: '03', title: 'INVESTMENT PLANS', sub: 'Make', subAccent: 'A Deposit',
    desc: 'You have unlimited access to our wide range of profitable assets to invest in. Once your contract starts, earnings are credited automatically.',
  },
  {
    step: '04', title: 'WITHDRAWALS', sub: 'Make', subAccent: 'Withdrawal Request',
    desc: 'Once earnings has been collected, you can confidently head to the withdrawal section. Funds are immediately sent to your wallet address.',
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="landing-section-bg relative border-t px-4 py-16 md:px-8 md:py-24"
      style={{ borderColor: 'var(--landing-border)' }}
    >
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Left — text + CTA */}
        <div className="anim-left flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Layers size={14} style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Getting Started</span>
          </div>

          <h2 className="text-3xl font-black leading-tight text-white md:text-4xl lg:text-5xl" style={{ letterSpacing: '-0.02em' }}>
            How <span style={{ color: 'var(--primary)' }}>It Works?</span>
          </h2>

          <p className="max-w-md text-sm leading-relaxed" style={{ color: '#62748e' }}>
            We all have to start somewhere. Let us help get you on the right track as you start your investing journey.
            Our simple four-step process makes it easy to begin earning.
          </p>

          <div>
            <Link href="/signup" className="btn-primary">
              Create an account <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Right — 2×2 step cards */}
        <div className="anim-right grid grid-cols-1 gap-4 sm:grid-cols-2">
          {steps.map((s) => (
            <div key={s.step} className="card-dark flex flex-col gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'rgba(252,73,54,0.1)', border: '1px solid rgba(252,73,54,0.2)' }}>
                <Layers size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>{s.title}</p>
              <h3 className="text-sm font-semibold text-white">
                {s.sub} <span style={{ color: 'var(--primary)' }}>{s.subAccent}</span>
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: '#62748e' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
