import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { formatCurrency } from '../lib/utils';
import { createDonation } from '../lib/api';
import Spinner from '../components/ui/Spinner';

export default function CheckoutPage() {
  const router = useRouter();
  const [pending, setPending] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const data = sessionStorage.getItem('pendingDonation');
    if (!data) {
      router.replace('/');
    } else {
      setPending(JSON.parse(data));
    }
  }, [router]);

  async function handleDonate() {
    setError('');
    setSubmitting(true);
    try {
      const result = await createDonation({
        item_id: pending.item_id,
        donor_name: pending.donor_name,
        donor_email: pending.donor_email,
        amount: pending.amount,
      });
      sessionStorage.removeItem('pendingDonation');
      sessionStorage.setItem('donationSuccess', JSON.stringify({
        tracking_code: result.tracking_code,
        donor_name: pending.donor_name,
        item_title: pending.item_title,
        amount: pending.amount,
      }));
      router.push('/success');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!pending) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href={`/items/${pending.item_id}`} className="text-gold hover:text-gold-dark text-sm font-semibold flex items-center gap-1 mb-6">
        <span>&#8592;</span> Back to item
      </Link>

      <h1 className="text-3xl font-bold text-navy mb-2">Review Your Donation</h1>
      <p className="text-gray-500 mb-8">Please review the details below before confirming.</p>

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        {pending.item_image_url && (
          <div className="aspect-video bg-sand-dark">
            <img src={pending.item_image_url} alt={pending.item_title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <h2 className="text-xl font-bold text-navy">{pending.item_title}</h2>
          {pending.category && (
            <span className="text-xs bg-navy text-gold px-2 py-0.5 rounded font-semibold mt-1 inline-block">
              {pending.category}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-bold text-navy mb-4 border-b border-sand-dark pb-2">Donation Summary</h3>
        <dl className="flex flex-col gap-3">
          <Row label="Donor Name" value={pending.donor_name} />
          {pending.donor_email && <Row label="Email" value={pending.donor_email} />}
          <Row label="Item" value={pending.item_title} />
          <Row
            label="Donation Amount"
            value={<span className="text-gold font-bold text-xl">{formatCurrency(pending.amount)}</span>}
          />
        </dl>
      </div>

      <div className="bg-gold-light border border-gold rounded-xl p-4 mb-6 text-sm text-navy-dark">
        <strong>Note:</strong> This is a demo site. No real payment will be processed. Clicking "Donate Now" will record your donation and generate a tracking code.
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleDonate}
        disabled={submitting}
        className="btn-primary w-full text-center text-lg py-4 flex items-center justify-center gap-3"
      >
        {submitting ? (
          <>
            <Spinner size="sm" />
            Processing...
          </>
        ) : (
          'Donate Now'
        )}
      </button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <dt className="text-gray-500 text-sm">{label}</dt>
      <dd className="font-semibold text-navy">{value}</dd>
    </div>
  );
}
