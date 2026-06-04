import Link from 'next/link';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/items', label: 'Church Needs' },
  { href: '/about', label: 'About' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/faq', label: 'FAQ' },
  { href: '/get-connected', label: 'Get Connected' },
  { href: '/tracking/lookup', label: 'Track' },
];

const VERSE = '"Bring all the tithes into the storehouse, That there may be food in My house, And try Me now in this," Says the Lord of hosts, "If I will not open for you the windows of heaven And pour out for you such blessing That there will not be room enough to receive it." — Malachi 3:10';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Verse strip — scrolls away with the page */}
      <div className="bg-navy border-b border-navy-light px-4 py-2 text-center">
        <p className="text-sand text-xs opacity-70 italic leading-relaxed max-w-4xl mx-auto">
          {VERSE}
        </p>
      </div>

      {/* Nav bar — sticky at top always */}
      <header className="bg-navy shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <img src="/logo.png" alt="" className="w-8 h-8 object-contain" />
            <div className="text-gold font-serif text-lg font-bold leading-tight group-hover:text-gold-light transition-colors">
              Coptic Donations
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ href, label }) => (
              <NavLink key={href} href={href}>{label}</NavLink>
            ))}
          </nav>

          <button
            className="md:hidden text-gold p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-navy-dark border-t border-navy-light px-4 py-3 flex flex-col gap-3">
            {NAV_LINKS.map(({ href, label }) => (
              <NavLink key={href} href={href} onClick={() => setMobileOpen(false)}>{label}</NavLink>
            ))}
          </div>
        )}
      </header>
    </>
  );
}

function NavLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-sand hover:text-gold transition-colors duration-200 font-semibold text-sm tracking-wide"
    >
      {children}
    </Link>
  );
}
