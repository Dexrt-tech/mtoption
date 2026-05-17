'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Price { symbol: string; name: string; price: number; change24h: number; }

export default function MarketTicker() {
  const [prices, setPrices] = useState<Price[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/prices');
        const d = await r.json();
        setPrices(d.prices || []);
      } catch {
        setPrices([
          { symbol: 'BTC',  name: 'Bitcoin',  price: 97240, change24h:  2.4 },
          { symbol: 'ETH',  name: 'Ethereum', price: 3180,  change24h:  1.1 },
          { symbol: 'XRP',  name: 'XRP',      price: 2.14,  change24h: -0.5 },
          { symbol: 'SOL',  name: 'Solana',   price: 182,   change24h:  3.2 },
          { symbol: 'BNB',  name: 'BNB',      price: 620,   change24h:  0.3 },
        ]);
      }
    };
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  if (!prices.length) return null;
  const doubled = [...prices, ...prices];

  return (
    <div
      className="overflow-hidden py-3 border-b"
      style={{ background: 'oklch(0.09 0.01 264.695)', borderColor: 'oklch(0.25 0.02 264.695)' }}
    >
      <div className="ticker flex whitespace-nowrap">
        {doubled.map((p, i) => (
          <span key={`${p.symbol}-${i}`} className="inline-flex items-center gap-3 mx-8 shrink-0">
            <span className="font-bold text-sm" style={{ color: 'var(--primary)' }}>{p.symbol}</span>
            <span className="text-white font-semibold text-sm">
              ${p.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`flex items-center gap-1 text-xs font-medium ${p.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {p.change24h >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {p.change24h >= 0 ? '+' : ''}{p.change24h.toFixed(2)}%
            </span>
            <span style={{ color: '#1d222b' }}>•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
