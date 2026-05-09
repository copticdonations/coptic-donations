import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <p className="text-6xl font-bold text-gold mb-4">404</p>
      <h1 className="text-2xl font-bold text-navy mb-3">Page Not Found</h1>
      <p className="text-gray-500 mb-8">The page you are looking for does not exist.</p>
      <Link href="/" className="btn-primary">Return Home</Link>
    </div>
  );
}
