const { Resend } = require('resend');

async function sendMail({ to, subject, text, html, attachments }) {
  if (!process.env.RESEND_API_KEY) {
    console.error('Email skipped: RESEND_API_KEY not set');
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const payload = {
    from: 'Coptic Donations <onboarding@resend.dev>',
    to: to || 'copticdonations7@gmail.com',
    subject,
    text,
    html,
  };
  if (attachments && attachments.length) {
    payload.attachments = attachments;
  }
  await resend.emails.send(payload);
}

module.exports = { sendMail };
