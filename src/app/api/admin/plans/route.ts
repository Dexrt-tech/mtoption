import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Plan from '@/models/Plan';

async function requireAdmin() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== 'admin') return null;
  return auth;
}

export async function GET() {
  await connectDB();
  const plans = await Plan.find({}).sort({ minAmount: 1 });
  return NextResponse.json({ plans });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();
  const body = await req.json();
  const plan = await Plan.create(body);
  return NextResponse.json({ plan }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();
  const { planId, ...updates } = await req.json();
  const plan = await Plan.findByIdAndUpdate(planId, updates, { new: true });
  return NextResponse.json({ plan });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();
  const { planId } = await req.json();
  await Plan.findByIdAndDelete(planId);
  return NextResponse.json({ message: 'Plan deleted' });
}
