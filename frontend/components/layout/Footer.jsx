import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-navy text-sand mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="text-gold font-serif text-lg font-bold mb-2">Coptic Donations</p>
            <p className="text-sm opacity-70 leading-relaxed">
              Connecting generous hearts with the needs of our Coptic community — one sacred item at a time.
            </p>
          </div>
          <div>
            <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">Quick Links</p>
            <ul className="flex flex-col gap-2 text-sm opacity-80">
              <li><Link href="/" className="hover:text-gold transition-colors">Browse Items</Link></li>
              <li><Link href="/how-it-works" className="hover:text-gold transition-colors">How It Works</Link></li>
              <li><Link href="/about" className="hover:text-gold transition-colors">About Us</Link></li>
              <li><Link href="/get-connected" className="hover:text-gold transition-colors">Get Connected</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
              <li><Link href="/tracking/lookup" className="hover:text-gold transition-colors">Track a Donation</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">Contact</p>
            <p className="text-sm opacity-80">
              <a href="mailto:info@copticdonations.org" className="hover:text-gold transition-colors">
                info@copticdonations.org
              </a>
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-sand border-opacity-30 flex items-center justify-center hover:border-gold hover:text-gold transition-colors text-sm opacity-70">
                f
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-sand border-opacity-30 flex items-center justify-center hover:border-gold hover:text-gold transition-colors text-sm opacity-70">
                IG
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-sand border-opacity-20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gold font-serif text-sm">&#x2728; Glory to God in the Highest</p>
          <p className="text-xs opacity-40">
            <Link href="/staff" className="hover:opacity-80 transition-opacity">&copy;</Link>{' '}
            {new Date().getFullYear()} Coptic Donations &mdash; All rights reserved{' '}
            <Link href="/staff" className="opacity-0 hover:opacity-0 select-none" tabIndex={-1}>&#x2728;</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
