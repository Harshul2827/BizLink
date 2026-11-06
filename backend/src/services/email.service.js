const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initTransporter();
  }

  initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
    const pass = process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.trim().replace(/\s+/g, '') : '';
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    this.isConfigured = Boolean(user && pass);

    if (!this.isConfigured) {
      console.warn('[EMAIL NOTICE] SMTP credentials (SMTP_USER / SMTP_PASSWORD) are not configured in backend/.env.');
      console.warn('[EMAIL NOTICE] Real emails will not be dispatched to inboxes until Gmail credentials are provided.');
      console.warn('[EMAIL NOTICE] In development mode, OTP codes are logged directly to the server console and sent in dev responses.');
      return;
    }

    // Gmail optimized transport or standard SMTP
    const isGmail = (host && host.includes('gmail')) || user.endsWith('@gmail.com');
    const transportConfig = isGmail
      ? {
          service: 'gmail',
          auth: {
            user,
            pass
          }
        }
      : {
          host: host || 'smtp.gmail.com',
          port,
          secure,
          auth: {
            user,
            pass
          },
          tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production'
          }
        };

    this.transporter = nodemailer.createTransport(transportConfig);
  }

  /**
   * Base responsive HTML email layout for BizLink enterprise notifications.
   */
  renderEmailLayout({ headline, preheader, bodyHtml, otpCode, expiryMinutes = 10, warningText }) {
    const fromName = process.env.EMAIL_FROM_NAME || 'BizLink Security';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #F8FAFC; padding: 40px 0; }
    .main { background-color: #FFFFFF; margin: 0 auto; width: 100%; max-width: 580px; border-radius: 8px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.05); }
    .header { background-color: #0B1220; padding: 32px 40px; text-align: left; border-bottom: 2px solid #2563EB; }
    .logo-text { color: #FFFFFF; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; margin: 0; }
    .logo-blue { color: #3B82F6; }
    .content { padding: 40px; }
    .headline { font-size: 20px; font-weight: 700; color: #0F172A; margin: 0 0 16px 0; letter-spacing: -0.3px; }
    .lead { font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 24px 0; }
    .otp-box { background-color: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 8px; padding: 24px; text-align: center; margin: 28px 0; }
    .otp-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #2563EB; margin-bottom: 8px; }
    .otp-code { font-family: 'SF Pro Mono', 'Cascadia Code', Menlo, Monaco, Consolas, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0F172A; margin: 0; padding: 0; }
    .expiry-note { font-size: 12px; color: #64748B; margin-top: 10px; font-weight: 500; }
    .warning-box { background-color: #FFFBEB; border-left: 3px solid #D97706; padding: 14px 16px; margin: 24px 0; border-radius: 0 6px 6px 0; }
    .warning-text { font-size: 12px; line-height: 18px; color: #92400E; margin: 0; }
    .footer { background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 40px; text-align: center; }
    .footer-text { font-size: 11px; line-height: 18px; color: #94A3B8; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" class="main" align="center" cellpadding="0" cellspacing="0">
      <tr>
        <td class="header">
          <p class="logo-text">Biz<span class="logo-blue">Link</span> <span style="font-size: 11px; font-weight: 500; color: #94A3B8; margin-left: 8px; text-transform: uppercase; letter-spacing: 1px;">Enterprise Identity</span></p>
        </td>
      </tr>
      <tr>
        <td class="content">
          <h1 class="headline">${headline}</h1>
          <p class="lead">${bodyHtml}</p>
          
          <div class="otp-box">
            <div class="otp-label">One-Time Verification Passcode</div>
            <div class="otp-code">${otpCode}</div>
            <div class="expiry-note">⏱ Code expires in <strong>${expiryMinutes} minutes</strong></div>
          </div>

          <div class="warning-box">
            <p class="warning-text">${warningText}</p>
          </div>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p class="footer-text">
            This is an automated operational transmission from ${fromName}.<br>
            Please do not reply directly to this email. For security assistance, contact your institutional administrator.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
    `;
  }

  /**
   * Identifies whether an email address belongs to a mock/synthetic test domain
   * (e.g., automated test fixtures like conntest.com, biztest.com, test.com, example.com).
   * Prevents external SMTP delivery to non-existent domains which triggers Google Mailer-Daemon
   * bounce / delay warnings back to the sender account.
   *
   * Real user email addresses (Gmail, Outlook, Yahoo, institutional or corporate domains) are routed normally.
   */
  isTestRecipient(email = '') {
    if (!email || typeof email !== 'string') return true;
    if (process.env.NODE_ENV === 'test') return true;

    const lower = email.trim().toLowerCase();
    const atIndex = lower.lastIndexOf('@');
    if (atIndex === -1) return true;

    const domain = lower.slice(atIndex + 1);

    const testDomains = [
      'conntest.com',
      'biztest.com',
      'bizlinktest.com',
      'test.com',
      'example.com',
      'example.org',
      'example.net',
      'invalid',
      'localhost'
    ];

    if (testDomains.some((td) => domain === td || domain.endsWith('.' + td))) {
      return true;
    }

    if (
      domain.endsWith('.test') ||
      domain.endsWith('.example') ||
      domain.endsWith('.invalid') ||
      domain.endsWith('.localhost')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Sends 6-digit OTP for email verification during account registration.
   */
  async sendVerificationEmail(toEmail, otpCode, fullName = 'Valued Member') {
    // 1. Guard against synthetic/test domain addresses to avoid mailer-daemon bouncebacks
    if (this.isTestRecipient(toEmail)) {
      console.log(`[EMAIL TEST MOCK] Suppressed external SMTP transmission for synthetic test recipient <${toEmail}> (Verification Code: ${otpCode}). Real user email services remain active.`);
      return {
        success: true,
        mocked: true,
        messageId: `<mock-verify-${Date.now()}@bizlink.internal>`
      };
    }

    if (!this.isConfigured || !this.transporter) {
      console.warn(`[EMAIL DEV NOTICE] Verification email to ${toEmail} skipped: SMTP_USER / SMTP_PASSWORD not set in backend/.env.`);
      return { success: false, skipped: true, reason: 'SMTP not configured' };
    }

    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@bizlink.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'BizLink Verification';

    const html = this.renderEmailLayout({
      headline: 'Verify Your BizLink Corporate Email',
      preheader: `Your BizLink verification code is ${otpCode}`,
      bodyHtml: `Hello ${fullName},<br><br>Thank you for registering on BizLink. To complete your corporate account onboarding and activate verified commercial privileges, please submit the single-use verification code below.`,
      otpCode,
      expiryMinutes: 10,
      warningText: '<strong>Security Notice:</strong> If you did not initiate this registration on BizLink, please ignore this transmission. No account access will be granted without this verification code.'
    });

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: toEmail,
        subject: `BizLink Verification Code: ${otpCode}`,
        html,
        text: `Your BizLink corporate email verification code is: ${otpCode}. It expires in 10 minutes. If you did not register, please disregard this email.`
      });

      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('[EMAIL ERROR] Failed to send verification email to', toEmail, ':', err.message);
      throw new Error(`Email delivery failed: ${err.message}`);
    }
  }

  /**
   * Sends 6-digit OTP for password recovery.
   */
  async sendPasswordResetEmail(toEmail, otpCode, fullName = 'Member') {
    // 1. Guard against synthetic/test domain addresses to avoid mailer-daemon bouncebacks
    if (this.isTestRecipient(toEmail)) {
      console.log(`[EMAIL TEST MOCK] Suppressed external SMTP transmission for synthetic test recipient <${toEmail}> (Password Reset Code: ${otpCode}). Real user email services remain active.`);
      return {
        success: true,
        mocked: true,
        messageId: `<mock-reset-${Date.now()}@bizlink.internal>`
      };
    }

    if (!this.isConfigured || !this.transporter) {
      console.warn(`[EMAIL DEV NOTICE] Password reset email to ${toEmail} skipped: SMTP_USER / SMTP_PASSWORD not set in backend/.env.`);
      return { success: false, skipped: true, reason: 'SMTP not configured' };
    }

    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@bizlink.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'BizLink Security';

    const html = this.renderEmailLayout({
      headline: 'Password Reset Authorization Request',
      preheader: `Your BizLink password reset code is ${otpCode}`,
      bodyHtml: `Hello ${fullName},<br><br>We received an institutional password reset request for your BizLink operator credentials. Enter the single-use security code below to authorize setting a new password.`,
      otpCode,
      expiryMinutes: 10,
      warningText: '<strong>Important Security Notice:</strong> Never share this code with anyone. If you did not request a password reset, your account credentials may be targeted. Disregard this email and check your security settings immediately.'
    });

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: toEmail,
        subject: `BizLink Password Reset Code: ${otpCode}`,
        html,
        text: `Your BizLink password reset code is: ${otpCode}. It expires in 10 minutes. If you did not request this, ignore this email.`
      });

      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('[EMAIL ERROR] Failed to send password reset email to', toEmail, ':', err.message);
      throw new Error(`Email delivery failed: ${err.message}`);
    }
  }
}

module.exports = new EmailService();

