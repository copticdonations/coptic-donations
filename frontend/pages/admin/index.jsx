import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS } from '../../lib/utils';
import { createItem, getAdminDonations, getAdminStats } from '../../lib/api';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

const TABS = ['items', 'donations', 'stats'];

export default function AdminPage() {
  const [tab, setTab] = useState('items');

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage donation items and track all donations</p>
        </div>
        <Link href="/" className="btn-secondary text-sm px-4 py-2">View Site</Link>
      </div>

      <div className="flex gap-2 border-b border-gray-200 mb-8">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-gold text-navy'
                : 'border-transparent text-gray-400 hover:text-navy'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'items' && <ItemsTab />}
      {tab === 'donations' && <DonationsTab />}
      {tab === 'stats' && <StatsTab />}
    </div>
  );
}

function ItemsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', suggested_amount: '', category: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef();

  async function loadItems() {
    try {
      const data = await fetch('/api/items').then(r => r.json());
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadItems(); }, []);

  function handleFile(e) {
    const f = e.target.files[0];
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.title || !form.suggested_amount) return setError('Title and amount are required.');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      await createItem(fd);
      setSuccess('Item added successfully!');
      setForm({ title: '', description: '', suggested_amount: '', category: '' });
      setFile(null); setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      loadItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    loadItems();
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-navy mb-4">Add New Item</h2>
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">{success}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Processional Cross" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the item..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Suggested Amount ($) *</label>
              <input className="input" type="number" min="1" step="0.01" value={form.suggested_amount} onChange={e => setForm(p => ({ ...p, suggested_amount: e.target.value }))} placeholder="e.g. 150" />
            </div>
            <div>
              <label className="label">Category</label>
              <input className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Sanctuary" list="categories" />
              <datalist id="categories">
                {['Sanctuary', 'Icons', 'Church Furniture', 'Liturgical Vestments'].map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>
          <div>
            <label className="label">Item Image</label>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:bg-gold-light file:text-navy file:font-semibold hover:file:bg-gold cursor-pointer" />
            {preview && <img src={preview} className="mt-3 rounded-lg h-32 object-cover" alt="preview" />}
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold text-navy mb-4">Existing Items ({items.length})</h2>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 flex gap-3 items-start">
                <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-sand-dark overflow-hidden">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gold opacity-50 text-2xl">✝</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-navy text-sm truncate">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.category} &bull; {formatCurrency(item.suggested_amount)}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 text-xs font-semibold flex-shrink-0">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DonationsTab() {
  const [data, setData] = useState({ donations: [], total: 0 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAdminDonations(page, statusFilter)
      .then(setData)
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  const statuses = ['', 'received', 'processing', 'shipped', 'delivered', 'installed'];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {statuses.map(s => (
          <button key={s || 'all'} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${
              statusFilter === s ? 'bg-gold text-navy-dark border-gold' : 'border-gold text-navy hover:bg-gold-light'
            }`}>
            {s ? STATUS_LABELS[s] : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : data.donations.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No donations found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.donations.map(d => (
            <Link key={d.id} href={`/admin/donations/${d.id}`}
              className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy text-sm">{d.donor_name}</p>
                <p className="text-xs text-gray-500 truncate">{d.item_title}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{d.tracking_code}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-gold font-bold">{formatCurrency(d.amount)}</span>
                <Badge status={d.current_status} />
                <span className="text-xs text-gray-400">{formatDate(d.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {data.total > 20 && (
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">
            Previous
          </button>
          <span className="py-2 text-sm text-gray-500">Page {page} of {Math.ceil(data.total / 20)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(data.total / 20)} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function StatsTab() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminStats().then(setStats);
  }, []);

  if (!stats) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Donations" value={stats.total_donations} />
        <StatCard label="Total Raised" value={formatCurrency(stats.total_raised)} highlight />
        {Object.entries(stats.by_status).map(([s, count]) => (
          <div key={s} className="bg-white rounded-xl shadow-sm p-4">
            <Badge status={s} />
            <p className="text-2xl font-bold text-navy mt-2">{count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={`rounded-xl shadow-sm p-5 ${highlight ? 'bg-navy text-white' : 'bg-white'}`}>
      <p className={`text-sm ${highlight ? 'text-gold' : 'text-gray-400'}`}>{label}</p>
      <p className={`text-3xl font-bold mt-1 ${highlight ? 'text-gold' : 'text-navy'}`}>{value}</p>
    </div>
  );
}
