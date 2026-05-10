const PDFDocument = require('pdfkit');

const NAVY  = '#1a2e4a';
const GOLD  = '#c9a84c';
const SAND  = '#f5ede0';
const RED   = '#b91c1c';
const GRAY  = '#6b7280';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatCurrency(amount) {
  if (!amount) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

module.exports = function generateCommitmentPdf(data) {
  return new Promise((resolve, reject) => {
    const {
      donor_name, donor_email, donor_phone,
      item_title, item_cost, tracking_code,
      need_by_date, phase_label,
      tax_receipt_requested, created_at,
    } = data;

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageW = doc.page.width;
    const margin = 50;
    const contentW = pageW - margin * 2;

    // ── Header band ──────────────────────────────────────────────
    doc.rect(0, 0, pageW, 110).fill(NAVY);
    doc
      .fillColor(GOLD)
      .font('Helvetica-Bold')
      .fontSize(22)
      .text('COPTIC DONATIONS', margin, 28, { width: contentW, align: 'center' });
    doc
      .fillColor('#ffffff')
      .font('Helvetica')
      .fontSize(12)
      .text('Commitment Confirmation', margin, 58, { width: contentW, align: 'center' });
    doc
      .fillColor(GOLD)
      .font('Helvetica-Oblique')
      .fontSize(9)
      .text('Malachi 3:10', margin, 82, { width: contentW, align: 'center' });

    // ── Gold rule ─────────────────────────────────────────────────
    doc.moveDown(0);
    let y = 125;
    doc.moveTo(margin, y).lineTo(pageW - margin, y).strokeColor(GOLD).lineWidth(1.5).stroke();
    y += 14;

    // ── Date & tracking ──────────────────────────────────────────
    const dateStr = created_at
      ? new Date(created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    doc.fillColor(GRAY).font('Helvetica').fontSize(9)
      .text(`Date: ${dateStr}`, margin, y, { continued: true })
      .text(`Tracking Code: ${tracking_code}`, { align: 'right' });
    y += 24;

    // ── Section helper ────────────────────────────────────────────
    function sectionTitle(title, yPos) {
      doc.rect(margin, yPos, contentW, 20).fill(NAVY);
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10)
        .text(title, margin + 8, yPos + 5);
      return yPos + 28;
    }

    function row(label, value, yPos) {
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(10)
        .text(label, margin + 4, yPos, { width: 160 });
      doc.fillColor('#333333').font('Helvetica').fontSize(10)
        .text(value || '—', margin + 170, yPos, { width: contentW - 170 });
      return yPos + 18;
    }

    // ── Donor Information ─────────────────────────────────────────
    y = sectionTitle('DONOR INFORMATION', y);
    y = row('Full Name', donor_name, y);
    y = row('Email Address', donor_email, y);
    y = row('Phone Number', donor_phone, y);
    y += 10;

    // ── Item Details ──────────────────────────────────────────────
    y = sectionTitle('ITEM DETAILS', y);
    y = row('Item', item_title, y);
    if (item_cost) y = row('Estimated Cost', formatCurrency(item_cost), y);
    if (phase_label) y = row('Phase', phase_label, y);
    if (need_by_date) y = row('Needed By', formatDate(need_by_date), y);
    y = row('Tax Receipt Requested', tax_receipt_requested ? 'Yes' : 'No', y);
    y += 10;

    // ── Tracking ──────────────────────────────────────────────────
    y = sectionTitle('YOUR TRACKING CODE', y);
    doc.rect(margin, y, contentW, 32).fill(SAND);
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(16)
      .text(tracking_code, margin, y + 8, { width: contentW, align: 'center' });
    y += 44;

    // ── DISCLAIMER ────────────────────────────────────────────────
    doc.rect(margin, y, contentW, 70).fill('#fef2f2');
    doc.rect(margin, y, 4, 70).fill(RED);
    y += 10;
    doc.fillColor(RED).font('Helvetica-Bold').fontSize(11)
      .text('THIS IS NOT A TAX RECEIPT', margin + 12, y, { width: contentW - 16 });
    y += 16;
    doc.fillColor('#7f1d1d').font('Helvetica-Bold').fontSize(9.5)
      .text(
        'Coptic Donations did not and will not receive any money. All funds and items go directly to the relevant church, monastery, ministry, or approved third party. Coptic Donations serves only as a coordinator.',
        margin + 12, y, { width: contentW - 20 }
      );
    y += 46;

    // ── Next Steps ────────────────────────────────────────────────
    y = sectionTitle('NEXT STEPS', y);
    const steps = [
      'The coordinator will reach out to you directly via email or phone with specific instructions and next steps for completing your donation.',
      'Once contacted, you have 48 hours to respond. Failure to respond will release the commitment back to the community.',
      'Funds or items go directly to the church or approved method — never to Coptic Donations.',
      'Track your commitment online using your tracking code above.',
    ];
    steps.forEach((step, i) => {
      const stepY = y;
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(10)
        .text(`${i + 1}.`, margin + 4, stepY, { width: 18, lineBreak: false });
      doc.fillColor('#333333').font('Helvetica').fontSize(10)
        .text(step, margin + 22, stepY, { width: contentW - 26 });
      y = doc.y + 6;
    });

    // ── Footer ────────────────────────────────────────────────────
    const footerY = doc.page.height - 60;
    doc.moveTo(margin, footerY).lineTo(pageW - margin, footerY).strokeColor(GOLD).lineWidth(1).stroke();
    doc.fillColor(GRAY).font('Helvetica').fontSize(8)
      .text(
        'Coptic Donations · copticdonations7@gmail.com · This document is a commitment record only and has no monetary value.',
        margin, footerY + 8, { width: contentW, align: 'center' }
      );

    doc.end();
  });
};
