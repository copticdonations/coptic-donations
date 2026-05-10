const { Resend } = require('resend');

async function sendViaGoogleScript(payload) {
  const body = JSON.stringify(payload);
  const headers = { 'Content-Type': 'application/json' };

  // Step 1 — initial POST, capture the redirect without following it
  const res1 = await fetch(process.env.GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers,
    body,
    redirect: 'manual',
  });

  let finalRes;
  if (res1.status === 301 || res1.status === 302) {
    // Step 2 — re-POST to the redirect URL so the body is preserved
    const redirectUrl = res1.headers.get('location');
    finalRes = await fetch(redirectUrl, {
      method: 'POST',
      headers,
      body,
      redirect: 'follow',
    });
  } else {
    finalRes = res1;
  }

  const text = await finalRes.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Google Script returned unexpected response: ${text.slice(0, 200)}`);
  }
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
  to = to || 'copticdonations7@gmail.com';
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
