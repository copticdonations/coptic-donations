import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { formatCurrency, formatDate } from '../../lib/utils';
import Lightbox from '../../components/ui/Lightbox';

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
  const phases = item.phases && item.phases.length > 0 ? item.phases : [];
  const [selectedPhase, setSelectedPhase] = useState(0);
  const [selectedQty, setSelectedQty] = useState(1);
  const [form, setForm] = useState({
    donor_name: '',
    donor_email: '',
    donor_phone: '',
    tax_receipt_requested: item.tax_receipt === 'yes' || item.tax_receipt === 'possible',
    anonymous: false,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  const images = item.images && item.images.length > 0 ? item.images : (item.image_url ? [item.image_url] : []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.donor_name.trim()) return setError('Please enter your name.');
    if (!form.donor_email.trim()) return setError('Please enter your email address.');
    if (!form.donor_phone.trim()) return setError('Please enter your phone number.');

    const needByDate = phases.length > 0
      ? phases[selectedPhase]?.target_date
      : item.need_by_date;
    sessionStorage.setItem('pendingDonation', JSON.stringify({
      item_id: item.id,
      item_title: item.title,
      item_image_url: images[0] || null,
      category: item.category,
      tax_receipt: item.tax_receipt,
      need_by_date: needByDate || null,
      phase_label: phases.length > 0 ? (phases[selectedPhase]?.phase_label || `Phase ${selectedPhase + 1}`) : null,
      phase_quantity: phases.length > 0 ? (phases[selectedPhase]?.quantity || 1) : null,
      selected_qty: phases.length === 0 && (item.quantity_needed || 1) > 1 ? selectedQty : null,
      unit_cost: item.cost || item.suggested_amount || 0,
      cost_max: item.cost_max || null,
      ...form,
    }));

    router.push('/checkout');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {lightboxSrc && (
        <Lightbox src={lightboxSrc} alt={item.title} onClose={() => setLightboxSrc(null)} />
      )}

      <Link href="/" className="text-gold hover:text-gold-dark text-sm font-semibold flex items-center gap-1 mb-6">
        <span>&#8592;</span> Back to all items
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div
            className="rounded-xl overflow-hidden shadow-lg bg-sand-dark cursor-zoom-in flex items-center justify-center"
            style={{ minHeight: '200px', maxHeight: '480px' }}
            onClick={() => images[activeImg] && setLightboxSrc(images[activeImg])}
          >
            {images[activeImg] ? (
              <img
                src={images[activeImg]}
                alt={item.title}
                className="w-full object-contain"
                style={{ maxHeight: '480px' }}
              />
            ) : (
              <div className="w-full h-48 flex flex-col items-center justify-center gap-3">
                <img src="/logo.png" alt="" className="w-16 h-16 object-contain opacity-40" />
                <p className="text-navy text-sm font-semibold opacity-50 text-center px-4">{item.title}</p>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImg === i ? 'border-gold' : 'border-transparent'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {item.category && (
              <span className="bg-navy text-gold text-xs font-bold px-3 py-1 rounded">
                {item.category}
              </span>
            )}
            {item.service_benefiting && (
              <span className="bg-gold-light text-navy text-xs font-semibold px-3 py-1 rounded border border-gold">
                {item.service_benefiting}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-navy mt-3">{item.title}</h1>
          <p className="text-gray-600 mt-3 leading-relaxed">{item.purpose_impact || item.description}</p>

          {item.need_by_date && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-red-500 font-semibold">Needed by:</span>
              <span className="text-navy font-bold">{formatDate(item.need_by_date)}</span>
            </div>
          )}

          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-gold hover:text-gold-dark text-sm font-semibold">
              View Reference &#8599;
            </a>
          )}

          <div className="mt-6 bg-gold-light rounded-xl p-4 border border-gold">
            <p className="text-sm text-navy-dark font-semibold">Estimated Cost</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-3xl font-bold text-navy">
                {item.cost_max && item.cost_max > item.cost
                  ? `${formatCurrency(item.cost)} — ${formatCurrency(item.cost_max)}`
                  : formatCurrency(item.cost || item.suggested_amount)}
              </p>
              {(phases.length > 0 || (item.quantity_needed || 1) > 1) && (
                <span className="text-sm text-gray-500">per unit</span>
              )}
            </div>
            {item.quantity_needed > 1 && phases.length === 0 && (
              <p className="text-xs text-navy-dark mt-0.5">{item.quantity_needed} units needed</p>
            )}
            {item.tax_receipt === 'yes' && (
              <p className="text-xs text-green-700 font-semibold mt-1">✓ Tax receipt available</p>
            )}
            {item.tax_receipt === 'possible' && (
              <p className="text-xs text-gray-600 mt-1">Tax receipt may be available — ask us</p>
            )}
            {item.tax_receipt === 'no' && (
              <p className="text-xs text-red-600 font-semibold mt-1">✗ Tax receipts are not available for this item</p>
            )}
          </div>

          {phases.length === 0 && (item.quantity_needed || 1) > 1 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-navy mb-2">How many units would you like to donate?</p>
              <div className="flex flex-col gap-2">
                {Array.from({ length: item.quantity_needed }, (_, i) => i + 1).map(n => {
                  const subtotal = (item.cost || 0) * n;
                  return (
                    <label key={n} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedQty === n ? 'border-gold bg-gold-light' : 'border-sand-dark bg-white'}`}>
                      <input type="radio" name="qty" checked={selectedQty === n} onChange={() => setSelectedQty(n)} className="accent-gold" />
                      <span className="font-semibold text-navy text-sm">{n} unit{n > 1 ? 's' : ''}</span>
                      {subtotal > 0 && (
                        <span className="text-xs text-gray-500 ml-auto">{formatCurrency(subtotal)}</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {phases.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-navy mb-2">Select a phase to commit to:</p>
              <div className="flex flex-col gap-2">
                {phases.map((phase, i) => {
                  const unitCost = item.cost || 0;
                  const subtotal = unitCost * (phase.quantity || 1);
                  return (
                    <label key={i} className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedPhase === i ? 'border-gold bg-gold-light' : 'border-sand-dark bg-white'}`}>
                      <input type="radio" name="phase" checked={selectedPhase === i} onChange={() => setSelectedPhase(i)} className="mt-0.5 accent-gold" />
                      <div className="flex-1">
                        <p className="font-semibold text-navy text-sm">{phase.phase_label || `Phase ${i + 1}`}</p>
                        <p className="text-xs text-gray-500">
                          Qty: {phase.quantity}
                          {phase.target_date && ` · Needed by ${formatDate(phase.target_date)}`}
                          {unitCost > 0 && ` · Subtotal: ${formatCurrency(subtotal)}`}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-navy mb-1">Commit to This Donation</h2>
          <p className="text-sm text-gray-500 mb-6">
            This site does not collect money. By committing, you agree to personally source and provide this item.
            We will coordinate delivery with you.
          </p>

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
              <label className="label">Email Address *</label>
              <input
                className="input"
                type="email"
                name="donor_email"
                value={form.donor_email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                We will send your tracking code here.
              </p>
            </div>

            <div>
              <label className="label">Phone Number *</label>
              <input
                className="input"
                type="tel"
                name="donor_phone"
                value={form.donor_phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>

            {(item.tax_receipt === 'yes' || item.tax_receipt === 'possible') && (
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="tax_receipt_requested"
                  checked={form.tax_receipt_requested}
                  onChange={handleChange}
                  className="mt-0.5 accent-gold"
                />
                <span className="text-sm text-navy">
                  I would like a tax receipt for this donation
                  {item.tax_receipt === 'possible' && (
                    <span className="text-gray-400"> (if eligible)</span>
                  )}
                </span>
              </label>
            )}

            <div className="bg-sand rounded-lg px-4 py-3 text-xs text-navy leading-relaxed">
              All information submitted is kept strictly private and will only be accessible to the coordinator. Your details will not be shared with other donors.
            </div>

            <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full text-center">
              {submitting ? 'Processing...' : 'Commit to This Donation →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PlaceholderIcon() {
  return (
    <svg className="w-20 h-20 text-gold opacity-40" fill="currentColor" viewBox="0 0 100 100">
      <rect x="42" y="10" width="16" height="80" rx="4" />
      <rect x="10" y="35" width="80" height="16" rx="4" />
      <circle cx="50" cy="43" r="12" fill="none" stroke="currentColor" strokeWidth="6" />
    </svg>
  );
}
