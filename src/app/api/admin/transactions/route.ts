import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

async function requireAdmin() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== 'admin') return null;
  return auth;
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  await connectDB();
  const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
  return NextResponse.json({ transactions });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();
  const { userId, type, amount, status, currency, note } = await req.json();
  if (!userId || !type || !amount) return NextResponse.json({ error: 'userId, type and amount required' }, { status: 400 });

  const tx = await Transaction.create({ userId, type, amount, status: status || 'approved', currency: currency || 'USD', note });

  // Keep user stats in sync
  if (tx.status === 'approved') {
    if (type === 'deposit') await User.findByIdAndUpdate(userId, { $inc: { balance: amount, totalDeposited: amount } });
    if (type === 'withdrawal') await User.findByIdAndUpdate(userId, { $inc: { balance: -amount, totalWithdrawn: amount } });
    if (type === 'earning' || type === 'bonus') await User.findByIdAndUpdate(userId, { $inc: { balance: amount, totalEarnings: amount } });
  }

  return NextResponse.json({ transaction: tx }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();
  const { txId, type, amount, status, currency, note, createdAt } = await req.json();
  if (!txId) return NextResponse.json({ error: 'txId required' }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (type !== undefined) update.type = type;
  if (amount !== undefined) update.amount = amount;
  if (status !== undefined) update.status = status;
  if (currency !== undefined) update.currency = currency;
  if (note !== undefined) update.note = note;
  if (createdAt !== undefined) update.createdAt = new Date(createdAt);

  const tx = await Transaction.findByIdAndUpdate(txId, { $set: update }, { new: true });
  return NextResponse.json({ transaction: tx });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();
  const { txId } = await req.json();
  await Transaction.findByIdAndDelete(txId);
  return NextResponse.json({ message: 'Transaction deleted' });
}
