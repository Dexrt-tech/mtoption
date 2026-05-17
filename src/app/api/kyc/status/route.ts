import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import KYC from '@/models/KYC';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const kyc = await KYC.findOne({ userId: auth.userId }).lean();

    if (!kyc) return NextResponse.json({ status: 'none', kyc: null });

    return NextResponse.json({
      status: (kyc as any).status,
      kyc: {
        status: (kyc as any).status,
        nameOnId: (kyc as any).nameOnId,
        idType: (kyc as any).idType,
        rejectionReason: (kyc as any).rejectionReason ?? null,
        submittedAt: (kyc as any).submittedAt,
        reviewedAt: (kyc as any).reviewedAt ?? null,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
