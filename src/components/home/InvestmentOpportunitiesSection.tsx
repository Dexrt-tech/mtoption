import Image from 'next/image';

const PRODUCTS = ['Forex', 'Indices', 'Shares', 'Commodities', 'Metals', 'Digital Currencies', 'Bonds', 'ETFs'];
const MARKETS  = ['NASDAQ', 'NYSE', 'ASX'];

export default function InvestmentOpportunitiesSection() {
  return (
    <section
      id="investment-opportunities"
      className="landing-section-bg relative border-t px-4 py-16 md:px-8 md:py-24"
      style={{ borderColor: 'var(--landing-border)' }}
    >
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-16">
        {/* Left — Image */}
        <div className="anim-left flex justify-center md:justify-start">
          <Image
            src="/home/fpimg.webp"
            alt="Investment products — commodities, stocks and more"
            width={560}
            height={480}
            className="w-full max-w-md rounded-2xl object-cover"
          />
        </div>

        {/* Right — Text */}
        <div className="anim-right flex flex-col gap-6">
          <h2 className="section-heading">
            Enhancing <span style={{ color: 'var(--primary)' }}>Investment</span> Opportunities with Meta Trading Option Versatile{' '}
            <span style={{ color: 'var(--primary)' }}>CFD Trading</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#62748e' }}>
            With years of industry experience, our team comprises highly skilled professionals dedicated to providing
            you with the best trading experience. Access global markets and trade a wide range of assets.
          </p>

          <div className="flex flex-wrap gap-2">
            {PRODUCTS.map((p) => (
              <span
                key={p}
                className="rounded-md border px-3 py-1 text-sm font-semibold"
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)', background: 'rgba(252,73,54,0.06)' }}
              >
                {p}
              </span>
            ))}
          </div>

          <p className="text-sm" style={{ color: '#62748e' }}>
            Access global markets including{' '}
            {MARKETS.map((m, i) => (
              <span key={m}>
                <span className="font-semibold text-white">{m}</span>
                {i < MARKETS.length - 1 ? ', ' : ' and more.'}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
