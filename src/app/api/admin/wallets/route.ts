import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import WalletSettings from '@/models/WalletSettings';

async function requireAdmin() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== 'admin') return null;
  return auth;
}

async function getSettings() {
  await connectDB();
  let settings = await WalletSettings.findOne();
  if (!settings) {
    settings = await WalletSettings.create({
      btc:       process.env.BTC_WALLET       || '',
      eth:       process.env.ETH_WALLET        || '',
      usdtBep20: process.env.USDT_BEP20_WALLET || process.env.USDT_ERC20_WALLET || '',
      usdtTrc20: process.env.USDT_TRC20_WALLET || '',
    });
  }
  return settings;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const settings = await getSettings();
  return NextResponse.json({ wallets: settings });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();
  const { btc, eth, usdtBep20, usdtTrc20 } = await req.json();

  const update: Record<string, string> = {};
  if (typeof btc       === 'string') update.btc       = btc.trim();
  if (typeof eth       === 'string') update.eth       = eth.trim();
  if (typeof usdtBep20 === 'string') update.usdtBep20 = usdtBep20.trim();
  if (typeof usdtTrc20 === 'string') update.usdtTrc20 = usdtTrc20.trim();

  const existing = await WalletSettings.findOne();
  if (existing) {
    await WalletSettings.findByIdAndUpdate(existing._id, { $set: update });
  } else {
    await WalletSettings.create(update);
  }

  return NextResponse.json({ message: 'Wallet addresses updated successfully' });
}
