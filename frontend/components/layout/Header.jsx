import Link from 'next/link';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/items', label: 'Browse' },
  { href: '/about', label: 'About' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/faq', label: 'FAQ' },
  { href: '/get-connected', label: 'Get Connected' },
  { href: '/tracking/lookup', label: 'Track' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-navy shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="Coptic Donations" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <div className="text-gold font-serif text-lg font-bold leading-tight">Coptic Donations</div>
            <div className="text-sand text-xs opacity-75">Malachi 3:10</div>
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
