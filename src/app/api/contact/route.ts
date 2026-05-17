import { NextRequest, NextResponse } from 'next/server';
import { sendContactConfirmationEmail, sendContactNotificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    // Notify admin + send confirmation to user (both fire-and-forget)
    sendContactNotificationEmail(name, email, subject, message);
    sendContactConfirmationEmail(email, name, subject);

    return NextResponse.json({ message: "Message sent successfully. We'll respond within 24 hours." });
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
