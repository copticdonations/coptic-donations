import { useState } from 'react';
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
  const categories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))];
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? items
    : items.filter(i => i.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-navy mb-3">Donate to the Church</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Each item below is needed by our Coptic community. Your generous donation helps bring these sacred items to those who need them most.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
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

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">No items available right now.</p>
          <p className="mt-2 text-sm">Check back soon or contact the admin to add items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function ItemCard({ item }) {
  return (
    <Link href={`/items/${item.id}`} className="card group block">
      <div className="relative aspect-video bg-sand-dark overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlaceholderIcon />
          </div>
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
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-gold font-bold text-lg">{formatCurrency(item.suggested_amount)}</span>
          <span className="text-xs bg-sand text-navy px-3 py-1 rounded-full border border-gold-light font-semibold">
            Donate Now
          </span>
        </div>
      </div>
    </Link>
  );
}

function PlaceholderIcon() {
  return (
    <svg className="w-16 h-16 text-gold opacity-40" fill="currentColor" viewBox="0 0 100 100">
      <rect x="42" y="10" width="16" height="80" rx="4" />
      <rect x="10" y="35" width="80" height="16" rx="4" />
      <circle cx="50" cy="43" r="12" fill="none" stroke="currentColor" strokeWidth="6" />
    </svg>
  );
}
