'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat { label: string; prefix: string; target: number; suffix: string; decimals?: number }

const stats: Stat[] = [
  { label: 'Active Traders',  prefix: '',  target: 10,    suffix: 'K+' },
  { label: 'Trading Volume',  prefix: '$', target: 2,     suffix: 'B+' },
  { label: 'Uptime',          prefix: '',  target: 99.9,  suffix: '%', decimals: 1 },
  { label: 'Support',         prefix: '',  target: 0,     suffix: '24/7' },
];

function CountUp({ stat }: { stat: Stat }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        if (stat.target === 0) return;
        const duration = 1800;
        const steps = 60;
        const increment = stat.target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + increment, stat.target);
          setValue(current);
          if (current >= stat.target) clearInterval(timer);
        }, duration / steps);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [stat.target]);

  const display = stat.target === 0
    ? ''
    : stat.decimals
    ? value.toFixed(stat.decimals)
    : Math.floor(value).toString();

  return (
    <div ref={ref} className="card-dark flex flex-col items-center gap-2 px-6 py-8 text-center">
      <p className="text-4xl font-bold md:text-5xl" style={{ color: 'var(--primary)' }}>
        {stat.target === 0
          ? stat.suffix
          : `${stat.prefix}${display}${stat.suffix}`}
      </p>
      <p className="text-sm font-medium uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.8)' }}>
        {stat.label}
      </p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section
      id="stats"
      className="border-t px-4 py-16 md:px-8 md:py-20"
      style={{
        borderColor: 'var(--landing-border)',
        background: 'linear-gradient(180deg, oklch(0.10 0.015 264.695) 0%, var(--landing-bg) 50%, oklch(0.07 0.01 264.695) 100%)',
      }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => <CountUp key={s.label} stat={s} />)}
      </div>
    </section>
  );
}
