import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const withdrawals = await Transaction.find({ userId: auth.userId, type: 'withdrawal' }).sort({ createdAt: -1 });
    return NextResponse.json({ withdrawals });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { amount, currency, walletAddress, network } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const user = await User.findById(auth.userId);
    if (!user || user.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    await User.findByIdAndUpdate(auth.userId, { $inc: { balance: -amount } });

    const transaction = await Transaction.create({
      userId: auth.userId,
      type: 'withdrawal',
      amount,
      currency: currency || 'USD',
      walletAddress,
      network,
      status: 'pending',
    });

    return NextResponse.json({ message: 'Withdrawal request submitted', transaction }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
