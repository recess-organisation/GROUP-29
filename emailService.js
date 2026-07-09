const nodemailer = require('nodemailer');

/**
 * Email Service for UG Scholar
 *
 * In development, emails are logged to the console instead of sent.
 * In production, configure SMTP via environment variables:
 *   EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
 *
 * Usage:
 *   const emailService = require('./services/emailService');
 *   await emailService.sendPasswordResetEmail(user.email, token);
 */

// ── Transporter ──────────────────────────────────────────────────────────────
function createTransport() {
  if (process.env.NODE_ENV === 'production' && process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Development fallback: log instead of sending
  return {
    sendMail: async (mailOptions) => {
      console.log('─── Dev Email ──────────────────────────────────────────────');
      console.log(`To:      ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Body:    ${mailOptions.text || mailOptions.html}`);
      console.log('────────────────────────────────────────────────────────────');
      return { messageId: `dev-${Date.now()}@ugscholar.local` };
    }
  };
}

const transporter = createTransport();

// ── Helpers ──────────────────────────────────────────────────────────────────
function appUrl() {
  return (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
}

function fromAddress() {
  return process.env.EMAIL_FROM || 'noreply@ugscholar.app';
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Send a password reset email with a reset link */
async function sendPasswordResetEmail(toEmail, resetToken) {
  const resetUrl = `${appUrl()}/reset-password?token=${resetToken}`;
  const text = `You requested a password reset for your UG Scholar account.\n\nClick the link below to set a new password. This link expires in 1 hour.\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

  return transporter.sendMail({
    from: fromAddress(),
    to: toEmail,
    subject: 'UG Scholar — Password Reset Request',
    text,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#FF6B6B;">UG Scholar</h2>
      <p>You requested a password reset for your UG Scholar account.</p>
      <p><a href="${resetUrl}" style="display:inline-block;background:#FF6B6B;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;">Reset password</a></p>
      <p>Or copy this link into your browser:<br/><small>${resetUrl}</small></p>
      <p>This link expires in <strong>1 hour</strong>. If you did not request this, please ignore this email.</p>
    </div>`
  });
}

/** Send a welcome email after registration */
async function sendWelcomeEmail(toEmail, fullName) {
  const text = `Welcome to UG Scholar, ${fullName}!\n\nYou've successfully created an account. You can now browse courses, enroll, and start learning.\n\nGet started: ${appUrl()}/courses`;

  return transporter.sendMail({
    from: fromAddress(),
    to: toEmail,
    subject: 'Welcome to UG Scholar!',
    text,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#FF6B6B;">Welcome to UG Scholar!</h2>
      <p>Hi ${fullName},</p>
      <p>You've successfully created your account. You can now browse courses, enroll, and start learning.</p>
      <p><a href="${appUrl()}/courses" style="display:inline-block;background:#FF6B6B;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;">Browse courses</a></p>
    </div>`
  });
}

/** Send a notification when a submission has been graded */
async function sendGradedNotification(toEmail, assignmentTitle, marksAwarded, totalMarks, feedback) {
  const text = `Your submission for "${assignmentTitle}" has been graded.\n\nMarks: ${marksAwarded} / ${totalMarks}\nFeedback: ${feedback || 'No feedback provided.'}`;

  return transporter.sendMail({
    from: fromAddress(),
    to: toEmail,
    subject: `UG Scholar — "${assignmentTitle}" Graded`,
    text,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#FF6B6B;">Assignment Graded</h2>
      <p><strong>${assignmentTitle}</strong></p>
      <p>Marks: <strong>${marksAwarded}</strong> / ${totalMarks}</p>
      ${feedback ? `<p>Feedback: ${feedback}</p>` : ''}
      <p><a href="${appUrl()}/student/grades" style="display:inline-block;background:#FF6B6B;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;">View grades</a></p>
    </div>`
  });
}

/** Send a generic notification email */
async function sendNotificationEmail(toEmail, subject, messageHtml, messageText) {
  return transporter.sendMail({
    from: fromAddress(),
    to: toEmail,
    subject: `UG Scholar — ${subject}`,
    text: messageText || messageHtml.replace(/<[^>]+>/g, ''),
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">${messageHtml}</div>`
  });
}

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendGradedNotification,
  sendNotificationEmail
};
