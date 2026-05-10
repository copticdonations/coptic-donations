import Link from 'next/link';
import { formatCurrency } from '../lib/utils';

export async function getServerSideProps() {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const res = await fetch(`${backendUrl}/api/items`);
    const data = await res.json();
    return { props: { items: data.items || [] } };
  } catch {
    return { props: { items: [] } };
  }
}

const HOW_IT_WORKS_STEPS = [
  { step: '1', title: 'Need is Verified', desc: 'A church, monastery, or ministry submits a need. We review and verify it before posting.' },
  { step: '2', title: 'You Browse & Choose', desc: 'Browse current needs and choose what resonates with your heart and calling.' },
  { step: '3', title: 'You Commit', desc: 'Fill out a simple commitment form. No payment is ever collected by us.' },
  { step: '4', title: 'Direct Coordination', desc: 'You coordinate directly with the church or approved method. We keep you updated every step.' },
];

export default function HomePage({ items }) {
  const featured = items.filter(i => i.item_status === 'available').slice(0, 3);
  const completedCount = items.filter(i => i.item_status === 'completed').length;

  return (
    <div>

      {/* ── Hero ── */}
      <section className="min-h-[92vh] flex flex-col items-center justify-center text-center px-6 py-24 bg-[#fdfbf8]">
        <img
          src="/logo.png"
          alt="Coptic Donations"
          className="w-44 h-44 mb-8 drop-shadow-xl rounded-full"
        />
        <p className="text-gold font-semibold text-xs uppercase tracking-[0.3em] mb-4">Malachi 3:10</p>
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-navy mb-5 leading-tight">
          Coptic Donations
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mb-4 leading-relaxed">
          Supporting Coptic churches, monasteries, and ministries through meaningful, targeted giving.
        </p>
        <p className="text-gray-500 max-w-xl mb-12 leading-relaxed">
          An initiative to connect our Coptic community with specific, verified needs — making it easy
          for those who feel called and are able to contribute.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="#current-needs" className="btn-primary">View Current Needs</a>
          <Link href="/how-it-works" className="btn-secondary">How It Works</Link>
          <a
            href="https://chat.whatsapp.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Join WhatsApp Community
          </a>
          <Link href="/contact" className="btn-secondary">Contact Us</Link>
        </div>
      </section>

      {/* ── What Is Coptic Donations ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-navy mb-8 text-center">
            What Is Coptic Donations?
          </h2>
          <div className="space-y-5 text-gray-600 leading-relaxed text-lg">
            <p>
              Coptic Donations is a community-driven initiative dedicated to connecting generous hearts
              with the specific, verified needs of our Coptic churches, monasteries, and ministries.
              Rather than general fundraising, every post represents one real, tangible need — a piece
              of church equipment, a supply for homeless outreach, or a request from a monastery.
            </p>
            <p>
              We believe in targeted giving: knowing exactly what you&apos;re providing, where it&apos;s going,
              and the impact it will have. This is giving that is personal, purposeful, and deeply
              rooted in our faith.
            </p>
            <p>
              This initiative exists alongside your regular giving — not instead of it. It is simply an
              additional opportunity for those who feel called and are able to help with specific needs
              that fall outside a normal church budget.
            </p>
          </div>
          <div className="mt-10 bg-sand rounded-xl p-6 border-l-4 border-gold">
            <p className="text-navy text-sm leading-relaxed">
              <strong>Please note:</strong> This initiative is not meant to replace regular tithing or
              giving to your local church. Please always consult your spiritual father and prioritize
              your local church first.
            </p>
          </div>
        </div>
      </section>

      {/* ── Why Targeted Donations ── */}
      <section className="py-20 px-6 bg-sand">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-navy mb-8 text-center">
            Why Targeted Donations?
          </h2>
          <div className="space-y-5 text-gray-600 leading-relaxed text-lg">
            <p>
              Some needs simply fall outside what a church&apos;s regular budget can cover — homeless
              outreach supplies, specialized liturgical equipment, monastery requests, or materials
              for a growing ministry. These are real, ongoing needs that often go unmet simply because
              they are not visible to the wider community.
            </p>
            <p>
              Targeted donations also offer a unique advantage: through community connections,
              Facebook Marketplace, eBay, and other channels, items can often be sourced at a fraction
              of retail cost. Your contribution goes further, and the church receives exactly what it
              needs.
            </p>
            <p>
              By making these needs specific and transparent, we make it easier for community members
              to give in a way that feels personal, meaningful, and truly impactful.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works Summary ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-navy mb-3 text-center">How It Works</h2>
          <p className="text-center text-gray-500 mb-14">
            A simple, transparent process from need to fulfillment.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {HOW_IT_WORKS_STEPS.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-navy text-gold font-serif font-bold text-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
                  {step}
                </div>
                <h3 className="font-bold text-navy mb-2 text-base">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/how-it-works" className="btn-secondary">
              Learn More About How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* ── Tithing Note ── */}
      <section className="py-16 px-6 bg-navy">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gold font-serif text-2xl font-bold mb-5">A Note on Tithing</p>
          <p className="text-sand opacity-90 leading-relaxed text-lg italic">
            &ldquo;This initiative is not meant to replace regular tithing or giving to your local church.
            It is simply an additional opportunity for those who feel called and are able to contribute
            toward specific needs. Please always prioritize your local church and seek the guidance of
            your spiritual father.&rdquo;
          </p>
        </div>
      </section>

      {/* ── Current Needs Preview ── */}
      <section id="current-needs" className="py-20 px-6 bg-[#fdfbf8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-navy mb-3 text-center">Current Needs</h2>
          <p className="text-center text-gray-500 mb-4">
            Real needs from our Coptic community, waiting for generous hearts.
          </p>
          {completedCount > 0 && (
            <p className="text-center text-sm text-green-600 font-semibold mb-10">
              {completedCount} item{completedCount !== 1 ? 's' : ''} already fulfilled by our community
            </p>
          )}
          {featured.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No current needs posted yet. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featured.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
          )}
          <div className="text-center">
            <Link href="/items" className="btn-primary">View All Current Needs</Link>
          </div>
        </div>
      </section>

      {/* ── Get Connected CTA ── */}
      <section className="py-14 px-6 bg-white border-t border-sand-dark">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-2xl font-serif font-bold text-navy mb-3">Want to Offer Something?</p>
          <p className="text-gray-500 mb-6 leading-relaxed">
            Have an item, skill, or resource to offer? Get connected and we&apos;ll find the right fit.
          </p>
          <Link href="/get-connected" className="btn-primary">Get Connected</Link>
        </div>
      </section>

      <p className="text-center text-xs text-gray-400 py-6 px-4 max-w-2xl mx-auto">
        This platform does not process payments. Donors coordinate directly with the church or approved
        method. All commitments are voluntary and may be tax-deductible where indicated.
      </p>
    </div>
  );
}

function ItemCard({ item }) {
  const imgSrc = item.primary_image || item.image_url;
  const isUrgent = item.need_by_date &&
    new Date(item.need_by_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Link href={`/items/${item.id}`} className="card group block relative">
      {isUrgent && (
        <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
          Urgent
        </div>
      )}
      <div className="relative aspect-video bg-sand-dark overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gold opacity-30 text-5xl font-serif">✝</div>
        )}
        {item.category && (
          <span className="absolute top-2 left-2 bg-navy text-gold text-xs font-bold px-2 py-1 rounded">
            {item.category}
          </span>
        )}
      </div>
      <div className="p-4">
        <h2 className="text-lg font-bold text-navy group-hover:text-gold transition-colors line-clamp-1">
          {item.title}
        </h2>
        {item.service_benefiting && (
          <p className="text-xs text-gold font-semibold mt-0.5">{item.service_benefiting}</p>
        )}
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.purpose_impact || item.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-gold font-bold text-lg">{formatCurrency(item.cost || item.suggested_amount)}</span>
          <span className="text-xs bg-sand text-navy px-3 py-1 rounded-full border border-gold-light font-semibold">
            Commit
          </span>
        </div>
      </div>
    </Link>
  );
}
