import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Plan from '@/models/Plan';
import Investment from '@/models/Investment';
import User from '@/models/User';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const investments = await Investment.find({ userId: auth.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ investments });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { planId, amount } = await req.json();

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: 'Plan not found or inactive' }, { status: 404 });
    }

    if (amount < plan.minAmount || amount > plan.maxAmount) {
      return NextResponse.json(
        { error: `Amount must be between $${plan.minAmount} and $${plan.maxAmount}` },
        { status: 400 }
      );
    }

    const user = await User.findById(auth.userId);
    if (!user || user.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const investment = await Investment.create({
      userId: auth.userId,
      planId: plan._id,
      planName: plan.name,
      amount,
      roiPercent: plan.roiPercent,
      durationDays: plan.durationDays,
      endDate,
    });

    await User.findByIdAndUpdate(auth.userId, { $inc: { balance: -amount } });

    return NextResponse.json({ message: 'Investment activated', investment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
