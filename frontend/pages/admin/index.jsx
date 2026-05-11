import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS } from '../../lib/utils';
import { createItem, getAdminDonations, getAdminStats, getItemImages, addItemImage, deleteItemImage, reorderItemImages, updateItem } from '../../lib/api';
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
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors ${tab === t ? 'border-gold text-navy' : 'border-transparent text-gray-400 hover:text-navy'}`}>
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

// ── IMAGE UPLOAD BOX (reusable) ──────────────────────────────────────────────
function ImageUploadBox({ onFiles }) {
  const fileRef = useRef();
  const [driveUrl, setDriveUrl] = useState('');
  const [driveError, setDriveError] = useState('');

  function handleDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) onFiles(files);
  }

  function handleFileInput(e) {
    const files = Array.from(e.target.files);
    if (files.length) onFiles(files);
  }

  function handlePaste(e) {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(i => i.type.startsWith('image/'));
    if (imageItems.length) {
      const files = imageItems.map(i => i.getAsFile());
      onFiles(files);
    }
  }

  function handleDriveUrl() {
    setDriveError('');
    const match = driveUrl.match(/\/d\/([\w-]+)/);
    if (!match) return setDriveError('Invalid Google Drive link. Make sure you copied the sharing URL.');
    const fileId = match[1];
    const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    fetch(directUrl).then(r => {
      if (!r.ok) throw new Error();
      return r.blob();
    }).then(blob => {
      const file = new File([blob], `drive-image-${fileId}.jpg`, { type: blob.type || 'image/jpeg' });
      onFiles([file]);
      setDriveUrl('');
    }).catch(() => {
      setDriveError('Could not load image. Make sure the file is set to "Anyone with the link can view" in Google Drive.');
    });
  }

  return (
    <div onPaste={handlePaste} tabIndex={0} className="outline-none">
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
        className="border-2 border-dashed border-gold rounded-xl p-6 text-center cursor-pointer hover:bg-gold-light transition-colors"
      >
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <span className="text-4xl">📷</span>
          <p className="text-sm font-semibold text-navy">Drag & drop images here</p>
          <p className="text-xs">or click to browse • or paste with Ctrl+V / ⌘+V</p>
          <p className="text-xs text-gray-300">JPG, PNG, or WEBP</p>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileInput} className="hidden" />
      </div>
      <div className="mt-3 flex gap-2 items-start">
        <div className="flex-1">
          <input
            className="input text-sm"
            placeholder="Or paste a Google Drive sharing link..."
            value={driveUrl}
            onChange={e => setDriveUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleDriveUrl())}
          />
          {driveError && <p className="text-xs text-red-500 mt-1">{driveError}</p>}
        </div>
        <button type="button" onClick={handleDriveUrl}
          className="btn-secondary text-xs px-3 py-2 whitespace-nowrap">
          Load Image
        </button>
      </div>
    </div>
  );
}

// ── IMAGE REORDER + MANAGE (reusable) ────────────────────────────────────────
function ImageManager({ itemId, onUpdate }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const dragIdx = useRef(null);

  async function loadImages() {
    try {
      const data = await getItemImages(itemId);
      setImages(data.images || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadImages(); }, [itemId]);

  async function handleNewFiles(files) {
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('image', file);
        await addItemImage(itemId, fd);
      }
      await loadImages();
      if (onUpdate) onUpdate();
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(imageId) {
    if (!confirm('Remove this image?')) return;
    await deleteItemImage(itemId, imageId);
    loadImages();
    if (onUpdate) onUpdate();
  }

  function handleDragStart(idx) { dragIdx.current = idx; }

  async function handleDrop(idx) {
    if (dragIdx.current === null || dragIdx.current === idx) return;
    const reordered = [...images];
    const [moved] = reordered.splice(dragIdx.current, 1);
    reordered.splice(idx, 0, moved);
    setImages(reordered);
    dragIdx.current = null;
    await reorderItemImages(itemId, reordered.map(img => img.id));
    if (onUpdate) onUpdate();
  }

  if (loading) return <div className="flex justify-center py-4"><Spinner /></div>;

  return (
    <div className="flex flex-col gap-4">
      <ImageUploadBox onFiles={handleNewFiles} />
      {uploading && <p className="text-xs text-gold font-semibold text-center">Uploading...</p>}
      {images.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">Drag to reorder • First image is the cover</p>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, idx) => (
              <div
                key={img.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(idx)}
                className="relative group rounded-lg overflow-hidden aspect-square bg-sand-dark cursor-grab active:cursor-grabbing border-2 border-transparent hover:border-gold transition-colors"
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute top-1 left-1 bg-gold text-navy text-xs font-bold px-1.5 py-0.5 rounded">Cover</span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ITEMS TAB ────────────────────────────────────────────────────────────────
function ItemsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', suggested_amount: '', category: '' });
  const [pendingFiles, setPendingFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  async function loadItems() {
    try {
      const data = await fetch('/api/items').then(r => r.json());
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadItems(); }, []);

  function handleNewFiles(files) {
    setPendingFiles(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  }

  function removePreview(idx) {
    setPendingFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.title || !form.suggested_amount) return setError('Title and amount are required.');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (pendingFiles.length) fd.append('image', pendingFiles[0]);
      const created = await createItem(fd);
      // upload remaining images if more than one
      if (pendingFiles.length > 1 && created.item?.id) {
        for (const file of pendingFiles.slice(1)) {
          const ifd = new FormData();
          ifd.append('image', file);
          await addItemImage(created.item.id, ifd);
        }
      }
      setSuccess('Item added successfully!');
      setForm({ title: '', description: '', suggested_amount: '', category: '' });
      setPendingFiles([]); setPreviews([]);
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

  function startEdit(item) {
    setEditingId(item.id);
    setEditForm({ title: item.title, description: item.description || '', suggested_amount: item.suggested_amount, category: item.category || '' });
  }

  async function saveEdit(id) {
    await updateItem(id, editForm);
    setEditingId(null);
    loadItems();
  }

  return (
    <div className="flex flex-col gap-10">

      {/* ADD NEW ITEM */}
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
                {['Sanctuary', 'Icons', 'Church Furniture', 'Liturgical Vestments', 'Monastery Needs', 'Church Equipment', 'Homeless Outreach', 'Youth Ministry', 'Service Supplies'].map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          {/* IMAGE UPLOAD */}
          <div>
            <label className="label">Images</label>
            <ImageUploadBox onFiles={handleNewFiles} />
            {previews.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden aspect-square bg-sand-dark">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && <span className="absolute top-1 left-1 bg-gold text-navy text-xs font-bold px-1.5 py-0.5 rounded">Cover</span>}
                    <button type="button" onClick={() => removePreview(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </div>

      {/* EXISTING ITEMS */}
      <div>
        <h2 className="text-xl font-bold text-navy mb-4">Existing Items ({items.length})</h2>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : (
          <div className="flex flex-col gap-6">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-md p-5">

                {/* ITEM HEADER */}
                <div className="flex gap-3 items-start mb-4">
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-sand-dark overflow-hidden">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gold opacity-50 text-2xl">✝</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingId === item.id ? (
                      <div className="flex flex-col gap-2">
                        <input className="input text-sm" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} />
                        <textarea className="input text-sm resize-none" rows={2} value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
                        <div className="grid grid-cols-2 gap-2">
                          <input className="input text-sm" type="number" value={editForm.suggested_amount} onChange={e => setEditForm(p => ({ ...p, suggested_amount: e.target.value }))} placeholder="Amount" />
                          <input className="input text-sm" value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))} placeholder="Category" />
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => saveEdit(item.id)} className="btn-primary text-xs px-3 py-1.5">Save</button>
                          <button type="button" onClick={() => setEditingId(null)} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-bold text-navy text-sm">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.category} • {formatCurrency(item.suggested_amount)}</p>
                        {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>}
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {editingId !== item.id && (
                      <button onClick={() => startEdit(item)} className="text-gold hover:text-gold-dark text-xs font-semibold">Edit</button>
                    )}
                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
                  </div>
                </div>

                {/* IMAGE MANAGER — always visible, no More/Hide toggle */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Images</p>
                  <ImageManager itemId={item.id} onUpdate={loadItems} />
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── DONATIONS TAB ────────────────────────────────────────────────────────────
function DonationsTab() {
  const [data, setData] = useState({ donations: [], total: 0 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAdminDonations(page, statusFilter).then(setData).finally(() => setLoading(false));
  }, [page, statusFilter]);

  const statuses = ['', 'received', 'processing', 'shipped', 'delivered', 'installed'];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {statuses.map(s => (
          <button key={s || 'all'} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${statusFilter === s ? 'bg-gold text-navy-dark border-gold' : 'border-gold text-navy hover:bg-gold-light'}`}>
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
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">Previous</button>
          <span className="py-2 text-sm text-gray-500">Page {page} of {Math.ceil(data.total / 20)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(data.total / 20)} className="btn-secondary text-sm px-4 py-2 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}

// ── STATS TAB ────────────────────────────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState(null);
  useEffect(() => { getAdminStats().then(setStats); }, []);
  if (!stats) return <div className="flex justify-center py-10"><Spinner /></div>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard label="Total Donations" value={stats.total_donations} />
      <StatCard label="Total Raised" value={formatCurrency(stats.total_raised)} highlight />
      {Object.entries(stats.by_status).map(([s, count]) => (
        <div key={s} className="bg-white rounded-xl shadow-sm p-4">
          <Badge status={s} />
          <p className="text-2xl font-bold text-navy mt-2">{count}</p>
        </div>
      ))}
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
