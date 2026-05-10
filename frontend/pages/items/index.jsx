import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '../../lib/utils';

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

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'need_by_date', label: 'Urgent Need' },
  { value: 'cost_asc', label: 'Price: Low to High' },
  { value: 'cost_desc', label: 'Price: High to Low' },
];

export default function ItemsPage({ items }) {
  const rawCategories = [...new Set(items.map(i => i.category).filter(Boolean))];
  const categories = ['All', ...rawCategories];
  const [activeCategory, setActiveCategory] = useState('All');
  const [sort, setSort] = useState('recent');

  const filtered = (activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory))
    .slice()
    .sort((a, b) => {
      if (sort === 'cost_asc') return (a.cost || 0) - (b.cost || 0);
      if (sort === 'cost_desc') return (b.cost || 0) - (a.cost || 0);
      if (sort === 'need_by_date') {
        if (!a.need_by_date && !b.need_by_date) return 0;
        if (!a.need_by_date) return 1;
        if (!b.need_by_date) return -1;
        return new Date(a.need_by_date) - new Date(b.need_by_date);
      }
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  const completedCount = items.filter(i => i.item_status === 'completed').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <p className="text-gold font-semibold text-xs uppercase tracking-widest mb-2">Coptic Community</p>
        <h1 className="text-4xl font-serif font-bold text-navy mb-3">
          Church Needs {items.filter(i => i.item_status === 'available').length > 0 && (
            <span className="text-2xl text-gold font-serif">— {items.filter(i => i.item_status === 'available').length}</span>
          )}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Each item below is a specific, verified need. You commit to providing it — we handle
          coordination and keep you updated every step of the way.
        </p>
        {completedCount > 0 && (
          <div className="mt-6 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-full px-5 py-2 text-sm font-semibold">
            <span>{completedCount} item{completedCount !== 1 ? 's' : ''} already fulfilled by our community</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                activeCategory === cat
                  ? 'bg-gold text-navy-dark'
                  : 'bg-white text-navy border border-gold hover:bg-gold hover:text-navy-dark'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="border border-gold rounded-lg px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-gold"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">No items available right now.</p>
          <p className="mt-2 text-sm">Check back soon or contact us to add items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <div className="mt-16 bg-navy rounded-2xl p-8 text-center text-white">
        <p className="text-gold font-serif text-2xl font-bold mb-2">Want to donate something not listed?</p>
        <p className="text-sand opacity-80 mb-6">
          We welcome all generous offers. Tell us what you&apos;d like to provide and we&apos;ll find the right fit.
        </p>
        <Link href="/get-connected" className="btn-primary">Get Connected</Link>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8 max-w-2xl mx-auto">
        This platform does not process payments. Donors coordinate directly with the church to provide
        items. All commitments are voluntary and may be tax-deductible where indicated.
      </p>
    </div>
  );
}

function ItemCard({ item }) {
  const images = item.images && item.images.length > 0 ? item.images : (item.image_url ? [item.image_url] : []);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const isUrgent = item.need_by_date &&
    new Date(item.need_by_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => setCurrent(i => (i + 1) % images.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [images.length]);

  function go(e, dir) {
    e.preventDefault();
    clearInterval(timerRef.current);
    setCurrent(i => (i + dir + images.length) % images.length);
    timerRef.current = setInterval(() => setCurrent(i => (i + 1) % images.length), 5000);
  }

  return (
    <Link href={`/items/${item.id}`} className="card group block relative">
      {item.fully_committed && (
        <div className="absolute top-2 right-2 z-10 bg-gray-700 text-white text-xs font-bold px-2 py-0.5 rounded">
          Fully Committed
        </div>
      )}
      {!item.fully_committed && isUrgent && (
        <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
          Urgent
        </div>
      )}
      <div className="relative aspect-video bg-sand overflow-hidden">
        {images.length > 0 ? (
          images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: `translateX(${(i - current) * 100}%)`,
                transition: 'transform 500ms ease-in-out',
              }}
            />
          ))
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <img src="/logo.png" alt="" className="w-10 h-10 object-contain opacity-40" />
            <p className="text-navy text-xs font-semibold text-center px-3 line-clamp-2 opacity-60">{item.title}</p>
          </div>
        )}
        {item.category && (
          <span className="absolute top-2 left-2 z-10 bg-navy text-gold text-xs font-bold px-2 py-1 rounded">
            {item.category}
          </span>
        )}
        {images.length > 1 && (
          <>
            <button onClick={e => go(e, -1)}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg leading-none transition-colors">
              ‹
            </button>
            <button onClick={e => go(e, 1)}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg leading-none transition-colors">
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
              {images.map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          </>
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
          <div>
            <span className="text-gold font-bold text-lg">{formatCurrency(item.cost || item.suggested_amount)}</span>
            {(item.quantity_needed > 1 || (item.phases && item.phases.length > 0)) && (
              <span className="text-xs text-gray-400 ml-1">/ unit</span>
            )}
            {item.quantity_needed > 1 && !(item.phases && item.phases.length > 0) && (
              <p className="text-xs text-gray-400 mt-0.5">× {item.quantity_needed} needed</p>
            )}
            {item.need_by_date && (
              <p className="text-xs text-gray-400 mt-0.5">Needed by {formatDate(item.need_by_date)}</p>
            )}
          </div>
          {item.fully_committed ? (
            <span className="text-xs bg-gray-200 text-gray-500 px-3 py-1 rounded-full font-semibold">
              Committed
            </span>
          ) : (
            <span className="text-xs bg-sand text-navy px-3 py-1 rounded-full border border-gold-light font-semibold">
              {item.remaining_qty > 0 && item.remaining_qty < (item.quantity_needed || 1)
                ? `${item.remaining_qty} left`
                : 'Commit'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
