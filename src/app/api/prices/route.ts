import { NextResponse } from 'next/server';

const CMC_API_KEY = process.env.COINMARKETCAP_API_KEY;

export async function GET() {
  try {
    const symbols = ['BTC', 'ETH', 'XRP', 'SOL', 'BNB', 'USDT'];

    if (CMC_API_KEY && CMC_API_KEY !== 'your_coinmarketcap_api_key') {
      const res = await fetch(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols.join(',')}&convert=USD`,
        {
          headers: { 'X-CMC_PRO_API_KEY': CMC_API_KEY },
          next: { revalidate: 60 },
        }
      );
      const data = await res.json();

      const prices = symbols.map((sym) => ({
        symbol: sym,
        name: data.data[sym]?.name || sym,
        price: data.data[sym]?.quote?.USD?.price || 0,
        change24h: data.data[sym]?.quote?.USD?.percent_change_24h || 0,
      }));

      return NextResponse.json({ prices });
    }

    // Fallback to CoinGecko free API
    const geckoIds = 'bitcoin,ethereum,ripple,solana,binancecoin,tether';
    const geckoRes = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${geckoIds}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } }
    );
    const geckoData = await geckoRes.json();

    const mapping: Record<string, { symbol: string; name: string; id: string }> = {
      bitcoin: { symbol: 'BTC', name: 'Bitcoin', id: 'bitcoin' },
      ethereum: { symbol: 'ETH', name: 'Ethereum', id: 'ethereum' },
      ripple: { symbol: 'XRP', name: 'XRP', id: 'ripple' },
      solana: { symbol: 'SOL', name: 'Solana', id: 'solana' },
      binancecoin: { symbol: 'BNB', name: 'BNB', id: 'binancecoin' },
      tether: { symbol: 'USDT', name: 'Tether', id: 'tether' },
    };

    const prices = Object.entries(mapping).map(([id, info]) => ({
      symbol: info.symbol,
      name: info.name,
      price: geckoData[id]?.usd || 0,
      change24h: geckoData[id]?.usd_24h_change || 0,
    }));

    return NextResponse.json({ prices });
  } catch {
    return NextResponse.json({
      prices: [
        { symbol: 'BTC', name: 'Bitcoin', price: 97000, change24h: 1.2 },
        { symbol: 'ETH', name: 'Ethereum', price: 3200, change24h: 0.8 },
        { symbol: 'XRP', name: 'XRP', price: 2.1, change24h: -0.5 },
        { symbol: 'SOL', name: 'Solana', price: 180, change24h: 2.1 },
      ],
    });
  }
}
