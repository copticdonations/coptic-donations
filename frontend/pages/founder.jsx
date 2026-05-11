import Link from 'next/link';

export default function FounderPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/about" className="text-gold hover:text-gold-dark text-sm font-semibold flex items-center gap-1 mb-8">
        <span>&#8592;</span> Back to About
      </Link>

      <div className="text-center mb-10">
        <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-4">Leadership</p>
        <img
          src="/founder.jpg"
          alt="Mercurius Yasa"
          className="w-40 h-40 rounded-full object-cover object-top shadow-xl mx-auto mb-5"
        />
        <h1 className="text-4xl font-bold text-navy mb-2">Mercurius Yasa</h1>
        <p className="text-lg text-gray-600">Founder &amp; Coordinator</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
        <p className="text-gray-700 leading-relaxed mb-4">
          Fr. Mercurius founded Coptic Donations with a simple vision: that every member of the community should have
          the opportunity to make a tangible, lasting contribution to the life of the church.
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          Inspired by the ancient Coptic tradition of communal generosity, he believed that connecting donors directly
          with specific needs — rather than abstract fundraising — would deepen the sense of ownership and spiritual
          investment in the church&apos;s mission.
        </p>
        <p className="text-gray-700 leading-relaxed">
          &quot;When you provide the altar cloth with your own hands,&quot; he often says, &quot;you carry a piece of every
          liturgy celebrated upon it. That is the beauty of targeted giving.&quot;
        </p>
      </div>

      <div className="bg-navy rounded-2xl p-8 text-center text-white">
        <p className="text-gold font-serif text-xl font-bold mb-2">Join the Mission</p>
        <p className="text-sand opacity-80 text-sm mb-5">
          Every item donated is a prayer made physical — a gift that serves the faithful for years to come.
        </p>
        <Link href="/" className="btn-primary">Browse Items</Link>
      </div>
    </div>
  );
}
