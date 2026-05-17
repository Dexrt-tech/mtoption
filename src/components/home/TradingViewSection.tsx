'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TradingView: any;
  }
}

const CONTAINER_ID = 'tv-advanced-chart';

export default function TradingViewSection() {
  const initialized = useRef(false);

  useEffect(() => {
    // Strict-mode / HMR guard — only run once per mount
    if (initialized.current) return;
    initialized.current = true;

    function createWidget() {
      const el = document.getElementById(CONTAINER_ID);
      if (!el || el.childElementCount > 0) return;

      new window.TradingView.widget({
        autosize: true,
        symbol: 'COINBASE:BTCUSD',
        interval: '1',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        hide_side_toolbar: false,
        allow_symbol_change: true,
        enable_publishing: false,
        container_id: CONTAINER_ID,
      });
    }

    if (typeof window.TradingView !== 'undefined') {
      createWidget();
      return;
    }

    // Only inject tv.js once across the whole page lifetime
    const existing = document.querySelector('script[src*="tradingview.com/tv.js"]');
    if (existing) {
      // Script already in DOM — poll until the library is ready
      const id = setInterval(() => {
        if (typeof window.TradingView !== 'undefined') {
          clearInterval(id);
          createWidget();
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = createWidget;
    document.head.appendChild(script);
  }, []);

  return (
    <section
      id="trading-view"
      className="landing-section-bg relative border-t px-4 py-16 md:px-8 md:py-24"
      style={{ borderColor: 'var(--landing-border)' }}
    >
      <div className="relative z-10 mx-auto max-w-7xl">

        {/* Section heading */}
        <div className="mb-10 text-center md:mb-14">
          <h2 className="section-heading mb-4">
            REAL-TIME{' '}
            <span style={{ color: 'var(--primary)' }}>CHART OVERVIEW.</span>
          </h2>
          <p
            className="mx-auto max-w-xl text-sm leading-relaxed"
            style={{ color: 'var(--muted-fg)' }}
          >
            Monitor live Bitcoin price movements directly on our platform,
            powered by TradingView's professional-grade charting engine.
          </p>
        </div>

        {/* Chart card */}
        <div
          className="overflow-hidden rounded-2xl border"
          style={{
            borderColor: 'var(--landing-border)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
          }}
        >
          {/* Card header */}
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ background: '#0d1117', borderColor: 'var(--landing-border)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Chart Overview
            </p>
            <span
              className="rounded px-2 py-1 text-xs font-semibold"
              style={{ background: 'rgba(252,73,54,0.12)', color: 'var(--primary)' }}
            >
              #BTCUSD
            </span>
          </div>

          {/* TradingView mount */}
          <div
            id={CONTAINER_ID}
            className="h-[380px] md:h-[500px] lg:h-[560px]"
            style={{ background: '#0d1117' }}
          />
        </div>

      </div>
    </section>
  );
}
