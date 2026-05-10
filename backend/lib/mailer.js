const { Resend } = require('resend');

async function sendMail({ subject, text, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.error('Email skipped: RESEND_API_KEY not set');
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'Coptic Donations <onboarding@resend.dev>',
    to: 'copticdonations7@gmail.com',
    subject,
    text,
    html,
  });
}

module.exports = { sendMail };
