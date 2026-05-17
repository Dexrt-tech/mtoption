import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import KYC from '@/models/KYC';
import User from '@/models/User';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const form = await req.formData();
    const nameOnId = (form.get('nameOnId') as string)?.trim();
    const idType = form.get('idType') as string;
    const govIdFront = form.get('govIdFront') as File | null;
    const govIdBack = form.get('govIdBack') as File | null;
    const proofOfAddress = form.get('proofOfAddress') as File | null;
    const selfie = form.get('selfie') as File | null;

    if (!nameOnId) return NextResponse.json({ error: 'Name on ID is required' }, { status: 400 });
    if (!idType) return NextResponse.json({ error: 'ID type is required' }, { status: 400 });
    if (!govIdFront) return NextResponse.json({ error: 'Government ID front is required' }, { status: 400 });
    if (!proofOfAddress) return NextResponse.json({ error: 'Proof of address is required' }, { status: 400 });
    if (!selfie) return NextResponse.json({ error: 'Selfie is required' }, { status: 400 });

    await connectDB();

    // Check for existing approved KYC
    const existing = await KYC.findOne({ userId: auth.userId });
    if (existing?.status === 'approved') {
      return NextResponse.json({ error: 'KYC already approved' }, { status: 400 });
    }
    if (existing?.status === 'pending') {
      return NextResponse.json({ error: 'KYC already under review' }, { status: 400 });
    }

    // Upload all documents
    let govIdFrontUrl: string;
    let govIdBackUrl = '';
    let proofOfAddressUrl: string;
    let selfieUrl: string;

    try {
      [govIdFrontUrl, proofOfAddressUrl, selfieUrl] = await Promise.all([
        uploadToCloudinary(govIdFront, 'kyc/gov-id'),
        uploadToCloudinary(proofOfAddress, 'kyc/proof-of-address'),
        uploadToCloudinary(selfie, 'kyc/selfie'),
      ]);
      if (govIdBack && govIdBack.size > 0) {
        govIdBackUrl = await uploadToCloudinary(govIdBack, 'kyc/gov-id');
      }
    } catch {
      return NextResponse.json({ error: 'Failed to upload documents. Please try again.' }, { status: 500 });
    }

    // Upsert KYC record (allow resubmission after rejection)
    await KYC.findOneAndUpdate(
      { userId: auth.userId },
      {
        userId: auth.userId,
        status: 'pending',
        nameOnId,
        idType,
        govIdFrontUrl,
        govIdBackUrl,
        proofOfAddressUrl,
        selfieUrl,
        rejectionReason: undefined,
        reviewedAt: undefined,
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: 'KYC submitted successfully' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
