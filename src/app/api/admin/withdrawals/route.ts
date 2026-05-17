import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { sendWithdrawalApprovedEmail, sendWithdrawalRejectedEmail } from '@/lib/email';

async function requireAdmin() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== 'admin') return null;
  return auth;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();
  const withdrawals = await Transaction.find({ type: 'withdrawal' })
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 });
  return NextResponse.json({ withdrawals });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();
  const { transactionId, action } = await req.json();

  const transaction = await Transaction.findById(transactionId);
  if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

  if (action === 'approve') {
    transaction.status = 'approved';
    transaction.processedAt = new Date();
    await transaction.save();
    const user = await User.findByIdAndUpdate(
      transaction.userId,
      { $inc: { totalWithdrawn: transaction.amount } },
      { new: true }
    ).select('firstName email');
    if (user) {
      sendWithdrawalApprovedEmail(
        user.email, user.firstName, transaction.amount,
        transaction.method ?? 'Bank/Crypto'
      );
    }
    return NextResponse.json({ message: 'Withdrawal approved' });
  }

  if (action === 'reject') {
    transaction.status = 'rejected';
    transaction.processedAt = new Date();
    await transaction.save();
    const user = await User.findByIdAndUpdate(
      transaction.userId,
      { $inc: { balance: transaction.amount } },
      { new: true }
    ).select('firstName email');
    if (user) {
      sendWithdrawalRejectedEmail(user.email, user.firstName, transaction.amount);
    }
    return NextResponse.json({ message: 'Withdrawal rejected and balance refunded' });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
