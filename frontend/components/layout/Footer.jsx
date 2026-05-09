export default function Footer() {
  return (
    <footer className="bg-navy text-sand mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-gold font-serif text-lg mb-1">&#x2728; Glory to God in the Highest &#x2728;</p>
        <p className="text-sm opacity-70">
          Coptic Donations &mdash; Serving the Church with love and faith
        </p>
        <p className="text-xs opacity-50 mt-2">&copy; {new Date().getFullYear()} All rights reserved</p>
      </div>
    </footer>
  );
}
