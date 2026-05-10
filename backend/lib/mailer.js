const { Resend } = require('resend');

async function sendViaGoogleScript(payload) {
  const body = JSON.stringify(payload);
  const headers = { 'Content-Type': 'application/json' };
  let url = process.env.GOOGLE_SCRIPT_URL;

  // Follow up to 5 redirects manually, re-POSTing each time to preserve the body
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body,
      redirect: 'manual',
    });

    console.log(`Google Script attempt ${attempt + 1}: status=${res.status} url=${url.slice(0, 80)}`);

    const isRedirect = res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308;
    if (isRedirect) {
      url = res.headers.get('location');
      if (!url) throw new Error('Google Script redirect missing Location header');
      continue;
    }

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Google Script returned unexpected response (status ${res.status}): ${text.slice(0, 300)}`);
    }
    if (!data.success) throw new Error(data.error || 'Google Script email failed');
    return;
  }

  throw new Error('Google Script: too many redirects');
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
