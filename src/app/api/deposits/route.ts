import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const deposits = await Transaction.find({ userId: auth.userId, type: 'deposit' })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ deposits });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
