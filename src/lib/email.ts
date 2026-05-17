import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? 'Meta Trading Option <onboarding@resend.dev>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'marvellousoveh20@gmail.com'; // internal — where admin notifications are sent
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@metatradingoption.com'; // public — shown to users
const SITE = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Meta Trading Option';

// ─── core send (fire-and-forget safe) ────────────────────────────────────────
export async function sendEmail(to: string, subject: string, html: string) {
  const result = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    replyTo: SUPPORT_EMAIL,
    headers: {
      'List-Unsubscribe': `<mailto:${SUPPORT_EMAIL}?subject=unsubscribe>`,
      'X-Priority': '3',
      'Precedence': 'bulk',
    },
  });
  if (result.error) {
    console.error('[email] Resend error sending to', to, ':', JSON.stringify(result.error));
    throw new Error(result.error.message);
  }
}

// ─── shared layout ───────────────────────────────────────────────────────────
function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${SITE}</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- header -->
        <tr>
          <td style="background:#111111;border-radius:12px 12px 0 0;padding:24px 32px;border-bottom:1px solid #1e293b;">
            <span style="font-size:22px;font-weight:700;color:#f97316;">${SITE}</span>
            <span style="font-size:14px;color:#64748b;margin-left:8px;">Investment Platform</span>
          </td>
        </tr>
        <!-- body -->
        <tr>
          <td style="background:#111111;padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- footer -->
        <tr>
          <td style="background:#0d0d0d;border-radius:0 0 12px 12px;padding:20px 32px;border-top:1px solid #1e293b;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#475569;">&copy; ${new Date().getFullYear()} ${SITE}. All rights reserved.</p>
            <p style="margin:0;font-size:12px;color:#334155;">Questions? Email us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#f97316;text-decoration:none;">${SUPPORT_EMAIL}</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(text: string, href: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#f97316;color:#fff;font-weight:600;font-size:14px;border-radius:8px;text-decoration:none;">${text}</a>`;
}

function badge(text: string, color: 'green' | 'red' | 'amber') {
  const map = {
    green: { bg: '#052e16', text: '#4ade80', border: '#166534' },
    red:   { bg: '#2d0707', text: '#f87171', border: '#7f1d1d' },
    amber: { bg: '#2d1d03', text: '#fbbf24', border: '#78350f' },
  };
  const c = map[color];
  return `<span style="display:inline-block;padding:4px 12px;background:${c.bg};color:${c.text};border:1px solid ${c.border};border-radius:999px;font-size:13px;font-weight:600;">${text}</span>`;
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:10px 0;color:#94a3b8;font-size:14px;border-bottom:1px solid #1e293b;">${label}</td>
    <td style="padding:10px 0;color:#f1f5f9;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #1e293b;">${value}</td>
  </tr>`;
}

// ─── 1. Welcome email (after signup) ─────────────────────────────────────────
export async function sendWelcomeEmail(to: string, firstName: string) {
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#f1f5f9;">Welcome to ${SITE}, ${firstName}! 🎉</h2>
    <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;line-height:1.6;">
      Your account has been created successfully. You're now part of a growing community of investors.
    </p>
    <table width="100%" style="border:1px solid #1e293b;border-radius:8px;overflow:hidden;margin-bottom:20px;">
      <tr style="background:#1a1a2e;">
        <td style="padding:16px 20px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">What you can do now</td>
      </tr>
      ${['Make your first deposit to start investing', 'Browse available investment plans', 'Complete your KYC verification for higher limits', 'Refer friends and earn bonuses'].map(t =>
        `<tr><td style="padding:12px 20px;font-size:14px;color:#cbd5e1;border-top:1px solid #1e293b;">✓ &nbsp;${t}</td></tr>`
      ).join('')}
    </table>
    <p style="margin:0 0 4px;color:#94a3b8;font-size:14px;">Ready to start? Make your first deposit today.</p>
    ${btn('Go to Dashboard', `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard`)}
    <p style="margin:24px 0 0;font-size:13px;color:#475569;">
      If you didn't create this account, please contact us immediately at
      <a href="mailto:${SUPPORT_EMAIL}" style="color:#f97316;">${SUPPORT_EMAIL}</a>.
    </p>
  `);
  await sendEmail(to, `Welcome to ${SITE} — Your account is ready`, html);
}

// ─── 2. Deposit submitted (pending review) ───────────────────────────────────
export async function sendDepositSubmittedEmail(
  to: string, firstName: string, amount: number, method: string
) {
  const html = layout(`
    <div style="margin-bottom:20px;">${badge('Pending Review', 'amber')}</div>
    <h2 style="margin:0 0 8px;font-size:22px;color:#f1f5f9;">Deposit Received</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;">
      Hi ${firstName}, we've received your deposit and it's now under review.
    </p>
    <table width="100%" style="border:1px solid #1e293b;border-radius:8px;border-spacing:0;margin-bottom:24px;">
      <tr style="background:#1a1a2e;"><td colspan="2" style="padding:14px 20px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Transaction Details</td></tr>
      ${row('Amount', `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)}
      ${row('Payment Method', method)}
      ${row('Status', 'Pending Review')}
      ${row('Date', new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }))}
    </table>
    <p style="margin:0 0 4px;color:#94a3b8;font-size:14px;">
      Deposits are typically processed within <strong style="color:#f1f5f9;">10–30 minutes</strong>.
      You'll receive another email once it's approved and your balance is updated.
    </p>
    ${btn('View Dashboard', `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard`)}
  `);
  await sendEmail(to, `Deposit of $${amount.toFixed(2)} received — Under review`, html);
}

// ─── 3. Deposit approved ─────────────────────────────────────────────────────
export async function sendDepositApprovedEmail(
  to: string, firstName: string, amount: number, method: string
) {
  const html = layout(`
    <div style="margin-bottom:20px;">${badge('Approved ✓', 'green')}</div>
    <h2 style="margin:0 0 8px;font-size:22px;color:#f1f5f9;">Your Deposit Has Been Approved!</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;">
      Great news, ${firstName}! Your deposit has been approved and your account balance has been updated.
    </p>
    <table width="100%" style="border:1px solid #1e293b;border-radius:8px;border-spacing:0;margin-bottom:24px;">
      <tr style="background:#1a1a2e;"><td colspan="2" style="padding:14px 20px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Transaction Details</td></tr>
      ${row('Amount Credited', `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)}
      ${row('Payment Method', method)}
      ${row('Status', 'Approved')}
      ${row('Processed', new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }))}
    </table>
    <p style="margin:0 0 4px;color:#94a3b8;font-size:14px;">
      Your funds are now available in your account. Start investing today!
    </p>
    ${btn('Start Investing', `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/investments`)}
  `);
  await sendEmail(to, `✅ Deposit of $${amount.toFixed(2)} approved — Funds added to your account`, html);
}

// ─── 4. Deposit rejected ─────────────────────────────────────────────────────
export async function sendDepositRejectedEmail(
  to: string, firstName: string, amount: number, reason?: string
) {
  const html = layout(`
    <div style="margin-bottom:20px;">${badge('Rejected', 'red')}</div>
    <h2 style="margin:0 0 8px;font-size:22px;color:#f1f5f9;">Deposit Could Not Be Processed</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;">
      Hi ${firstName}, unfortunately we were unable to approve your deposit of
      <strong style="color:#f1f5f9;">$${amount.toFixed(2)}</strong>.
    </p>
    ${reason ? `<div style="background:#2d0707;border:1px solid #7f1d1d;border-radius:8px;padding:16px;margin-bottom:24px;"><p style="margin:0;font-size:14px;color:#fca5a5;"><strong>Reason:</strong> ${reason}</p></div>` : ''}
    <p style="margin:0 0 16px;color:#94a3b8;font-size:14px;">
      Common reasons for rejection include:
    </p>
    <ul style="margin:0 0 20px;padding-left:20px;color:#94a3b8;font-size:14px;line-height:2;">
      <li>Proof of payment image was unclear or unreadable</li>
      <li>The transferred amount didn't match the submitted amount</li>
      <li>Payment was sent to an incorrect address</li>
    </ul>
    <p style="margin:0 0 4px;color:#94a3b8;font-size:14px;">
      Please submit a new deposit with the correct details, or contact our support team for help.
    </p>
    ${btn('Try Again', `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/deposit`)}
    <p style="margin:24px 0 0;font-size:13px;color:#475569;">
      Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#f97316;">${SUPPORT_EMAIL}</a>
    </p>
  `);
  await sendEmail(to, `Deposit of $${amount.toFixed(2)} could not be processed`, html);
}

// ─── 5. Withdrawal submitted ─────────────────────────────────────────────────
export async function sendWithdrawalSubmittedEmail(
  to: string, firstName: string, amount: number, method: string
) {
  const html = layout(`
    <div style="margin-bottom:20px;">${badge('Processing', 'amber')}</div>
    <h2 style="margin:0 0 8px;font-size:22px;color:#f1f5f9;">Withdrawal Request Received</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;">
      Hi ${firstName}, your withdrawal request has been submitted and is being processed.
    </p>
    <table width="100%" style="border:1px solid #1e293b;border-radius:8px;border-spacing:0;margin-bottom:24px;">
      <tr style="background:#1a1a2e;"><td colspan="2" style="padding:14px 20px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Withdrawal Details</td></tr>
      ${row('Amount Requested', `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)}
      ${row('Withdrawal Method', method)}
      ${row('Status', 'Under Review')}
      ${row('Requested', new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }))}
    </table>
    <p style="margin:0 0 4px;color:#94a3b8;font-size:14px;">
      Withdrawals are typically processed within <strong style="color:#f1f5f9;">24–48 hours</strong>.
      You'll receive an email once the funds have been sent.
    </p>
    ${btn('View Transactions', `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/transactions`)}
  `);
  await sendEmail(to, `Withdrawal of $${amount.toFixed(2)} submitted — Under review`, html);
}

// ─── 6. Withdrawal approved ──────────────────────────────────────────────────
export async function sendWithdrawalApprovedEmail(
  to: string, firstName: string, amount: number, method: string
) {
  const html = layout(`
    <div style="margin-bottom:20px;">${badge('Approved ✓', 'green')}</div>
    <h2 style="margin:0 0 8px;font-size:22px;color:#f1f5f9;">Withdrawal Approved & Sent!</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;">
      Hi ${firstName}, your withdrawal has been approved and the funds are on their way to you.
    </p>
    <table width="100%" style="border:1px solid #1e293b;border-radius:8px;border-spacing:0;margin-bottom:24px;">
      <tr style="background:#1a1a2e;"><td colspan="2" style="padding:14px 20px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Withdrawal Details</td></tr>
      ${row('Amount Sent', `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)}
      ${row('Method', method)}
      ${row('Status', 'Approved & Sent')}
      ${row('Processed', new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }))}
    </table>
    <p style="margin:0 0 4px;color:#94a3b8;font-size:14px;">
      Depending on your bank or crypto network, funds may take a short time to arrive.
      If you don't receive the funds within 3 business days, please contact support.
    </p>
    ${btn('View Transactions', `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/transactions`)}
  `);
  await sendEmail(to, `✅ Withdrawal of $${amount.toFixed(2)} approved — Funds sent`, html);
}

// ─── 7. Withdrawal rejected ──────────────────────────────────────────────────
export async function sendWithdrawalRejectedEmail(
  to: string, firstName: string, amount: number, reason?: string
) {
  const html = layout(`
    <div style="margin-bottom:20px;">${badge('Rejected', 'red')}</div>
    <h2 style="margin:0 0 8px;font-size:22px;color:#f1f5f9;">Withdrawal Request Declined</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;">
      Hi ${firstName}, your withdrawal request of <strong style="color:#f1f5f9;">$${amount.toFixed(2)}</strong>
      could not be processed. The amount has been <strong style="color:#4ade80;">refunded back to your balance</strong>.
    </p>
    ${reason ? `<div style="background:#2d0707;border:1px solid #7f1d1d;border-radius:8px;padding:16px;margin-bottom:24px;"><p style="margin:0;font-size:14px;color:#fca5a5;"><strong>Reason:</strong> ${reason}</p></div>` : ''}
    <p style="margin:0 0 4px;color:#94a3b8;font-size:14px;">
      Your balance has been restored. You may submit a new withdrawal request or contact our support team.
    </p>
    ${btn('View Balance', `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard`)}
    <p style="margin:24px 0 0;font-size:13px;color:#475569;">
      Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#f97316;">${SUPPORT_EMAIL}</a>
    </p>
  `);
  await sendEmail(to, `Withdrawal of $${amount.toFixed(2)} declined — Balance restored`, html);
}

// ─── 8. Contact form — confirmation to user ──────────────────────────────────
export async function sendContactConfirmationEmail(
  to: string, name: string, subject: string
) {
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#f1f5f9;">We got your message!</h2>
    <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">
      Hi ${name}, thank you for reaching out to ${SITE} support. We've received your message
      and will respond within <strong style="color:#f1f5f9;">24 hours</strong>.
    </p>
    <table width="100%" style="border:1px solid #1e293b;border-radius:8px;border-spacing:0;margin-bottom:24px;">
      <tr style="background:#1a1a2e;"><td colspan="2" style="padding:14px 20px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Your Request</td></tr>
      ${row('Subject', subject || 'General Inquiry')}
      ${row('Submitted', new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }))}
    </table>
    <p style="margin:0;font-size:13px;color:#475569;">
      Our support email is <a href="mailto:${SUPPORT_EMAIL}" style="color:#f97316;">${SUPPORT_EMAIL}</a> if you need to follow up.
    </p>
  `);
  await sendEmail(to, `We received your message — ${SITE} Support`, html);
}

// ─── 9. Contact form — notification to admin ─────────────────────────────────
export async function sendContactNotificationEmail(
  name: string, userEmail: string, subject: string, message: string
) {
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#f1f5f9;">New Support Message</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;">A user has submitted a contact form message.</p>
    <table width="100%" style="border:1px solid #1e293b;border-radius:8px;border-spacing:0;margin-bottom:24px;">
      <tr style="background:#1a1a2e;"><td colspan="2" style="padding:14px 20px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Message Details</td></tr>
      ${row('From', `${name} (${userEmail})`)}
      ${row('Subject', subject || 'General Inquiry')}
      ${row('Received', new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }))}
    </table>
    <div style="background:#1a1a2e;border:1px solid #1e293b;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;">Message</p>
      <p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.7;">${message.replace(/\n/g, '<br>')}</p>
    </div>
    <p style="margin:0;font-size:13px;color:#475569;">
      Reply directly to <a href="mailto:${userEmail}" style="color:#f97316;">${userEmail}</a>
    </p>
  `);
  await sendEmail(ADMIN_EMAIL, `[Support] ${subject || 'New message'} from ${name}`, html);
}

// ─── 10. Email verification ───────────────────────────────────────────────────
export async function sendEmailVerificationEmail(to: string, firstName: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/verify-email?token=${token}`;
  const html = layout(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#f1f5f9;">Verify your email address</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
      Hi ${firstName}, thanks for signing up with ${SITE}! Click the button below to verify your email address and activate your account.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${url}" style="display:inline-block;padding:14px 36px;background:#f97316;color:#fff;font-weight:700;font-size:15px;border-radius:8px;text-decoration:none;letter-spacing:0.01em;">
        Verify My Email
      </a>
    </div>
    <p style="margin:0 0 8px;color:#64748b;font-size:13px;">Or copy and paste this link into your browser:</p>
    <p style="margin:0 0 24px;word-break:break-all;font-size:12px;color:#f97316;">${url}</p>
    <div style="background:#1e293b;border-radius:8px;padding:14px 18px;margin-bottom:0;">
      <p style="margin:0;font-size:13px;color:#64748b;">
        This link expires in <strong style="color:#94a3b8;">24 hours</strong>. If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  `);
  await sendEmail(to, `Verify your email — ${SITE}`, html);
}
