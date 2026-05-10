const { Resend } = require('resend');

async function sendViaGoogleScript(payload) {
  const res = await fetch(process.env.GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Google Script email failed');
}

async function sendViaResend(payload) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const msg = {
    from: 'Coptic Donations <onboarding@resend.dev>',
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  };
  if (payload.attachments) msg.attachments = payload.attachments;
  await resend.emails.send(msg);
}

async function sendMail({ to, subject, text, html, attachments }) {
  const useGoogleScript = !!process.env.GOOGLE_SCRIPT_URL;
  const useResend = !!process.env.RESEND_API_KEY;

  if (!useGoogleScript && !useResend) {
    console.error('Email skipped: no GOOGLE_SCRIPT_URL or RESEND_API_KEY set');
    return;
  }

  if (useGoogleScript) {
    const payload = { to, subject, text: text || '', html };
    if (attachments && attachments[0]) {
      payload.pdfBase64 = attachments[0].content;
      payload.pdfFilename = attachments[0].filename;
    }
    await sendViaGoogleScript(payload);
    return;
  }

  await sendViaResend({ to, subject, html, attachments });
}

module.exports = { sendMail };
