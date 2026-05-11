import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-gold hover:text-gold-dark text-sm font-semibold flex items-center gap-1 mb-8">
        <span>&#8592;</span> Back to home
      </Link>

      <div className="text-center mb-10">
        <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">Our Mission</p>
        <h1 className="text-4xl font-bold text-navy mb-4">About Coptic Donations</h1>
        <p className="text-lg text-gray-600">
          Connecting generous hearts with the sacred needs of our Coptic community — one item at a time.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-navy mb-4">What We Do</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Coptic Donations is a platform that makes it easy for community members to directly provide specific items
          needed by the church. Rather than collecting money, we connect donors with exact needs — so you know exactly
          where your generosity goes.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Whether it is a processional cross, an icon for the sanctuary, or pews for the nave — every item listed has
          a real need, a real cost, and a real impact on our community&apos;s worship and service.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-navy mb-4">How It Is Different</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { icon: '🎯', title: 'Targeted Giving', desc: 'Every commitment funds a specific, named item or need — so you know exactly where your generosity goes.' },
            { icon: '🤝', title: 'Direct Connection', desc: 'You pay for the item directly — for example, purchasing through Amazon and shipping it to the recipient, or paying a seller directly with our guidance.' },
            { icon: '💡', title: 'Community Savings', desc: 'Through community connections, items can often be found at a fraction of retail cost — a church receives what it needs, and a community member receives the blessing of giving.' },
            { icon: '🧾', title: 'Tax Receipts', desc: 'Tax receipts are available for eligible donations where applicable. Each post states this clearly upfront.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-bold text-navy">{title}</p>
                <p className="text-sm text-gray-600 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meet the Founder */}
      <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-navy mb-6">Meet the Founder</h2>
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <img
            src="/founder.jpg"
            alt="Founder"
            className="w-36 h-36 rounded-full object-cover object-top shadow-md flex-shrink-0"
          />
          <div>
            <p className="text-xl font-bold text-navy mb-0.5">Mercurius</p>
            <p className="text-gold font-semibold text-sm mb-3">Founder &amp; Coordinator</p>
            <Link href="/founder" className="text-gold hover:text-gold-dark text-sm font-semibold">
              Read more →
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-navy rounded-2xl p-8 text-center text-white">
        <p className="text-gold font-serif text-xl font-bold mb-3">Ready to make a difference?</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">Browse Items</Link>
          <Link href="/how-it-works" className="btn-secondary border-sand text-sand hover:bg-sand hover:text-navy">How It Works</Link>
        </div>
      </div>
    </div>
  );
}
