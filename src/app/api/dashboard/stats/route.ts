import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findById(auth.userId).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [pendingAgg, monthAgg] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: user._id, type: 'withdrawal', status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: user._id, type: 'withdrawal', status: { $in: ['approved', 'completed'] }, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    return NextResponse.json({
      balance: user.balance,
      totalDeposits: user.totalDeposited,
      totalWithdrawals: user.totalWithdrawn,
      totalProfit: user.totalEarnings,
      totalEarnings: user.totalEarnings,
      pendingWithdrawals: pendingAgg[0]?.total ?? 0,
      withdrawalsThisMonth: monthAgg[0]?.total ?? 0,
      user: {
        kycStatus: 'not_submitted',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
