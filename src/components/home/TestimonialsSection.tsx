'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Murat Isik',
    role: 'Personal Trader',
    avatar: '/testimonial-murat.jpg',
    socialColor: '#fc4936',
    quote: 'I have been a loyal client of Meta Trading Option for several years, and I have never been disappointed. Their professionalism, reliability, and personalized approach have made them my go-to choice anytime.',
  },
  {
    name: 'Nelly Aran',
    role: 'Candle Forecasts at Inksquare',
    avatar: '/testimonial-nelly.jpg',
    socialColor: '#1DA1F2',
    quote: "I can't thank Meta Trading Option enough for their outstanding service. From the moment I signed up, they have provided exceptional support and guidance. Their platform is intuitive and packed with powerful experiences.",
  },
  {
    name: 'Da Silva P. Viera',
    role: 'Indicator Analyst at Voce-Bulls',
    avatar: '/testimonial-dasilva.jpg',
    socialColor: '#1877F2',
    quote: 'Choosing Meta Trading Option was a game-changer for me. Their dedication to customer satisfaction is unmatched. Whenever I have a question or need assistance, their support team is always there to help.',
  },
];

const COUNT = testimonials.length;

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const paused = useRef(false);

  const prev = () => setCurrent((c) => (c - 1 + COUNT) % COUNT);
  const next = () => setCurrent((c) => (c + 1) % COUNT);

  /* auto-advance every 5 s, pauses on hover */
  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current) setCurrent((c) => (c + 1) % COUNT);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="testimonials"
      className="landing-section-bg relative border-t px-4 py-16 md:px-8 md:py-24"
      style={{ borderColor: 'var(--landing-border)' }}
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 text-center md:mb-16">
          <div className="mb-4 flex items-center justify-center gap-2">
            <MessageSquare size={14} style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Testimonials</span>
          </div>
          <h2 className="section-heading mb-4">
            What People Say <span style={{ color: 'var(--primary)' }}>About Us.</span>
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed" style={{ color: '#62748e' }}>
            Immerse yourself in an unparalleled experience of exceptional service and discover why thousands trust Meta Trading Option.
          </p>
        </div>

        {/* Slider */}
        <div
          className="overflow-hidden"
          onMouseEnter={() => { paused.current = true; }}
          onMouseLeave={() => { paused.current = false; }}
        >
          <div
            className="flex"
            style={{
              width: `${COUNT * 100}%`,
              transform: `translateX(-${(current * 100) / COUNT}%)`,
              transition: 'transform 0.4s ease-out',
            }}
          >
            {testimonials.map((t) => (
              <div key={t.name} style={{ width: `${100 / COUNT}%` }} className="shrink-0 px-2">
                <div className="card-dark mx-auto flex max-w-2xl flex-col gap-6 p-8">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-base leading-relaxed italic text-white">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        width={44}
                        height={44}
                        className="rounded-full object-cover"
                        style={{ border: '2px solid rgba(252,73,54,0.3)' }}
                      />
                      <div>
                        <p className="font-semibold text-white">{t.name}</p>
                        <p className="text-xs" style={{ color: '#62748e' }}>{t.role}</p>
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-full" style={{ background: `${t.socialColor}15`, border: `1px solid ${t.socialColor}30` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button onClick={prev} className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === current ? 24 : 8,
                  background: i === current ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>

          <button onClick={next} className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
