const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendMail({ subject, text, html }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;
  await transporter.sendMail({
    from: `"Coptic Donations" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject,
    text,
    html,
  });
}

module.exports = { sendMail };
