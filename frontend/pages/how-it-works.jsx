import Link from 'next/link';

const STEPS = [
  {
    step: '01',
    title: 'Browse Available Items',
    desc: 'Explore the list of specific items the church needs. Each item includes a description, estimated cost, and the service it will benefit.',
  },
  {
    step: '02',
    title: 'Commit to an Item',
    desc: 'Click "Commit to This Donation" and enter your name and contact details. No payment is collected — you are making a personal commitment to source and provide the item.',
  },
  {
    step: '03',
    title: 'Purchase the Item',
    desc: 'Go to a store (or online) and purchase the item yourself. You can upload your receipt through your tracking page.',
  },
  {
    step: '04',
    title: 'Coordinate Delivery',
    desc: 'We will contact you to arrange pickup or shipping to the church. Our team handles the rest.',
  },
  {
    step: '05',
    title: 'Track Every Step',
    desc: 'Use your unique tracking code to follow your gift from purchase all the way to installation. You will receive updates at every stage.',
  },
  {
    step: '06',
    title: 'See the Impact',
    desc: 'Once installed, we upload a photo so you can see your gift in use. A tax receipt is sent if applicable.',
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
          From browsing to seeing your gift in use — here is every step of the journey.
        </p>
      </div>

      <div className="flex flex-col gap-6 mb-12">
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

      <div className="bg-gold-light border border-gold rounded-2xl p-6 text-sm text-navy-dark mb-8">
        <p className="font-bold mb-1">Important to know:</p>
        <p>
          This platform does <strong>not</strong> collect money. All commitments are voluntary and donors purchase items
          directly. Tax receipts may be available for eligible donations — consult with the church administration for details.
        </p>
      </div>

      <div className="text-center">
        <Link href="/" className="btn-primary">Browse Items to Donate</Link>
      </div>
    </div>
  );
}
