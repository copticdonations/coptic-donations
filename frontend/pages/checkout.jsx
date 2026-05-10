import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { formatCurrency, formatDate } from '../lib/utils';
import { createDonation, uploadDonorReceipt } from '../lib/api';
import Spinner from '../components/ui/Spinner';

export default function CheckoutPage() {
  const router = useRouter();
  const [pending, setPending] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    const data = sessionStorage.getItem('pendingDonation');
    if (!data) router.replace('/');
    else setPending(JSON.parse(data));
  }, [router]);

  async function handleCommit() {
    setError('');
    setSubmitting(true);
    try {
      const result = await createDonation({
        item_id: pending.item_id,
        donor_name: pending.donor_name,
        donor_email: pending.donor_email || undefined,
        donor_phone: pending.donor_phone || undefined,
        tax_receipt_requested: pending.tax_receipt_requested ? 1 : 0,
        anonymous: pending.anonymous ? 1 : 0,
        commitment_details: pending.commitment_details || undefined,
      });

      if (receiptFile && result.donation_id) {
        const fd = new FormData();
        fd.append('receipt', receiptFile);
        await uploadDonorReceipt(result.donation_id, fd).catch(() => {});
      }

      sessionStorage.removeItem('pendingDonation');
      sessionStorage.setItem('donationSuccess', JSON.stringify({
        tracking_code: result.tracking_code,
        donor_name: pending.donor_name,
        item_title: pending.item_title,
      }));
      router.push('/success');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!pending) {
    return <div className="flex justify-center items-center min-h-[50vh]"><Spinner size="lg" /></div>;
  }

  const unitCost = pending.unit_cost || 0;
  const cd = pending.commitment_details || {};
  const selectedPhases = cd.selected_phases || [];
  const qty = cd.selected_qty || (selectedPhases.length === 0 ? 1 : null);
  const total = cd.total_amount || (unitCost * (qty || 1)) || null;

const PAYMENT_LABELS = {
  direct_vendor: 'Direct to Vendor',
  online_purchase: 'Online Purchase',
  church_fund: 'Church General Fund',
  other: 'Other',
};

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href={`/items/${pending.item_id}`} className="text-gold hover:text-gold-dark text-sm font-semibold flex items-center gap-1 mb-6">
        <span>&#8592;</span> Back to item
      </Link>

      <h1 className="text-3xl font-bold text-navy mb-2">Review Your Commitment</h1>
      <p className="text-gray-500 mb-8">Please review all details before confirming.</p>

      {/* Item image */}
      {pending.item_image_url && (
        <div className="rounded-xl overflow-hidden shadow-md mb-6 bg-sand-dark">
          <img src={pending.item_image_url} alt={pending.item_title} className="w-full max-h-56 object-cover" />
        </div>
      )}

      {/* Full summary */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-bold text-navy mb-4 border-b border-sand-dark pb-2">Commitment Summary</h3>
        <dl className="flex flex-col gap-3">
          <Row label="Item" value={pending.item_title} />
          {pending.category && <Row label="Category" value={pending.category} />}
          {pending.payment_method && <Row label="Payment Method" value={PAYMENT_LABELS[pending.payment_method] || pending.payment_method} />}
          {unitCost > 0 && <Row label="Cost per Unit" value={formatCurrency(unitCost)} />}

          {/* Multi-phase breakdown */}
          {selectedPhases.length > 0 && (
            <div className="border-t border-sand-dark pt-2 mt-1">
              {selectedPhases.map((ph, i) => (
                <div key={i} className="flex justify-between items-start py-1 text-sm">
                  <div>
                    <p className="font-semibold text-navy">{ph.phase_label || `Phase ${i + 1}`}</p>
                    {ph.target_date && <p className="text-xs text-gray-400">Needed by {formatDate(ph.target_date)}</p>}
                    <p className="text-xs text-gray-500">{ph.quantity} unit{ph.quantity !== 1 ? 's' : ''} × {formatCurrency(ph.unit_cost)}</p>
                  </div>
                  <span className="font-bold text-navy">{formatCurrency(ph.subtotal)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Single qty */}
          {qty > 1 && selectedPhases.length === 0 && <Row label="Quantity" value={`${qty} units`} />}
          {pending.need_by_date && (
            <Row label="Needed By" value={<span className="text-red-600 font-bold">{formatDate(pending.need_by_date)}</span>} />
          )}
          {total > 0 && (
            <Row label="Total" value={<span className="text-navy font-bold text-lg">{formatCurrency(total)}</span>} />
          )}
          <div className="border-t border-sand-dark my-1" />
          <Row label="Your Name" value={pending.donor_name} />
          <Row label="Email" value={pending.donor_email} />
          <Row label="Phone" value={pending.donor_phone} />
          {pending.tax_receipt_requested && (
            <Row label="Tax Receipt" value={<span className="text-green-700 font-semibold">Requested</span>} />
          )}
        </dl>
      </div>

      {/* Receipt upload — only if tax receipt requested */}
      {pending.tax_receipt_requested && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-navy mb-1">Upload Your Receipt</h3>
          <p className="text-sm text-gray-500 mb-4">
            If you have already made your purchase, you can upload your receipt now. You can also do this later from your tracking page.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={e => setReceiptFile(e.target.files[0] || null)}
            className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:bg-gold-light file:text-navy file:font-semibold hover:file:bg-gold cursor-pointer"
          />
          <p className="text-xs text-gray-400 mt-1">Accepted: JPEG, PNG, WebP, or PDF — max 5 MB</p>
          {receiptFile && (
            <p className="text-xs text-green-700 font-semibold mt-2">✓ {receiptFile.name} selected</p>
          )}
        </div>
      )}

      {/* Commitment notice */}
      <div className="bg-gold-light border border-gold rounded-xl p-4 mb-4 text-sm text-navy-dark leading-relaxed">
        By confirming, you are committing to cover the cost of this item within 48 hours of being contacted by Coptic Donations with instructions, or as soon as possible thereafter.
      </div>

      {/* 48h warning */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-800">
        <strong>Please note:</strong> Once we contact you via email or phone, you have <strong>48 hours</strong> to respond.
        If we do not hear back within 48 hours, we will unfortunately need to release this commitment and make it available again on the website.
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>
      )}

      <button
        onClick={handleCommit}
        disabled={submitting}
        className="btn-primary w-full text-center text-lg py-4 flex items-center justify-center gap-3"
      >
        {submitting ? <><Spinner size="sm" /> Processing...</> : 'Confirm Commitment'}
      </button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <dt className="text-gray-500 text-sm flex-shrink-0">{label}</dt>
      <dd className="font-semibold text-navy text-right text-sm">{value}</dd>
    </div>
  );
}
