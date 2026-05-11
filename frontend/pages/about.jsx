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
        <h2 className="text-2xl font-bold text-navy mb-4">What Is Coptic Donations?</h2>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Coptic Donations is a community-driven initiative dedicated to connecting generous hearts with the
            specific, verified needs of our Coptic churches, monasteries, and ministries. Rather than general
            fundraising, every post represents one real, specific need — a piece of church equipment, a supply
            for homeless outreach, a service, or a request from a monastery.
          </p>
          <p>
            Our mission is to connect people with direct opportunities to support specific needs within our
            Coptic churches, monasteries, and ministries.
          </p>
          <p>
            This initiative exists alongside your regular giving — not instead of it. It is simply an additional
            opportunity for those who feel called and are able to help with specific needs that fall outside a
            normal church budget.
          </p>
        </div>
        <div className="mt-5 bg-sand rounded-xl p-4 border-l-4 border-gold">
          <p className="text-navy text-sm leading-relaxed">
            <strong>Please note:</strong> This initiative is not meant to replace regular tithing or giving to
            your local church. Please always consult your spiritual father and prioritize your local church first.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-navy mb-4">Why Targeted Donations?</h2>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Some needs simply fall outside what a church&apos;s regular budget can cover — homeless outreach
            supplies, specialized liturgical equipment, monastery requests, or materials for a growing ministry.
            These are real, ongoing needs that often go unmet simply because they are not visible to the wider
            community. This is especially true for smaller churches that are simply covering their basic costs
            like rent and utilities, or monasteries that rely heavily on the generosity of visitors and donors.
          </p>
          <p>
            Through community connections, Facebook Marketplace, eBay, and other channels, items can often be
            sourced at a fraction of retail cost — meaning your contribution goes further and the church receives
            exactly what it needs. A speaker system that retails for $400 online might be found locally for $200,
            allowing the church to receive what it needs while a community member receives the blessing of giving.
          </p>
          <p>
            By bringing these needs forward in a specific and accessible way, we make it easier for community
            members to participate in supporting the broader Coptic community — in a way that feels personal,
            meaningful, and rooted in faith.
          </p>
        </div>
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
