import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { sendWithdrawalSubmittedEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, method, accountDetails } = await req.json();

    if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    if (!method) return NextResponse.json({ error: 'Method required' }, { status: 400 });
    if (!accountDetails) return NextResponse.json({ error: 'Account details required' }, { status: 400 });

    await connectDB();
    const user = await User.findById(auth.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.balance < amount) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });

    const walletAddress =
      accountDetails.type === 'crypto' ? accountDetails.address : accountDetails.accountNumber ?? '';
    const network = accountDetails.type === 'crypto' ? accountDetails.network : accountDetails.bankName ?? '';

    await User.findByIdAndUpdate(auth.userId, { $inc: { balance: -amount } });

    const transaction = await Transaction.create({
      userId: auth.userId,
      type: 'withdrawal',
      amount,
      currency: 'USD',
      status: 'pending',
      method,
      accountDetails,
      walletAddress,
      network,
    });

    sendWithdrawalSubmittedEmail(
      user.email, user.firstName, amount,
      accountDetails.type === 'crypto' ? `${accountDetails.network ?? 'Crypto'} Wallet` : accountDetails.bankName ?? 'Bank Transfer'
    );

    return NextResponse.json({ message: 'Withdrawal request submitted', transaction }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
