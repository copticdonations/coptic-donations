import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { formatDate, STATUS_LABELS, STATUS_COLORS } from '../../lib/utils';
import { createItem, addItemImage, getAdminDonations, getAdminStats, deleteItem } from '../../lib/api';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import AdminGuard from '../../components/ui/AdminGuard';

const TABS = ['items', 'donations', 'connections', 'stats'];

export default function StaffDashboard() {
  const [tab, setTab] = useState('items');
  const [role, setRole] = useState('');

  useEffect(() => {
    setRole(sessionStorage.getItem('adminRole') || '');
  }, []);

  function handleLogout() {
    sessionStorage.removeItem('adminRole');
    window.location.href = '/staff';
  }

  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy">Staff Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage donation items and track all commitments
              {role && <span className="ml-2 text-gold font-semibold capitalize">({role})</span>}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="btn-secondary text-sm px-4 py-2">View Site</Link>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-navy transition-colors">
              Sign Out
            </button>
          </div>
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
        {tab === 'connections' && <ConnectionsTab />}
        {tab === 'stats' && <StatsTab />}
      </div>
    </AdminGuard>
  );
}

function ItemsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', purpose_impact: '', cost: '', category: '',
    service_benefiting: '', tax_receipt: 'possible', link: '',
    item_status: 'available',
  });
  const [phases, setPhases] = useState([{ label: '', quantity: '1', date: '' }]);
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
    if (!form.title) return setError('Title is required.');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (file) fd.append('image', file);
      const validPhases = phases.filter(p => parseInt(p.quantity) > 0);
      if (validPhases.length) {
        fd.append('phases', JSON.stringify(validPhases));
        const totalQty = validPhases.reduce((s, p) => s + (parseInt(p.quantity) || 0), 0);
        fd.append('quantity_needed', totalQty);
      }
      await createItem(fd);
      setSuccess('Item added successfully!');
      setForm({ title: '', purpose_impact: '', cost: '', category: '',
        service_benefiting: '', tax_receipt: 'possible', link: '',
        item_status: 'available' });
      setPhases([{ label: '', quantity: '1', date: '' }]);
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
    if (!confirm('Delete this item? This cannot be undone.')) return;
    await deleteItem(id);
    loadItems();
  }

  const f = (k) => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-navy mb-4">Add New Item</h2>
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">{success}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={f('title')} placeholder="e.g. Processional Cross" />
          </div>
          <div>
            <label className="label">Purpose / Impact</label>
            <textarea className="input resize-none" rows={3} value={form.purpose_impact} onChange={f('purpose_impact')} placeholder="Describe what this item does and its significance..." />
          </div>
          <div>
            <label className="label">Cost per Unit ($)</label>
            <input className="input" type="number" min="0" step="0.01" value={form.cost} onChange={f('cost')} placeholder="e.g. 150" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <input className="input" value={form.category} onChange={f('category')} placeholder="e.g. Sanctuary" list="cats" />
              <datalist id="cats">
                {['Sanctuary', 'Icons', 'Church Furniture', 'Liturgical Vestments', 'Education'].map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="label">Service Benefiting</label>
              <input className="input" value={form.service_benefiting} onChange={f('service_benefiting')} placeholder="e.g. Liturgy" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tax Receipt</label>
              <select className="input" value={form.tax_receipt} onChange={f('tax_receipt')}>
                <option value="yes">Yes</option>
                <option value="possible">Possible</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.item_status} onChange={f('item_status')}>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Quantity Phases</label>
            <div className="flex flex-col gap-2">
              {phases.map((phase, i) => {
                const unitCost = parseFloat(form.cost) || 0;
                const qty = parseInt(phase.quantity) || 0;
                const subtotal = unitCost * qty;
                return (
                  <div key={i} className="bg-sand rounded-lg p-3 flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                      <input
                        className="input flex-1 text-sm"
                        placeholder={`Phase ${i + 1} label (optional)`}
                        value={phase.label}
                        onChange={e => setPhases(ps => ps.map((p, idx) => idx === i ? { ...p, label: e.target.value } : p))}
                      />
                      {phases.length > 1 && (
                        <button type="button" onClick={() => setPhases(ps => ps.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-600 text-xs font-semibold flex-shrink-0">
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Quantity</label>
                        <input
                          className="input text-sm"
                          type="number" min="1"
                          value={phase.quantity}
                          onChange={e => setPhases(ps => ps.map((p, idx) => idx === i ? { ...p, quantity: e.target.value } : p))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Needed By</label>
                        <input
                          className="input text-sm"
                          type="date"
                          value={phase.date}
                          onChange={e => setPhases(ps => ps.map((p, idx) => idx === i ? { ...p, date: e.target.value } : p))}
                        />
                      </div>
                    </div>
                    {subtotal > 0 && (
                      <p className="text-xs text-right text-navy font-semibold">
                        Subtotal: ${subtotal.toFixed(2)}
                      </p>
                    )}
                  </div>
                );
              })}
              <button type="button" onClick={() => setPhases(ps => [...ps, { label: '', quantity: '1', date: '' }])}
                className="text-sm text-gold hover:text-gold-dark font-semibold text-left">
                + Add Phase
              </button>
              {(() => {
                const unitCost = parseFloat(form.cost) || 0;
                const total = phases.reduce((s, p) => s + (parseInt(p.quantity) || 0) * unitCost, 0);
                const totalQty = phases.reduce((s, p) => s + (parseInt(p.quantity) || 0), 0);
                return total > 0 ? (
                  <div className="flex justify-between text-sm font-bold text-navy border-t border-sand-dark pt-2 mt-1">
                    <span>Total Qty: {totalQty}</span>
                    <span>Total: ${total.toFixed(2)}</span>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
          <div>
            <label className="label">Reference Link</label>
            <input className="input" type="url" value={form.link} onChange={f('link')} placeholder="https://..." />
          </div>
          <div>
            <label className="label">Item Image</label>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile}
              className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:bg-gold-light file:text-navy file:font-semibold hover:file:bg-gold cursor-pointer" />
            {preview && <img src={preview} className="mt-3 rounded-lg h-32 object-cover" alt="preview" />}
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold text-navy mb-4">All Items ({items.length})</h2>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <ItemRow key={item.id} item={item} onDelete={handleDelete} onRefresh={loadItems} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ItemRow({ item, onDelete, onRefresh }) {
  const [showExtra, setShowExtra] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const imgSrc = item.primary_image || item.image_url;

  async function handleAddImage(e) {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', f);
      await addItemImage(item.id, fd);
      onRefresh();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex gap-3 items-start">
        <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-sand-dark overflow-hidden">
          {imgSrc
            ? <img src={imgSrc} alt={item.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-gold opacity-50 text-2xl">✝</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-navy text-sm truncate">{item.title}</p>
          <p className="text-xs text-gray-400">{item.category} &bull; ${item.cost || 0}</p>
          {item.item_status !== 'available' && (
            <span className="text-xs text-orange-600 font-semibold">{item.item_status}</span>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setShowExtra(!showExtra)} className="text-blue-400 hover:text-blue-600 text-xs font-semibold">
            {showExtra ? 'Hide' : 'More'}
          </button>
          <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-600 text-xs font-semibold">
            Delete
          </button>
        </div>
      </div>
      {showExtra && (
        <div className="mt-3 pt-3 border-t border-sand-dark">
          <p className="text-xs text-gray-500 mb-2">Add another image:</p>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAddImage}
            className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-gold-light file:text-navy file:text-xs hover:file:bg-gold cursor-pointer" />
          {uploading && <p className="text-xs text-gold mt-1">Uploading...</p>}
          {item.images && item.images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {item.images.map((src, i) => (
                <img key={i} src={src} alt="" className="w-12 h-12 rounded object-cover border border-sand-dark" />
              ))}
            </div>
          )}
        </div>
      )}
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

  const statuses = ['', 'commitment_received', 'item_sent', 'delivered', 'tax_receipt_sent', 'completed'];

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
        <p className="text-center text-gray-400 py-10">No commitments found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.donations.map(d => (
            <Link key={d.id} href={`/staff/donations/${d.id}`}
              className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy text-sm">{d.donor_name}</p>
                <p className="text-xs text-gray-500 truncate">{d.item_title}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{d.tracking_code}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
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

function ConnectionsTab() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/connections')
      .then(r => r.json())
      .then(setConnections)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  if (connections.length === 0) return (
    <p className="text-center text-gray-400 py-10">No connections yet.</p>
  );

  return (
    <div className="flex flex-col gap-3">
      {connections.map(c => (
        <div key={c.id} className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <p className="font-bold text-navy">{c.name}</p>
              <a href={`mailto:${c.email}`} className="text-sm text-gold hover:underline">{c.email}</a>
              {c.phone && <p className="text-sm text-gray-500 mt-0.5">{c.phone}</p>}
            </div>
            <div className="text-right">
              {c.offer_type && (
                <span className="inline-block bg-sand-dark text-navy text-xs font-semibold px-2 py-1 rounded-full">
                  {c.offer_type}
                </span>
              )}
              <p className="text-xs text-gray-400 mt-1">{formatDate(c.created_at)}</p>
            </div>
          </div>
          {c.description && (
            <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-sand-dark">{c.description}</p>
          )}
        </div>
      ))}
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
        <div className="bg-navy rounded-xl shadow-sm p-5">
          <p className="text-gold text-sm">Total Commitments</p>
          <p className="text-3xl font-bold text-gold mt-1">{stats.total_donations}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-400 text-sm">Active Items</p>
          <p className="text-3xl font-bold text-navy mt-1">{stats.total_items}</p>
        </div>
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
