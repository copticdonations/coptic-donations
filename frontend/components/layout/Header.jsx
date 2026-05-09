import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-navy shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <CopticCross className="w-10 h-10 text-gold group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-gold font-serif text-lg font-bold leading-tight">Coptic Donations</div>
            <div className="text-sand text-xs opacity-75">Glory to God in the Highest</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink href="/">Browse Items</NavLink>
          <NavLink href="/tracking/lookup">Track Donation</NavLink>
          <NavLink href="/admin">Admin</NavLink>
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
          <NavLink href="/" onClick={() => setMobileOpen(false)}>Browse Items</NavLink>
          <NavLink href="/tracking/lookup" onClick={() => setMobileOpen(false)}>Track Donation</NavLink>
          <NavLink href="/admin" onClick={() => setMobileOpen(false)}>Admin</NavLink>
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

function CopticCross({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="42" y="10" width="16" height="80" rx="4" />
      <rect x="10" y="35" width="80" height="16" rx="4" />
      <circle cx="50" cy="43" r="12" fill="none" stroke="currentColor" strokeWidth="6" />
    </svg>
  );
}
