import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Plan from '@/models/Plan';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const plans = await Plan.find({ isActive: true }).sort({ minAmount: 1 });
    return NextResponse.json({ plans });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
