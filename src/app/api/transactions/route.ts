import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get('limit') || '10')));

    const userId = new mongoose.Types.ObjectId(auth.userId);

    const baseMatch: Record<string, unknown> = { userId };
    if (type !== 'all') baseMatch.type = type;
    if (status !== 'all') {
      if (status === 'completed') baseMatch.status = { $in: ['approved', 'completed'] };
      else baseMatch.status = status;
    }

    const [results, statsAgg] = await Promise.all([
      Transaction.aggregate([
        { $match: baseMatch },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]),
      Transaction.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            totalDeposits: {
              $sum: {
                $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', 0],
              },
            },
            totalWithdrawals: {
              $sum: {
                $cond: [{ $eq: ['$type', 'withdrawal'] }, '$amount', 0],
              },
            },
            totalEarnings: {
              $sum: {
                $cond: [{ $in: ['$type', ['earning', 'bonus']] }, '$amount', 0],
              },
            },
          },
        },
      ]),
    ]);

    const totalCount = await Transaction.countDocuments(baseMatch);

    const stats = statsAgg[0] ?? { totalCount: 0, totalDeposits: 0, totalWithdrawals: 0, totalEarnings: 0 };

    return NextResponse.json({
      transactions: results,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      limit,
      stats: {
        totalCount: stats.totalCount,
        totalDeposits: stats.totalDeposits,
        totalWithdrawals: stats.totalWithdrawals,
        totalEarnings: stats.totalEarnings,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
