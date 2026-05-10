import Link from 'next/link';

const STEPS = [
  {
    step: '01',
    title: 'Browse Available Needs',
    desc: 'Explore the current list of specific needs from Coptic churches, monasteries, and ministries. Each post includes a description of the item or need, its purpose, estimated cost, recipient, payment instructions, and whether a tax receipt is available. Some items may be available at a lower cost through community connections — for example, a speaker system that retails for $400 online may be available locally or through Facebook Marketplace for $200, allowing the church to receive what it needs while a community member receives the blessing of giving.',
  },
  {
    step: '02',
    title: 'Commit to a Need',
    desc: 'Click "I Want to Help" and enter your name and contact details. No payment is collected at this step. You are simply committing to cover the cost of this item or need within 48 hours of Coptic Donations contacting you with sourcing details and next steps, or as soon as possible thereafter.',
  },
  {
    step: '03',
    title: 'Complete Your Donation',
    desc: 'Each post includes specific instructions for how to give. Depending on the item, this might mean purchasing directly on Amazon and shipping to an address, sending payment via Venmo to a specific person, donating to a church\'s general fund with a note in the comments specifying the item, or another method clearly explained in the post. Coptic Donations will guide you through every step.',
  },
  {
    step: '04',
    title: 'Delivery & Coordination',
    desc: 'Coptic Donations handles coordination. If you purchased online, you can ship directly to the provided address. For local pickups or other arrangements, our team will reach out to coordinate — you don\'t have to figure out logistics on your own.',
  },
  {
    step: '05',
    title: 'Track Every Step',
    desc: 'Use your unique tracking code to follow your donation from commitment all the way through to delivery. You will receive updates at every stage of the process.',
  },
  {
    step: '06',
    title: 'Tax Receipt',
    desc: 'If a tax receipt is applicable for your donation, it will be processed and sent to you. Each post clearly states upfront whether a tax receipt is available for that specific item.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-gold hover:text-gold-dark text-sm font-semibold flex items-center gap-1 mb-8">
        <span>&#8592;</span> Back to home
      </Link>

      <div className="text-center mb-12">
        <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">Simple Process</p>
        <h1 className="text-4xl font-bold text-navy mb-4">How It Works</h1>
        <p className="text-lg text-gray-600">
          From browsing to delivery — here is every step of the journey.
        </p>
      </div>

      {/* Community savings story */}
      <div className="bg-sand rounded-2xl p-7 mb-10 border-l-4 border-gold">
        <p className="text-navy font-serif text-lg font-bold mb-3">Why Coptic Donations?</p>
        <p className="text-gray-700 leading-relaxed">
          Sometimes a church needs a speaker system that retails for $400 online — but through our community
          connections, the same system might be found locally or on Facebook Marketplace for $200. The church
          receives exactly what it needs, a community member receives the blessing of giving, and everyone
          saves. That&apos;s the heart of what we do: connecting needs with people, and people with opportunities
          to give.
        </p>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-6 mb-10">
        {STEPS.map(({ step, title, desc }) => (
          <div key={step} className="bg-white rounded-xl shadow-md p-6 flex gap-5">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-navy flex items-center justify-center">
              <span className="text-gold font-bold font-serif text-lg">{step}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy mb-1">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk / General Fund explanation */}
      <div className="bg-white rounded-2xl shadow-md p-7 mb-8">
        <p className="text-lg font-bold text-navy mb-3">Bulk &amp; General Fund Donations</p>
        <p className="text-gray-700 leading-relaxed text-sm">
          For some items, bulk purchasing allows the community to get a significantly better price. In these
          cases, donations go directly to the church&apos;s general fund (or a designated sub-fund) with a note
          specifying the intended purpose — for example, <em>&ldquo;for bulk purchase of surge protectors.&rdquo;</em> A
          live tracker on the item&apos;s page will show the running total donated toward this goal, updated in
          real time.
        </p>
      </div>

      {/* Important to know */}
      <div className="bg-gold-light border border-gold rounded-2xl p-6 text-sm text-navy-dark mb-8">
        <p className="font-bold mb-2">Important to Know</p>
        <p className="leading-relaxed">
          Coptic Donations does <strong>not</strong> collect money. All commitments are voluntary and donors
          give directly according to the instructions provided on each post. Each post clearly states whether
          a tax receipt is available for that specific item.
        </p>
      </div>

      <div className="text-center">
        <Link href="/items" className="btn-primary">Browse Current Needs</Link>
      </div>
    </div>
  );
}
