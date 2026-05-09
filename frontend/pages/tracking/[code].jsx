import { useState } from 'react';
import Link from 'next/link';
import Timeline from '../../components/tracking/Timeline';
import { formatCurrency, formatDate } from '../../lib/utils';

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

  const currentStatus = statusUpdates.length > 0 ? statusUpdates[statusUpdates.length - 1].status : 'received';
  const isInstalled = currentStatus === 'installed';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/" className="text-gold hover:text-gold-dark text-sm font-semibold flex items-center gap-1 mb-6">
        <span>&#8592;</span> Back to home
      </Link>

      <div className="bg-navy rounded-2xl p-6 md:p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-gold text-sm font-semibold uppercase tracking-wider mb-1">Tracking Code</p>
            <p className="text-2xl font-mono font-bold tracking-widest">{donation.tracking_code}</p>
          </div>
          <div className="text-right md:text-left">
            <p className="text-sand opacity-70 text-sm">Donated on</p>
            <p className="text-sand font-semibold">{formatDate(donation.created_at)}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-5 md:col-span-2">
          <h2 className="text-lg font-bold text-navy mb-3">Donation Details</h2>
          <dl className="flex flex-col gap-2">
            <Row label="Donor" value={donation.donor_name} />
            <Row label="Item" value={donation.item_title} />
            <Row label="Amount" value={<span className="text-gold font-bold">{formatCurrency(donation.amount)}</span>} />
          </dl>
        </div>

        {donation.item_image_url && (
          <div className="rounded-xl overflow-hidden shadow-md aspect-video md:aspect-auto bg-sand-dark">
            <img src={donation.item_image_url} alt={donation.item_title} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-8">
        <h2 className="text-xl font-bold text-navy mb-6">Donation Journey</h2>
        <Timeline statusUpdates={statusUpdates} />
      </div>

      {isInstalled && donation.installation_photo_url && (
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border-2 border-gold">
          <h2 className="text-xl font-bold text-navy mb-2">🎉 Your Gift Has Been Installed!</h2>
          <p className="text-gray-500 text-sm mb-4">
            Thanks to your generosity, this item is now serving our community. May God bless you abundantly.
          </p>
          <div className="rounded-xl overflow-hidden">
            <img
              src={donation.installation_photo_url}
              alt="Installed donation"
              className="w-full object-cover max-h-96"
            />
          </div>
        </div>
      )}

      {isInstalled && !donation.installation_photo_url && (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-6 text-center">
          <p className="text-green-700 font-bold text-lg">Your gift has been installed!</p>
          <p className="text-green-600 text-sm mt-1">An installation photo will be uploaded soon.</p>
        </div>
      )}
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
      <h1 className="text-3xl font-bold text-navy mb-2">Track Your Donation</h1>
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
          {loading ? 'Searching...' : 'Track Donation'}
        </button>
      </form>
      <Link href="/" className="mt-4 inline-block text-sm text-gold hover:text-gold-dark">
        Or browse items to donate
      </Link>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🔍</p>
      <h1 className="text-2xl font-bold text-navy mb-3">Tracking Code Not Found</h1>
      <p className="text-gray-500 mb-6">We could not find a donation with that tracking code. Please double-check and try again.</p>
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

