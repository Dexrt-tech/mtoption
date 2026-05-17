import Link from 'next/link';

const phones = [
  {
    height: 400,
    items: [
      { label: 'Ethereum', value: '$1,857.31', accent: true },
    ],
    chart: true,
  },
  {
    height: 360,
    items: [
      { label: 'XRP',  value: '$2,998.14', accent: false },
      { label: 'SOL',  value: '$1,169.41', accent: false },
    ],
    chart: false,
  },
  {
    height: 320,
    items: [
      { label: 'Portfolio', value: '$12,214.98', accent: true },
    ],
    chart: true,
  },
];

export default function MobileAppSection() {
  return (
    <section
      id="mobile"
      className="landing-section-bg relative border-t px-4 py-16 md:px-8 md:py-24"
      style={{ borderColor: 'var(--landing-border)' }}
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="section-heading mb-4">
            CHECK THE POWER OF <span style={{ color: 'var(--primary)' }}>META TRADING OPTION.</span>
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed" style={{ color: '#62748e' }}>
            Analyze price movements, indicators, and oscillators to spot potential entry and exit points.
            Trade on the go with our powerful mobile experience.
          </p>
        </div>

        {/* Three phone frames */}
        <div className="mb-10 flex items-end justify-center gap-4 md:gap-6">
          {phones.map((phone, pi) => (
            <div
              key={pi}
              className="float relative shrink-0 rounded-3xl border-2 p-3"
              style={{
                width: pi === 1 ? 180 : 160,
                height: phone.height,
                background: 'var(--landing-card)',
                borderColor: 'var(--landing-border)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
                animationDelay: `${pi * 0.5}s`,
              }}
            >
              {/* Notch */}
              <div className="mx-auto mb-3 rounded-b-lg" style={{ width: 50, height: 14, background: 'oklch(0.09 0.01 264.695)' }} />

              {phone.chart && (
                <div className="mb-3 flex items-end gap-1" style={{ height: 48 }}>
                  {[30,55,40,70,50,85,65,100].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 7 ? 'var(--primary)' : 'rgba(252,73,54,0.18)' }} />
                  ))}
                </div>
              )}

              {phone.items.map((item) => (
                <div key={item.label} className="mb-2 rounded-lg p-2" style={{ background: 'rgba(252,73,54,0.06)', border: '1px solid rgba(252,73,54,0.1)' }}>
                  <p className="text-xs" style={{ color: '#62748e' }}>{item.label}</p>
                  <p className="text-sm font-bold" style={{ color: item.accent ? 'var(--primary)' : '#fff' }}>{item.value}</p>
                </div>
              ))}

              {!phone.chart && (
                <div className="mt-2 rounded-lg" style={{ height: 60, background: 'rgba(252,73,54,0.1)' }} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/signup" className="btn-primary">DOWNLOAD APP</Link>
        </div>
      </div>
    </section>
  );
}
