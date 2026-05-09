import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div style={{ background: 'red', color: 'white', textAlign: 'center', padding: '8px', fontWeight: 'bold', fontSize: '14px' }}>
        ✓ NEW VERSION DEPLOYED
      </div>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
