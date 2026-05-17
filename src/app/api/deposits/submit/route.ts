import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { sendDepositSubmittedEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const amount = parseFloat(formData.get('amount') as string);
    const paymentMethod = formData.get('paymentMethod') as string;
    const currency = formData.get('currency') as string;
    const address = formData.get('address') as string | null;
    const accountNumber = formData.get('accountNumber') as string | null;
    const proofFile = formData.get('proofOfPayment') as File | null;

    if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    if (!paymentMethod) return NextResponse.json({ error: 'Payment method required' }, { status: 400 });
    if (!proofFile) return NextResponse.json({ error: 'Proof of payment required' }, { status: 400 });

    let screenshotUrl = '';
    try {
      screenshotUrl = await uploadToCloudinary(proofFile, 'deposits');
    } catch {
      return NextResponse.json({ error: 'Failed to upload proof of payment. Please try again.' }, { status: 500 });
    }

    await connectDB();

    const deposit = await Transaction.create({
      userId: auth.userId,
      type: 'deposit',
      amount,
      currency: currency || 'USD',
      paymentMethod,
      walletAddress: address || accountNumber || '',
      screenshot: screenshotUrl,
      status: 'pending',
    });

    const user = await User.findById(auth.userId).select('firstName email').lean();
    if (user) {
      sendDepositSubmittedEmail(
        (user as any).email,
        (user as any).firstName,
        amount,
        paymentMethod === 'crypto' ? `${currency} Wallet` : 'Bank Transfer'
      );
    }

    return NextResponse.json({ message: 'Deposit submitted for review', deposit }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
