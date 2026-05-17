import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import WalletSettings from '@/models/WalletSettings';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  // Load from DB, seeding from env vars on first run
  let settings = await WalletSettings.findOne();
  if (!settings) {
    settings = await WalletSettings.create({
      btc:       process.env.BTC_WALLET        || '',
      eth:       process.env.ETH_WALLET         || '',
      usdtBep20: process.env.USDT_BEP20_WALLET  || process.env.USDT_ERC20_WALLET || '',
      usdtTrc20: process.env.USDT_TRC20_WALLET  || '',
    });
  }

  const methods = [];

  if (settings.btc) {
    methods.push({
      id: 'btc', type: 'crypto', name: 'Bitcoin', currency: 'BTC',
      address: settings.btc,
      processingTime: '10–30 minutes', fee: '0%',
    });
  }
  if (settings.eth) {
    methods.push({
      id: 'eth', type: 'crypto', name: 'Ethereum', currency: 'ETH',
      address: settings.eth,
      processingTime: '5–15 minutes', fee: '0%',
    });
  }
  if (settings.usdtBep20) {
    methods.push({
      id: 'usdt-bep20', type: 'crypto', name: 'USDT (BEP-20)', currency: 'USDT',
      address: settings.usdtBep20,
      processingTime: '3–10 minutes', fee: '0%',
    });
  }
  if (settings.usdtTrc20) {
    methods.push({
      id: 'usdt-trc20', type: 'crypto', name: 'USDT (TRC-20)', currency: 'USDT',
      address: settings.usdtTrc20,
      processingTime: '1–5 minutes', fee: '0%',
    });
  }

  // Dev fallback — ensures UI always has options when DB is empty
  if (methods.length === 0) {
    methods.push(
      {
        id: 'btc', type: 'crypto', name: 'Bitcoin', currency: 'BTC',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        processingTime: '10–30 minutes', fee: '0%',
      },
      {
        id: 'usdt-trc20', type: 'crypto', name: 'USDT (TRC-20)', currency: 'USDT',
        address: 'TQn9Y2khDD95gHc3iMSRdGJMKGSFqQFkGa',
        processingTime: '1–5 minutes', fee: '0%',
      },
    );
  }

  return NextResponse.json({ paymentMethods: methods });
}
