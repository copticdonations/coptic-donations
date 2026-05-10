import { useState } from 'react';
import Link from 'next/link';
import Timeline from '../../components/tracking/Timeline';
import { formatDate, formatCurrency } from '../../lib/utils';
import { uploadDonorReceipt, subscribeNewsletter } from '../../lib/api';

const PAYMENT_LABELS = {
  direct_vendor: 'Direct to Vendor — Pay the seller directly via Venmo, Zelle, PayPal, Cash App, or Apple Pay',
  online_purchase: 'Online Purchase — Buy directly through Amazon, eBay, etc. and ship to the provided address',
  church_fund: 'Church General Fund — Donate to the church\'s general fund with a note specifying the item',
  other: 'See payment instructions provided',
};

export async function getServerSideProps({ params }) {
  if (params.code === 'lookup') return { props: { lookup: true } };
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const res = await fetch(`${backendUrl}/api/tracking/${encodeURIComponent(params.code)}`);
    if (!res.ok) return { props: { notFound: true } };
    const data = await res.json();
    return { props: { donation: data.donation, statusUpdates: data.status_updates } };
  } catch {
    return { props: { error: true } };
  }
}

export default function TrackingPage({ lookup, notFound, error, donation, statusUpdates }) {
  if (lookup) return <LookupPage />;
  if (notFound) return <NotFoundPage />;
  if (error) return <ErrorPage />;

  const currentStatus = statusUpdates.length > 0 ? statusUpdates[statusUpdates.length - 1].status : 'commitment_received';
  const isCompleted = currentStatus === 'completed';
  const showTaxReceiptStep = donation.tax_receipt_requested === 1 || donation.item_tax_receipt === 'yes';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="no-print">
        <Link href="/" className="text-gold hover:text-gold-dark text-sm font-semibold flex items-center gap-1 mb-6">
          <span>&#8592;</span> Back to home
        </Link>
      </div>

      <div className="bg-navy rounded-2xl p-6 md:p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-gold text-sm font-semibold uppercase tracking-wider mb-1">Tracking Code</p>
            <p className="text-2xl font-mono font-bold tracking-widest">{donation.tracking_code}</p>
          </div>
          <div className="text-right md:text-left">
            <p className="text-sand opacity-70 text-sm">Committed on</p>
            <p className="text-sand font-semibold">{formatDate(donation.created_at)}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-5 md:col-span-2">
          <h2 className="text-lg font-bold text-navy mb-3">Commitment Details</h2>
          <dl className="flex flex-col gap-2">
            <Row label="Committed by" value={donation.anonymous ? 'Anonymous' : donation.donor_name} />
            <Row label="Item" value={donation.item_title} />
            {donation.category && <Row label="Category" value={donation.category} />}
            {donation.service_benefiting && <Row label="Service" value={donation.service_benefiting} />}
            {donation.item_cost > 0 && (
              <Row label="Cost per Unit" value={formatCurrency(donation.item_cost)} />
            )}
            {donation.payment_method && (
              <Row label="Payment Method" value={PAYMENT_LABELS[donation.payment_method] || donation.payment_method} />
            )}
            {donation.payment_instructions && (
              <Row label="Instructions" value={donation.payment_instructions} />
            )}
            {donation.item_link && (
              <Row label="Reference" value={<a href={donation.item_link} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline text-xs">View Link ↗</a>} />
            )}
            {donation.purchase_date && <Row label="Purchased" value={formatDate(donation.purchase_date)} />}
            {donation.purchase_location && <Row label="From" value={donation.purchase_location} />}
          </dl>

          {/* Commitment breakdown */}
          {(() => {
            try {
              const cd = typeof donation.commitment_details === 'string'
                ? JSON.parse(donation.commitment_details)
                : donation.commitment_details;
              if (!cd) return null;
              const phases = cd.selected_phases || [];
              return (
                <div className="mt-4 pt-4 border-t border-sand-dark">
                  <p className="text-xs font-bold text-navy uppercase tracking-wide mb-2">What You Committed To</p>
                  {phases.length > 0 ? (
                    <>
                      {phases.map((ph, i) => (
                        <div key={i} className="flex justify-between items-start py-1.5 border-b border-sand-dark last:border-0">
                          <div>
                            <p className="text-sm font-semibold text-navy">{ph.phase_label || `Phase ${i + 1}`}</p>
                            {ph.target_date && <p className="text-xs text-gray-400">Needed by {formatDate(ph.target_date)}</p>}
                            <p className="text-xs text-gray-500">{ph.quantity} unit{ph.quantity !== 1 ? 's' : ''} × {formatCurrency(ph.unit_cost)}</p>
                          </div>
                          <span className="font-bold text-navy text-sm">{formatCurrency(ph.subtotal)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between mt-2 font-bold text-navy">
                        <span>Total ({phases.reduce((s, p) => s + p.quantity, 0)} units)</span>
                        <span className="text-gold">{formatCurrency(cd.total_amount)}</span>
                      </div>
                    </>
                  ) : cd.selected_qty ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{cd.selected_qty} unit{cd.selected_qty !== 1 ? 's' : ''}</span>
                      {cd.total_amount > 0 && <span className="font-bold text-gold">{formatCurrency(cd.total_amount)}</span>}
                    </div>
                  ) : null}
                </div>
              );
            } catch { return null; }
          })()}
        </div>

        {donation.item_image_url && (
          <div className="rounded-xl overflow-hidden shadow-md aspect-video md:aspect-auto bg-sand-dark">
            <img src={donation.item_image_url} alt={donation.item_title} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-8">
        <h2 className="text-xl font-bold text-navy mb-6">Commitment Journey</h2>
        <Timeline statusUpdates={statusUpdates} showTaxReceipt={showTaxReceiptStep} />
      </div>

      {isCompleted && donation.installation_photo_url && (
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border-2 border-gold mb-8">
          <h2 className="text-xl font-bold text-navy mb-2">Your Gift Has Been Received!</h2>
          <p className="text-gray-500 text-sm mb-4">
            Thanks to your generosity, this item is now serving our community. May God bless you abundantly.
          </p>
          <div className="rounded-xl overflow-hidden">
            <img
              src={donation.installation_photo_url}
              alt="Completed donation"
              className="w-full object-cover max-h-96"
            />
          </div>
        </div>
      )}

      {isCompleted && !donation.installation_photo_url && (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-6 text-center mb-8">
          <p className="text-green-700 font-bold text-lg">Your commitment has been fulfilled!</p>
          <p className="text-green-600 text-sm mt-1">A photo will be uploaded soon. Thank you.</p>
        </div>
      )}

      <ReceiptUpload donation={donation} />

      <div className="flex justify-center gap-4 mt-6 no-print">
        <button onClick={() => window.print()} className="btn-secondary text-sm px-4 py-2">
          Print / Save PDF
        </button>
      </div>

      {isCompleted && <NewsletterSignup />}
    </div>
  );
}

function ReceiptUpload({ donation }) {
  const [file, setFile] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseLocation, setPurchaseLocation] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (donation.receipt_image_url) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 no-print">
        <h3 className="font-bold text-navy mb-2">Receipt Uploaded</h3>
        <p className="text-sm text-gray-500 mb-3">Thank you for uploading your receipt.</p>
        <a href={donation.receipt_image_url} target="_blank" rel="noopener noreferrer"
          className="text-gold hover:text-gold-dark text-sm font-semibold">
          View Receipt &#8599;
        </a>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return setError('Please select a receipt image.');
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('receipt', file);
      if (purchaseDate) fd.append('purchase_date', purchaseDate);
      if (purchaseLocation) fd.append('purchase_location', purchaseLocation);
      await uploadDonorReceipt(donation.id, fd);
      setSuccess('Receipt uploaded successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6 no-print">
      <h3 className="font-bold text-navy mb-1">Upload Your Receipt</h3>
      <p className="text-sm text-gray-500 mb-4">
        Once you have purchased the item, upload your receipt so we can track it.
      </p>
      {success && <p className="text-green-600 text-sm mb-3 font-semibold">{success}</p>}
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {!success && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Purchase Date</label>
              <input type="date" className="input" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Store / Location</label>
              <input type="text" className="input" placeholder="e.g. Amazon, Walmart" value={purchaseLocation} onChange={e => setPurchaseLocation(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Receipt Image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={e => setFile(e.target.files[0])}
              className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:bg-gold-light file:text-navy file:font-semibold hover:file:bg-gold cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">Accepted: JPEG, PNG, WebP, or PDF — max 5 MB</p>
          </div>
          <button type="submit" disabled={uploading} className="btn-secondary self-start text-sm px-4 py-2">
            {uploading ? 'Uploading...' : 'Upload Receipt'}
          </button>
        </form>
      )}
    </div>
  );
}

function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    try {
      await subscribeNewsletter({ email });
      setDone(true);
    } catch {}
  }

  if (done) {
    return (
      <div className="bg-gold-light border border-gold rounded-2xl p-6 text-center mt-8 no-print">
        <p className="text-navy font-bold">You&apos;re subscribed! Thank you.</p>
      </div>
    );
  }

  return (
    <div className="bg-gold-light border border-gold rounded-2xl p-6 text-center mt-8 no-print">
      <p className="text-navy font-bold text-lg mb-1">Stay Connected</p>
      <p className="text-sm text-navy-dark mb-4">Subscribe to hear about new items that need your support.</p>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
        <input
          type="email"
          className="input flex-1 text-sm"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary text-sm px-4 py-2 whitespace-nowrap">
          Subscribe
        </button>
      </form>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-sand-dark last:border-0">
      <dt className="text-gray-400 text-sm">{label}</dt>
      <dd className="font-semibold text-navy">{value}</dd>
    </div>
  );
}

function LookupPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(code.trim().toUpperCase())}`);
      if (!res.ok) {
        setError('Tracking code not found. Please check and try again.');
      } else {
        window.location.href = `/tracking/${encodeURIComponent(code.trim().toUpperCase())}`;
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">📦</div>
      <h1 className="text-3xl font-bold text-navy mb-2">Track Your Commitment</h1>
      <p className="text-gray-500 mb-8">Enter your tracking code to see your donation&apos;s journey.</p>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        <input
          className="input text-center font-mono text-lg uppercase tracking-widest mb-4"
          placeholder="CPT-2026-XXXX"
          value={code}
          onChange={e => setCode(e.target.value)}
          autoFocus
        />
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Searching...' : 'Track Commitment'}
        </button>
      </form>
      <Link href="/" className="mt-4 inline-block text-sm text-gold hover:text-gold-dark">
        Or browse items to commit
      </Link>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🔍</p>
      <h1 className="text-2xl font-bold text-navy mb-3">Tracking Code Not Found</h1>
      <p className="text-gray-500 mb-6">We could not find a commitment with that tracking code. Please double-check and try again.</p>
      <Link href="/tracking/lookup" className="btn-primary">Try Again</Link>
    </div>
  );
}

function ErrorPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">⚠</p>
      <h1 className="text-2xl font-bold text-navy mb-3">Something Went Wrong</h1>
      <p className="text-gray-500 mb-6">We could not load the tracking information. Please try again later.</p>
      <Link href="/" className="btn-primary">Go Home</Link>
    </div>
  );
}
