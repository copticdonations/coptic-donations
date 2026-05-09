import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { formatCurrency } from '../../lib/utils';

export async function getServerSideProps({ params }) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const res = await fetch(`${backendUrl}/api/items/${params.id}`);
    if (!res.ok) return { notFound: true };
    const data = await res.json();
    return { props: { item: data.item } };
  } catch {
    return { notFound: true };
  }
}

export default function ItemPage({ item }) {
  const router = useRouter();
  const [form, setForm] = useState({
    donor_name: '',
    donor_email: '',
    amount: item.suggested_amount,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.donor_name.trim()) return setError('Please enter your name.');
    if (!form.amount || parseFloat(form.amount) <= 0) return setError('Please enter a valid donation amount.');

    sessionStorage.setItem('pendingDonation', JSON.stringify({
      item_id: item.id,
      item_title: item.title,
      item_image_url: item.image_url,
      category: item.category,
      ...form,
      amount: parseFloat(form.amount),
    }));

    router.push('/checkout');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/" className="text-gold hover:text-gold-dark text-sm font-semibold flex items-center gap-1 mb-6">
        <span>&#8592;</span> Back to all items
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="rounded-xl overflow-hidden shadow-lg aspect-video bg-sand-dark">
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-20 h-20 text-gold opacity-40" fill="currentColor" viewBox="0 0 100 100">
                  <rect x="42" y="10" width="16" height="80" rx="4" />
                  <rect x="10" y="35" width="80" height="16" rx="4" />
                  <circle cx="50" cy="43" r="12" fill="none" stroke="currentColor" strokeWidth="6" />
                </svg>
              </div>
            )}
          </div>

          {item.category && (
            <span className="mt-3 inline-block bg-navy text-gold text-xs font-bold px-3 py-1 rounded">
              {item.category}
            </span>
          )}
          <h1 className="text-3xl font-bold text-navy mt-2">{item.title}</h1>
          <p className="text-gray-600 mt-3 leading-relaxed">{item.description}</p>

          <div className="mt-6 bg-gold-light rounded-xl p-4 border border-gold">
            <p className="text-sm text-navy-dark font-semibold">Suggested Donation</p>
            <p className="text-3xl font-bold text-navy">{formatCurrency(item.suggested_amount)}</p>
            <p className="text-xs text-gray-600 mt-1">You may donate any amount you wish.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-navy mb-1">Make a Donation</h2>
          <p className="text-sm text-gray-500 mb-6">Fill in your details and we will take care of the rest.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                className="input"
                type="text"
                name="donor_name"
                value={form.donor_name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="label">Email Address (optional)</label>
              <input
                className="input"
                type="email"
                name="donor_email"
                value={form.donor_email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
              <p className="text-xs text-gray-400 mt-1">We will send your tracking code here if provided.</p>
            </div>

            <div>
              <label className="label">Donation Amount (USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  className="input pl-7"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  placeholder={item.suggested_amount}
                  required
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-1">
              {[25, 50, 100, 200, 500].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, amount: amt }))}
                  className={`text-sm px-3 py-1 rounded-full border font-semibold transition-colors ${
                    parseFloat(form.amount) === amt
                      ? 'bg-gold text-navy-dark border-gold'
                      : 'border-gold text-navy hover:bg-gold hover:text-navy-dark'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full text-center">
              {submitting ? 'Processing...' : 'Continue to Checkout →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
