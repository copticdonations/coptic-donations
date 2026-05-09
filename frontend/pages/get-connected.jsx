import { useState } from 'react';
import Link from 'next/link';
import { submitConnection } from '../lib/api';

export default function GetConnectedPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', offer_type: 'item', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await submitConnection(form);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="text-gold hover:text-gold-dark text-sm font-semibold flex items-center gap-1 mb-8">
        <span>&#8592;</span> Back to home
      </Link>

      <div className="text-center mb-8">
        <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">Give in Your Own Way</p>
        <h1 className="text-4xl font-bold text-navy mb-3">Get Connected</h1>
        <p className="text-gray-600 leading-relaxed">
          Want to donate something not on the list? Have a skill, service, or item to offer?
          Tell us and we will find the right fit for your generosity.
        </p>
      </div>

      {success ? (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-8 text-center">
          <p className="text-3xl mb-3">🕊</p>
          <p className="text-green-700 font-bold text-xl mb-2">Thank You!</p>
          <p className="text-green-600 text-sm mb-5">We have received your offer and will be in touch soon. May God bless your generosity.</p>
          <Link href="/" className="btn-primary">Return Home</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-8">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" name="name" value={form.name} onChange={handleChange} required placeholder="Your name" />
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <input className="input" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className="label">What are you offering?</label>
              <select className="input" name="offer_type" value={form.offer_type} onChange={handleChange}>
                <option value="item">A specific item</option>
                <option value="service">A service or skill</option>
                <option value="monetary">Monetary support</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Description *</label>
              <textarea
                className="input resize-none"
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                required
                placeholder="Describe what you would like to offer, any relevant details, and how we can best coordinate with you..."
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Submitting...' : 'Submit Offer'}
            </button>
          </form>
        </div>
      )}

      <div className="mt-8 bg-navy rounded-2xl p-6 text-center text-white">
        <p className="text-gold font-semibold mb-1">Want to commit to a listed item?</p>
        <p className="text-sand text-sm opacity-80 mb-4">Browse our current needs and commit directly.</p>
        <Link href="/" className="btn-primary">Browse Items</Link>
      </div>
    </div>
  );
}
