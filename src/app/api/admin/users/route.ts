import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

async function requireAdmin() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== 'admin') return null;
  return auth;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();
  const raw = await User.find({}).select('-password').sort({ createdAt: -1 });
  const users = raw.map((u) => ({
    ...u.toObject(),
    hasPendingVerification: !u.isEmailVerified && !!u.emailVerificationToken,
  }));
  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();
  const body = await req.json();
  const { userId, action, amount, totalDeposited, totalWithdrawn, totalEarnings } = body;

  if (action === 'toggle-active') {
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    user.isActive = !user.isActive;
    await user.save();
    return NextResponse.json({ message: `User ${user.isActive ? 'activated' : 'suspended'}` });
  }

  if (action === 'credit-balance') {
    await User.findByIdAndUpdate(userId, { $inc: { balance: amount, totalEarnings: amount } });
    return NextResponse.json({ message: 'Balance credited' });
  }

  if (action === 'deduct-balance') {
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    await User.findByIdAndUpdate(userId, { $inc: { balance: -Math.min(amount, user.balance) } });
    return NextResponse.json({ message: 'Balance deducted' });
  }

  if (action === 'set-balance') {
    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    await User.findByIdAndUpdate(userId, { $set: { balance: amount } });
    return NextResponse.json({ message: 'Balance set successfully' });
  }

  if (action === 'verify-email') {
    await User.findByIdAndUpdate(userId, {
      $set: { isEmailVerified: true },
      $unset: { emailVerificationToken: '', emailVerificationExpiry: '' },
    });
    return NextResponse.json({ message: 'Email verified' });
  }

  if (action === 'update-stats') {
    const update: Record<string, number> = {};
    if (typeof totalDeposited === 'number') update.totalDeposited = totalDeposited;
    if (typeof totalWithdrawn === 'number') update.totalWithdrawn = totalWithdrawn;
    if (typeof totalEarnings === 'number') update.totalEarnings = totalEarnings;
    await User.findByIdAndUpdate(userId, { $set: update });
    return NextResponse.json({ message: 'Stats updated successfully' });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
