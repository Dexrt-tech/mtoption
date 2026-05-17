import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import KYC from '@/models/KYC';
import User from '@/models/User';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectDB();
    const submissions = await KYC.find()
      .sort({ submittedAt: -1 })
      .populate('userId', 'firstName lastName email')
      .lean();

    return NextResponse.json({ submissions });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { kycId, action, rejectionReason } = await req.json();
    if (!kycId || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    if (!['approve', 'reject'].includes(action)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    await connectDB();
    const kyc = await KYC.findById(kycId);
    if (!kyc) return NextResponse.json({ error: 'KYC not found' }, { status: 404 });

    kyc.status = action === 'approve' ? 'approved' : 'rejected';
    kyc.reviewedAt = new Date();
    if (action === 'reject' && rejectionReason) {
      kyc.rejectionReason = rejectionReason;
    }
    await kyc.save();

    // If approved, mark user as verified
    if (action === 'approve') {
      await User.findByIdAndUpdate(kyc.userId, { isVerified: true });
    } else {
      await User.findByIdAndUpdate(kyc.userId, { isVerified: false });
    }

    return NextResponse.json({ message: action === 'approve' ? 'KYC approved' : 'KYC rejected' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
