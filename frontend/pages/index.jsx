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

export default function HomePage({ items }) {
  const featured = items.filter(i => i.item_status === 'available').slice(0, 3);
  const completedCount = items.filter(i => i.item_status === 'completed').length;

  return (
    <div>

      {/* ── Hero ── */}
      <section className="min-h-[92vh] flex flex-col items-center justify-center text-center px-6 py-24" style={{ background: 'radial-gradient(ellipse at center, #f0dcbb 0%, #eddaba 100%)' }}>
        <img
          src="/logo.png"
          alt="Coptic Donations"
          className="w-72 h-72 mb-8 object-contain"
        />
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
              Rather than general fundraising, every post represents one real, specific need — a piece
              of church equipment, a supply for homeless outreach, a service, or a request from a
              monastery.
            </p>
            <p>
              Our mission is to connect people with direct opportunities to support specific needs
              within our Coptic churches, monasteries, and ministries.
            </p>
            <p>
              This initiative exists alongside your regular giving — not instead of it. It is simply
              an additional opportunity for those who feel called and are able to help with specific
              needs that fall outside a normal church budget.
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
              they are not visible to the wider community. This is especially true for smaller churches
              that are simply covering their basic costs like rent and utilities, or monasteries that
              rely heavily on the generosity of visitors and donors.
            </p>
            <p>
              Through community connections, Facebook Marketplace, eBay, and other channels, items
              can often be sourced at a fraction of retail cost — meaning your contribution goes further
              and the church receives exactly what it needs. A speaker system that retails for $400
              online might be found locally for $200, allowing the church to receive what it needs
              while a community member receives the blessing of giving.
            </p>
            <p>
              By bringing these needs forward in a specific and accessible way, we make it easier for
              community members to participate in supporting the broader Coptic community — in a way
              that feels personal, meaningful, and rooted in faith.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works Summary ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-navy mb-8 text-center">How It Works</h2>
          <div className="bg-sand rounded-2xl p-7 mb-6">
            <p className="font-bold text-navy text-lg mb-2">Direct Coordination</p>
            <p className="text-gray-600 leading-relaxed">
              Each post includes clear instructions for how to give. Coptic Donations handles the
              coordination so you don&apos;t have to figure out the logistics on your own.
            </p>
          </div>
          <div className="text-center mt-8">
            <Link href="/how-it-works" className="btn-secondary">
              See the Full Step-by-Step Process
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
