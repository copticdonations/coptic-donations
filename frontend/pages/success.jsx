import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function SuccessPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('donationSuccess');
    if (!raw) {
      router.replace('/');
    } else {
      setData(JSON.parse(raw));
      sessionStorage.removeItem('donationSuccess');
    }
  }, [router]);

  function copyCode() {
    if (!data) return;
    navigator.clipboard.writeText(data.tracking_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handlePrint() {
    window.print();
  }

  if (!data) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">🕊</div>
      <h1 className="text-4xl font-bold text-navy mb-3">God Bless You!</h1>
      <p className="text-lg text-gray-600 mb-2">
        Dear <strong>{data.donor_name}</strong>, your commitment to provide{' '}
        <strong>{data.item_title}</strong> has been received.
      </p>
      <p className="text-gray-500 mb-10">
        We will be in touch to coordinate delivery. Your generosity serves the Coptic community with faith and love.
      </p>

      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <p className="text-sm text-gray-500 mb-2 font-semibold uppercase tracking-wider">Your Tracking Code</p>
        <div className="text-3xl font-mono font-bold text-navy bg-sand rounded-xl py-4 px-6 mb-4 tracking-widest border-2 border-gold">
          {data.tracking_code}
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={copyCode}
            className="text-sm text-gold hover:text-gold-dark font-semibold transition-colors"
          >
            {copied ? '✓ Copied!' : 'Copy to clipboard'}
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={handlePrint}
            className="text-sm text-gold hover:text-gold-dark font-semibold transition-colors no-print"
          >
            Print this page
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Save this code to track your commitment&apos;s journey.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center no-print">
        <Link href={`/tracking/${data.tracking_code}`} className="btn-primary text-center">
          Track Your Commitment
        </Link>
        <Link href="/" className="btn-secondary text-center">
          Browse More Items
        </Link>
      </div>
    </div>
  );
}
