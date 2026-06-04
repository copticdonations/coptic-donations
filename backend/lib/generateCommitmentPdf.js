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

    const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: false });
    doc.addPage({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageW = doc.page.width;
    const margin = 40;
    const contentW = pageW - margin * 2;

    // ── Header band ──────────────────────────────────────────────
    doc.rect(0, 0, pageW, 80).fill(NAVY);
    doc
      .fillColor(GOLD)
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('COPTIC DONATIONS', margin, 14, { width: contentW, align: 'center' });
    doc
      .fillColor('#ffffff')
      .font('Helvetica')
      .fontSize(11)
      .text('Commitment Confirmation', margin, 42, { width: contentW, align: 'center' });
    doc
      .fillColor(GOLD)
      .font('Helvetica-Oblique')
      .fontSize(8)
      .text('Malachi 3:10', margin, 62, { width: contentW, align: 'center' });

    // ── Gold rule ─────────────────────────────────────────────────
    let y = 92;
    doc.moveTo(margin, y).lineTo(pageW - margin, y).strokeColor(GOLD).lineWidth(1.5).stroke();
    y += 8;

    // ── Date & tracking ──────────────────────────────────────────
    const dateStr = created_at
      ? new Date(created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    doc.fillColor(GRAY).font('Helvetica').fontSize(8.5)
      .text(`Date: ${dateStr}`, margin, y, { continued: true })
      .text(`Tracking: ${tracking_code}`, { align: 'right' });
    y += 14;

    // ── Section helper ────────────────────────────────────────────
    function sectionTitle(title, yPos) {
      doc.rect(margin, yPos, contentW, 16).fill(NAVY);
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8.5)
        .text(title, margin + 8, yPos + 3.5);
      return yPos + 22;
    }

    function row(label, value, yPos) {
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(9)
        .text(label, margin + 4, yPos, { width: 155 });
      doc.fillColor('#333333').font('Helvetica').fontSize(9)
        .text(value || '—', margin + 160, yPos, { width: contentW - 164 });
      return yPos + 15;
    }

    // ── Donor Information ─────────────────────────────────────────
    y = sectionTitle('DONOR INFORMATION', y);
    y = row('Full Name', donor_name, y);
    y = row('Email Address', donor_email, y);
    y = row('Phone Number', donor_phone, y);
    y += 5;

    // ── Item Details ──────────────────────────────────────────────
    y = sectionTitle('ITEM DETAILS', y);
    y = row('Item', item_title, y);
    if (item_cost) y = row('Estimated Cost', formatCurrency(item_cost), y);
    if (phase_label) y = row('Phase', phase_label, y);
    if (need_by_date) y = row('Needed By', formatDate(need_by_date), y);
    y = row('Tax Receipt Requested', tax_receipt_requested ? 'Yes' : 'No', y);
    y += 5;

    // ── Tracking ──────────────────────────────────────────────────
    y = sectionTitle('YOUR TRACKING CODE', y);
    doc.rect(margin, y, contentW, 26).fill(SAND);
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(14)
      .text(tracking_code, margin, y + 6, { width: contentW, align: 'center' });
    y += 34;

    // ── DISCLAIMER ────────────────────────────────────────────────
    const disclaimerH = 52;
    doc.rect(margin, y, contentW, disclaimerH).fill('#fef2f2');
    doc.rect(margin, y, 4, disclaimerH).fill(RED);
    y += 7;
    doc.fillColor(RED).font('Helvetica-Bold').fontSize(9.5)
      .text('THIS IS NOT A TAX RECEIPT', margin + 12, y, { width: contentW - 16 });
    y += 13;
    doc.fillColor('#7f1d1d').font('Helvetica').fontSize(8)
      .text(
        'Coptic Donations did not receive money. All funds go directly to the relevant church, monastery, or ministry. Coptic Donations serves only as a coordinator.',
        margin + 12, y, { width: contentW - 20 }
      );
    y += 34;

    // ── Next Steps ────────────────────────────────────────────────
    y = sectionTitle('NEXT STEPS', y);
    const steps = [
      'The coordinator will contact you by email or phone with instructions for completing your donation.',
      'You have 48 hours to respond. No response will release the commitment back to the community.',
      'Funds go directly to the church or approved party — never to Coptic Donations.',
      'Track your commitment online using the tracking code above.',
    ];
    steps.forEach((step, i) => {
      const stepY = y;
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(9)
        .text(`${i + 1}.`, margin + 4, stepY, { width: 16, lineBreak: false });
      doc.fillColor('#333333').font('Helvetica').fontSize(9)
        .text(step, margin + 20, stepY, { width: contentW - 24 });
      y = doc.y + 3;
    });
    y += 4;

    // ── Footer ────────────────────────────────────────────────────
    doc.moveTo(margin, y).lineTo(pageW - margin, y).strokeColor(GOLD).lineWidth(1).stroke();
    doc.fillColor(GRAY).font('Helvetica').fontSize(7.5)
      .text(
        'Coptic Donations · copticdonations7@gmail.com · This document is a commitment record only and has no monetary value.',
        margin, y + 6, { width: contentW, align: 'center' }
      );

    doc.end();
  });
};
