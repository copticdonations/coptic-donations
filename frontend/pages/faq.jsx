import { useState } from 'react';
import Link from 'next/link';

const FAQS = [
  {
    q: 'Does this replace my regular tithe?',
    a: 'No. This is only an additional opportunity for those who feel called and are able to give. Please always prioritize your local church and consult your spiritual father first.',
  },
  {
    q: 'Are donations tax deductible?',
    a: 'It depends on each post. Each post clearly states whether a tax receipt is available. If a donation goes directly through a registered church or nonprofit, a receipt may be available. Check the individual post for details.',
  },
  {
    q: 'How do I know the need is real?',
    a: 'Needs are reviewed and verified as much as possible before being posted. We do our best to confirm the need with the relevant church, monastery, or ministry.',
  },
  {
    q: 'Can I donate items instead of money?',
    a: 'Yes, in some cases. Check the specific post for details on what is accepted.',
  },
  {
    q: 'Can I suggest a need?',
    a: 'Yes! Use the Get Connected page to submit a request for review.',
  },
  {
    q: 'Can I give a small amount?',
    a: 'Yes. Some posts accept partial contributions from multiple people.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'It varies by post. Each post specifies exactly how to contribute — for example, buying directly on Amazon, sending money to a church, or paying a seller directly.',
  },
  {
    q: 'Who receives the money?',
    a: 'Coptic Donations never collects or holds money. Each post explains exactly where and how funds go — directly to a church, a seller, or another approved method. We simply coordinate.',
  },
  {
    q: 'Is my information private?',
    a: 'Yes. Your personal information is only seen by the coordinator and will not be shared with other donors. If you request a tax receipt, your info may be shared with the relevant church for processing only.',
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState(null);

  const toggle = (i) => setOpen(open === i ? null : i);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <p className="text-gold font-semibold text-xs uppercase tracking-widest mb-3">Have questions?</p>
        <h1 className="text-4xl font-serif font-bold text-navy mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-500 leading-relaxed">
          Everything you need to know about how Coptic Donations works.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-sand-dark border border-sand-dark rounded-2xl overflow-hidden shadow-sm">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-white">
            <button
              onClick={() => toggle(i)}
              className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-sand transition-colors"
            >
              <span className="font-semibold text-navy text-base">{faq.q}</span>
              <span className={`text-gold text-xl flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-45' : ''}`}>
                +
              </span>
            </button>
            {open === i && (
              <div className="px-6 pb-6">
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-14 bg-navy rounded-2xl p-8 text-center">
        <p className="text-gold font-serif text-xl font-bold mb-3">Still have questions?</p>
        <p className="text-sand opacity-80 mb-6">
          We&apos;re happy to help. Reach out and we&apos;ll get back to you.
        </p>
        <Link href="/contact" className="btn-primary">Contact Us</Link>
      </div>

      <div className="mt-8 bg-sand rounded-xl p-6 border-l-4 border-gold">
        <p className="text-navy text-sm leading-relaxed">
          <strong>Reminder:</strong> This initiative is not meant to replace regular tithing or giving
          to your local church. Please always prioritize your local church and seek the guidance of
          your spiritual father.
        </p>
      </div>
    </div>
  );
}
