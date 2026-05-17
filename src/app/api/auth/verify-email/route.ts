import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (!token) {
    return NextResponse.redirect(`${base}/verify-email?error=missing`);
  }

  try {
    await connectDB();

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.redirect(`${base}/verify-email?error=invalid`);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    // Send welcome email now that they're verified
    sendWelcomeEmail(user.email, user.firstName);

    return NextResponse.redirect(`${base}/verify-email?success=1`);
  } catch {
    return NextResponse.redirect(`${base}/verify-email?error=server`);
  }
}
