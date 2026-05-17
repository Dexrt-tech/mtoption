'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, DoorOpen } from 'lucide-react';

const FULL_TEXT = 'TRANSFORM YOUR TRADING EXPERIENCE.';

export default function HeroSection() {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(FULL_TEXT.slice(0, i));
      if (i >= FULL_TEXT.length) { clearInterval(timer); setDone(true); }
    }, 55);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="hero"
      className="relative overflow-hidden px-4 py-12 md:px-8 md:py-20 lg:py-16"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 100% 0%, oklch(0.14 0.02 25 / 0.4), transparent 60%), var(--landing-bg)`,
      }}
    >
      {/* Subtle texture */}
      <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/home/hero-bg.png)', backgroundSize: 'cover' }} />
      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(252,73,54,0.07) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-16">
        {/* Left — Text */}
        <div className="anim-left flex flex-col gap-6">
          <div className="flex w-fit items-center gap-2 rounded-full border px-3 py-1.5" style={{ borderColor: 'var(--landing-border)', background: 'var(--landing-card)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-medium" style={{ color: '#62748e' }}>Security &amp; Safety A Priority</span>
          </div>

          <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-6xl" style={{ letterSpacing: '-0.02em' }}>
            {displayed}
            <span
              className="ml-0.5 inline-block w-1 align-middle"
              style={{
                background: 'var(--primary)',
                height: '0.85em',
                animation: done ? 'blink 1s step-end infinite' : 'none',
                opacity: 1,
              }}
            />
          </h1>

          <div className="card-dark rounded-xl p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md px-2 py-0.5 text-xs font-bold" style={{ background: 'rgba(252,73,54,0.2)', color: 'var(--primary)' }}>NEW</span>
              <span className="text-xs font-medium" style={{ color: '#62748e' }}>Investment Platform</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#62748e' }}>
              Take control of your financial future and unlock the unlimited potential of investing.
              Start with us today and explore a world of opportunities.
            </p>
          </div>

          <div>
            <Link href="/signup" className="btn-primary">
              <DoorOpen size={18} />
              GET STARTED
            </Link>
          </div>
        </div>

        {/* Right — Hero Image */}
        <div className="anim-right flex flex-col items-center gap-4 md:items-end">
          <Image
            src="/home/hero-img.png"
            alt="Meta Trading Option trading graphic"
            width={560}
            height={560}
            className="float w-48 object-contain md:w-64 lg:w-[34rem]"
            priority
          />
          <p className="max-w-sm text-center text-sm md:text-right" style={{ color: '#62748e' }}>
            Meta Trading Option is your ultimate companion for tracking, analyzing, and managing your cryptocurrency portfolio.
          </p>
        </div>
      </div>
    </section>
  );
}
