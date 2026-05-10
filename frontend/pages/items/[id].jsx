import { useState } from 'react';

const PAYMENT_LABELS = {
  direct_vendor: 'Direct to Vendor — Pay the seller directly via Venmo, Zelle, PayPal, Cash App, or Apple Pay',
  online_purchase: 'Online Purchase — Buy directly through Amazon, eBay, etc. and ship to the provided address',
  church_fund: 'Church General Fund — Send payment directly to the church\'s general fund or a designated sub-fund, with a note in the memo/comments specifying the item (e.g. "For bulk purchase of surge protectors")',
  other: 'See payment instructions below',
};
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
  // phaseSelections: { [phaseIndex]: { checked: bool, qty: number } }
  const [phaseSelections, setPhaseSelections] = useState(
    Object.fromEntries(phases.map((_, i) => [i, { checked: false, qty: 1 }]))
  );
  const [selectedQty, setSelectedQty] = useState(1);

  const unitCost = item.cost || item.suggested_amount || 0;
  const selectedPhasesList = phases
    .map((ph, i) => ({ ...ph, index: i, ...phaseSelections[i] }))
    .filter(ph => ph.checked && ph.qty > 0);
  const grandTotal = phases.length > 0
    ? selectedPhasesList.reduce((s, ph) => s + unitCost * ph.qty, 0)
    : unitCost * selectedQty;
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
    if (phases.length > 0 && selectedPhasesList.length === 0) return setError('Please select at least one phase.');

    const commitment_details = phases.length > 0
      ? {
          selected_phases: selectedPhasesList.map(ph => ({
            phase_label: ph.phase_label || `Phase ${ph.index + 1}`,
            quantity: ph.qty,
            target_date: ph.target_date,
            unit_cost: unitCost,
            subtotal: unitCost * ph.qty,
          })),
          total_qty: selectedPhasesList.reduce((s, ph) => s + ph.qty, 0),
          total_amount: grandTotal,
        }
      : { selected_qty: selectedQty, total_amount: grandTotal };

    sessionStorage.setItem('pendingDonation', JSON.stringify({
      item_id: item.id,
      item_title: item.title,
      item_image_url: images[0] || null,
      category: item.category,
      tax_receipt: item.tax_receipt,
      payment_method: item.payment_method || null,
      payment_instructions: item.payment_instructions || null,
      need_by_date: phases.length === 0 ? (item.need_by_date || null) : null,
      unit_cost: unitCost,
      cost_max: item.cost_max || null,
      item_link: item.link || null,
      commitment_details,
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

          {/* Payment method */}
          {item.payment_method && (
            <div className="mt-4 bg-sand rounded-xl p-4 border-l-4 border-gold">
              <p className="text-xs font-bold text-navy uppercase tracking-wide mb-1">How to Give</p>
              <p className="text-sm font-semibold text-navy">{PAYMENT_LABELS[item.payment_method] || item.payment_method}</p>
              {item.payment_instructions && (
                <p className="text-sm text-gray-600 mt-1">{item.payment_instructions}</p>
              )}
            </div>
          )}

          {/* No-phase quantity selector */}
          {phases.length === 0 && (item.quantity_needed || 1) > 1 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-navy mb-2">How many units would you like to donate?</p>
              <div className="flex flex-col gap-2">
                {Array.from({ length: item.quantity_needed }, (_, i) => i + 1).map(n => (
                  <label key={n} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedQty === n ? 'border-gold bg-gold-light' : 'border-sand-dark bg-white'}`}>
                    <input type="radio" name="qty" checked={selectedQty === n} onChange={() => setSelectedQty(n)} className="accent-gold" />
                    <span className="font-semibold text-navy text-sm">{n} unit{n > 1 ? 's' : ''}</span>
                    {unitCost > 0 && <span className="text-xs text-gray-500 ml-auto">{formatCurrency(unitCost * n)}</span>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Multi-phase selector */}
          {phases.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-navy mb-1">Select phases to commit to:</p>
              <p className="text-xs text-gray-400 mb-3">You can select multiple phases. Choose how many units per phase.</p>
              <div className="flex flex-col gap-3">
                {phases.map((phase, i) => {
                  const sel = phaseSelections[i] || { checked: false, qty: 1 };
                  const phSubtotal = unitCost * sel.qty;
                  return (
                    <div key={i} className={`rounded-xl border-2 p-4 transition-colors ${sel.checked ? 'border-gold bg-gold-light' : 'border-sand-dark bg-white'}`}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={sel.checked}
                          onChange={e => setPhaseSelections(ps => ({ ...ps, [i]: { ...ps[i], checked: e.target.checked } }))}
                          className="mt-0.5 accent-gold" />
                        <div className="flex-1">
                          <p className="font-semibold text-navy text-sm">{phase.phase_label || `Phase ${i + 1}`}</p>
                          {phase.target_date && <p className="text-xs text-gray-500">Needed by {formatDate(phase.target_date)}</p>}
                          {phase.phase_notes && <p className="text-xs text-gray-400 mt-0.5 italic">{phase.phase_notes}</p>}
                          <p className="text-xs text-gray-400">Up to {phase.quantity} unit{phase.quantity !== 1 ? 's' : ''} available</p>
                        </div>
                      </label>
                      {sel.checked && (
                        <div className="mt-3 flex items-center gap-3">
                          <label className="text-xs text-gray-500">How many units?</label>
                          <div className="flex items-center gap-2 ml-auto">
                            <button type="button" onClick={() => setPhaseSelections(ps => ({ ...ps, [i]: { ...ps[i], qty: Math.max(1, ps[i].qty - 1) } }))}
                              className="w-7 h-7 rounded-full bg-navy text-gold font-bold flex items-center justify-center">−</button>
                            <span className="font-bold text-navy w-6 text-center">{sel.qty}</span>
                            <button type="button" onClick={() => setPhaseSelections(ps => ({ ...ps, [i]: { ...ps[i], qty: Math.min(phase.quantity, ps[i].qty + 1) } }))}
                              className="w-7 h-7 rounded-full bg-navy text-gold font-bold flex items-center justify-center">+</button>
                          </div>
                          {unitCost > 0 && (
                            <span className="text-sm font-bold text-navy ml-2">{formatCurrency(phSubtotal)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {grandTotal > 0 && selectedPhasesList.length > 0 && (
                <div className="mt-3 flex justify-between items-center bg-navy rounded-xl px-4 py-3">
                  <span className="text-sand text-sm font-semibold">
                    Total: {selectedPhasesList.reduce((s, ph) => s + ph.qty, 0)} unit{selectedPhasesList.reduce((s, ph) => s + ph.qty, 0) !== 1 ? 's' : ''}
                  </span>
                  <span className="text-gold font-bold text-lg">{formatCurrency(grandTotal)}</span>
                </div>
              )}
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
