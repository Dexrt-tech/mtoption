import { Layers } from 'lucide-react';

const products = [
  { name: 'Indices',     symbol: '¥' },
  { name: 'ETFs',        symbol: '≡' },
  { name: 'Commodities', symbol: '€' },
  { name: 'Bonds',       symbol: '✦' },
  { name: 'Forex',       symbol: '$' },
  { name: 'CFDs',        symbol: '₹' },
  { name: 'Metals',      symbol: '◎' },
  { name: 'Futures',     symbol: '↗' },
];

export default function ProductsSection() {
  return (
    <section
      id="products"
      className="relative border-t px-4 py-16 md:px-8 md:py-24"
      style={{
        borderColor: 'var(--landing-border)',
        background: 'linear-gradient(180deg, oklch(0.10 0.015 264.695) 0%, var(--landing-bg) 50%, oklch(0.07 0.01 264.695) 100%)',
      }}
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 md:mb-16">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center">
              <div className="grid grid-cols-2 gap-0.5">
                {[0,1,2,3].map(i => (
                  <div key={i} className="h-1.5 w-1.5 rounded-sm" style={{ background: i===0?'var(--primary)':i===1?'#f97316':i===2?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.3)' }} />
                ))}
              </div>
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Products</span>
          </div>
          <h2 className="section-heading mb-4">
            Trade with world-wide accepted <span style={{ color: 'var(--primary)' }}>Product</span>
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed" style={{ color: '#62748e' }}>
            With years of industry experience, our team comprises highly skilled professionals dedicated to providing
            you with the best trading experience. Access global markets including NASDAQ, NYSE, ASX and more.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <div
              key={p.name}
              className="card-dark flex items-center gap-4 px-4 py-4 transition-colors"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white"
                style={{ background: 'linear-gradient(135deg, var(--primary), #f97316 60%, rgba(255,255,255,0.7))' }}
              >
                {p.symbol}
              </div>
              <span className="text-sm font-semibold text-white">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
