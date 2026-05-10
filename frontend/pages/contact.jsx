import { useState } from 'react';
import Link from 'next/link';
import { submitContact } from '../lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', type: 'general', subject: '', message: '' });
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
      await submitContact(form);
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
        <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">Reach Out</p>
        <h1 className="text-4xl font-bold text-navy mb-3">Contact Us</h1>
        <p className="text-gray-600">We read every message and respond as soon as possible.</p>
      </div>

      {success ? (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-8 text-center">
          <p className="text-3xl mb-3">🕊</p>
          <p className="text-green-700 font-bold text-xl mb-2">Message Sent!</p>
          <p className="text-green-600 text-sm mb-5">Thank you for reaching out. We will be in touch soon.</p>
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
              <label className="label">Type</label>
              <select className="input" name="type" value={form.type} onChange={handleChange}>
                <option value="general">General Inquiry</option>
                <option value="donation">Donation Question</option>
                <option value="tax_receipt">Tax Receipt Request</option>
                <option value="item_request">Item Request</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Subject</label>
              <input className="input" name="subject" value={form.subject} onChange={handleChange} placeholder="Brief subject" />
            </div>
            <div>
              <label className="label">Message *</label>
              <textarea className="input resize-none" name="message" rows={5} value={form.message} onChange={handleChange} required placeholder="Your message..." />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      )}

      <p className="text-center text-sm text-gray-500 mt-6">
        You can also email us at{' '}
        <a href="mailto:copticdonations7@gmail.com" className="text-gold hover:text-gold-dark font-semibold">
          copticdonations7@gmail.com
        </a>
      </p>
    </div>
  );
}
