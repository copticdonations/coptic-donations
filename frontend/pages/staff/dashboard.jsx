import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Cropper from 'react-easy-crop';
import { formatDate, STATUS_LABELS, STATUS_COLORS } from '../../lib/utils';
import { createItem, addItemImage, updateItem, deleteItem, getAdminDonations, getAdminStats,
  getItem, getItemImages, deleteItemImage, reorderItemImages,
  addItemPhase, updateItemPhase, deleteItemPhase,
  saveConnectionNotes, deleteConnection } from '../../lib/api';
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
    title: '', purpose_impact: '', cost: '', cost_max: '', category: '',
    service_benefiting: '', tax_receipt: 'possible', link: '',
    item_status: 'available', treasurer_email: '',
    payment_method: '', payment_instructions: '',
  });
  const [phases, setPhases] = useState([{ label: '', quantity: '1', date: '', notes: '' }]);
  const [images, setImages] = useState([]); // [{file, preview}]
  const [cropIndex, setCropIndex] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
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

  function handleFiles(e) {
    const files = Array.from(e.target.files);
    const newImgs = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setImages(prev => [...prev, ...newImgs]);
    if (fileRef.current) fileRef.current.value = '';
  }

  function openCrop(i) {
    setCropIndex(i);
    setCropSrc(images[i].preview);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), []);

  async function applyCrop() {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = cropSrc;
    await new Promise(r => { img.onload = r; });
    const { x, y, width, height } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(img, x, y, width, height, 0, 0, width, height);
    canvas.toBlob(blob => {
      const croppedFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      const croppedPreview = URL.createObjectURL(blob);
      setImages(prev => prev.map((img, i) => i === cropIndex ? { file: croppedFile, preview: croppedPreview } : img));
      setCropSrc(null);
      setCropIndex(null);
    }, 'image/jpeg', 0.92);
  }

  function removeImage(i) {
    setImages(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.title) return setError('Title is required.');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (images.length > 0) fd.append('image', images[0].file);
      const validPhases = phases.filter(p => parseInt(p.quantity) > 0);
      if (validPhases.length) {
        fd.append('phases', JSON.stringify(validPhases));
        const totalQty = validPhases.reduce((s, p) => s + (parseInt(p.quantity) || 0), 0);
        fd.append('quantity_needed', totalQty);
      }
      const result = await createItem(fd);
      for (let i = 1; i < images.length; i++) {
        const fd2 = new FormData();
        fd2.append('image', images[i].file);
        await addItemImage(result.id, fd2);
      }
      setSuccess('Item added successfully!');
      setForm({ title: '', purpose_impact: '', cost: '', cost_max: '', category: '',
        service_benefiting: '', tax_receipt: 'possible', link: '',
        item_status: 'available', treasurer_email: '',
        payment_method: '', payment_instructions: '' });
      setPhases([{ label: '', quantity: '1', date: '', notes: '' }]);
      setImages([]); setCropSrc(null); setCropIndex(null);
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
            <label className="label">Cost per Unit ($) <span className="text-gray-400 font-normal">— or range</span></label>
            <div className="grid grid-cols-2 gap-2">
              <input className="input" type="number" min="0" step="0.01" value={form.cost} onChange={f('cost')} placeholder="Min / exact" />
              <input className="input" type="number" min="0" step="0.01" value={form.cost_max || ''} onChange={f('cost_max')} placeholder="Max (optional)" />
            </div>
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
                    <input
                      className="input text-sm"
                      placeholder="Why is this needed by that date? (optional)"
                      value={phase.notes || ''}
                      onChange={e => setPhases(ps => ps.map((p, idx) => idx === i ? { ...p, notes: e.target.value } : p))}
                    />
                    {subtotal > 0 && (
                      <p className="text-xs text-right text-navy font-semibold">
                        Subtotal: ${subtotal.toFixed(2)}
                      </p>
                    )}
                  </div>
                );
              })}
              <button type="button" onClick={() => setPhases(ps => [...ps, { label: '', quantity: '1', date: '', notes: '' }])}
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
            <label className="label">Reference Link <span className="text-gray-400 font-normal">(optional)</span></label>
            <input className="input" type="url" value={form.link} onChange={f('link')} placeholder="https://..." />
          </div>
          <div>
            <label className="label">Church Treasurer Email <span className="text-gray-400 font-normal">(private — for tax receipts)</span></label>
            <input className="input" type="email" value={form.treasurer_email} onChange={f('treasurer_email')} placeholder="treasurer@church.org" />
          </div>
          <div>
            <label className="label">Payment Method</label>
            <select className="input" value={form.payment_method} onChange={f('payment_method')}>
              <option value="">— Select —</option>
              <option value="direct_vendor">Direct to Vendor (Venmo, Zelle, PayPal, etc.)</option>
              <option value="online_purchase">Online Purchase (Amazon, eBay, etc.)</option>
              <option value="church_fund">Church General Fund — Donor sends to church fund with item noted in memo</option>
              <option value="other">Other — Custom Instructions</option>
            </select>
          </div>
          {(form.payment_method === 'other' || form.payment_method === 'direct_vendor' || form.payment_method === 'church_fund') && (
            <div>
              <label className="label">Payment Instructions <span className="text-gray-400 font-normal">(shown to donor)</span></label>
              <textarea className="input resize-none" rows={2} value={form.payment_instructions} onChange={f('payment_instructions')} placeholder="e.g. Send via Venmo to @username, note 'Candles for St. Mark'" />
            </div>
          )}
          <div>
            <label className="label">Item Images <span className="text-gray-400 font-normal">(select multiple)</span></label>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles}
              className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:bg-gold-light file:text-navy file:font-semibold hover:file:bg-gold cursor-pointer" />
            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img.preview} className="w-20 h-20 rounded-lg object-cover border-2 border-sand-dark" alt={`img-${i}`} />
                    {i === 0 && <span className="absolute -top-1 -left-1 bg-gold text-navy text-[9px] font-bold px-1 rounded">Main</span>}
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      <button type="button" onClick={() => openCrop(i)}
                        className="text-white text-xs font-semibold bg-gold/80 px-2 py-0.5 rounded hover:bg-gold">
                        Crop
                      </button>
                      <button type="button" onClick={() => removeImage(i)}
                        className="text-white text-xs font-semibold bg-red-500/80 px-2 py-0.5 rounded hover:bg-red-600">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {cropSrc && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl w-full max-w-lg p-4">
                  <p className="font-bold text-navy mb-3">Adjust Crop</p>
                  <div className="relative w-full h-64 rounded-lg overflow-hidden bg-black">
                    <Cropper image={cropSrc} crop={crop} zoom={zoom} aspect={16 / 9}
                      onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <label className="text-xs text-gray-500 flex-shrink-0">Zoom</label>
                    <input type="range" min={1} max={3} step={0.05} value={zoom}
                      onChange={e => setZoom(Number(e.target.value))} className="flex-1 accent-gold" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button type="button" onClick={applyCrop}
                      className="flex-1 bg-gold text-navy font-semibold py-2 rounded-lg hover:bg-gold-dark transition-colors">
                      Apply Crop
                    </button>
                    <button type="button" onClick={() => { setCropSrc(null); setCropIndex(null); }}
                      className="flex-1 bg-gray-100 text-gray-600 font-semibold py-2 rounded-lg hover:bg-gray-200 transition-colors">
                      Skip (Keep Original)
                    </button>
                  </div>
                </div>
              </div>
            )}
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
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editImages, setEditImages] = useState([]);
  const [editPhases, setEditPhases] = useState([]);
  const [deletedPhaseIds, setDeletedPhaseIds] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const imgSrc = item.primary_image || item.image_url;

  const ef = k => e => setEditForm(p => ({ ...p, [k]: e.target.value }));

  async function openEdit() {
    const [fullItem, imagesData] = await Promise.all([
      getItem(item.id).then(d => d.item),
      getItemImages(item.id).then(d => d.images),
    ]);
    setEditForm({
      title: fullItem.title || '',
      purpose_impact: fullItem.purpose_impact || '',
      cost: fullItem.cost || '',
      cost_max: fullItem.cost_max || '',
      category: fullItem.category || '',
      service_benefiting: fullItem.service_benefiting || '',
      tax_receipt: fullItem.tax_receipt || 'possible',
      item_status: fullItem.item_status || 'available',
      link: fullItem.link || '',
      quantity_needed: fullItem.quantity_needed || 1,
      treasurer_email: fullItem.treasurer_email || '',
      payment_method: fullItem.payment_method || '',
      payment_instructions: fullItem.payment_instructions || '',
    });
    setEditImages(imagesData.map((img, i) => ({ ...img, sort_order: img.sort_order ?? i })));
    setEditPhases((fullItem.phases || []).map(p => ({ ...p })));
    setDeletedPhaseIds([]);
    setDeletedImageIds([]);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateItem(item.id, editForm);

      // Phase saves
      for (const ph of editPhases) {
        const phData = { label: ph.phase_label, quantity: ph.quantity, date: ph.target_date, notes: ph.phase_notes };
        if (ph.id) await updateItemPhase(item.id, ph.id, phData);
        else await addItemPhase(item.id, phData);
      }
      for (const pid of deletedPhaseIds) await deleteItemPhase(item.id, pid);

      // Image reorder
      if (editImages.length > 0) {
        await reorderItemImages(item.id, editImages.map((img, i) => ({ id: img.id, sort_order: i })));
      }
      for (const imgId of deletedImageIds) await deleteItemImage(item.id, imgId);

      setEditing(false);
      onRefresh();
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function moveImage(i, dir) {
    setEditImages(imgs => {
      const next = [...imgs];
      const swap = i + dir;
      if (swap < 0 || swap >= next.length) return imgs;
      [next[i], next[swap]] = [next[swap], next[i]];
      return next;
    });
  }

  function removeImage(i) {
    const img = editImages[i];
    if (img.id) setDeletedImageIds(ids => [...ids, img.id]);
    setEditImages(imgs => imgs.filter((_, idx) => idx !== i));
  }

  function updatePhase(i, field, val) {
    setEditPhases(ps => ps.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  }

  function removePhase(i) {
    const ph = editPhases[i];
    if (ph.id) setDeletedPhaseIds(ids => [...ids, ph.id]);
    setEditPhases(ps => ps.filter((_, idx) => idx !== i));
  }

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
          <button onClick={editing ? () => setEditing(false) : openEdit} className="text-gold hover:text-gold-dark text-xs font-semibold">
            {editing ? 'Close' : 'Edit'}
          </button>
          <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-600 text-xs font-semibold">
            Delete
          </button>
        </div>
      </div>
      {editing && (
        <div className="mt-3 pt-3 border-t border-sand-dark flex flex-col gap-3">
          {/* Basic fields */}
          <input className="input text-sm" placeholder="Title" value={editForm.title || ''} onChange={ef('title')} />
          <textarea className="input text-sm resize-none" rows={2} placeholder="Purpose / Impact" value={editForm.purpose_impact || ''} onChange={ef('purpose_impact')} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Cost min ($)</label>
              <input className="input text-sm" type="number" min="0" step="0.01" value={editForm.cost || ''} onChange={ef('cost')} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Cost max ($)</label>
              <input className="input text-sm" type="number" min="0" step="0.01" value={editForm.cost_max || ''} onChange={ef('cost_max')} placeholder="Optional" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className="input text-sm" placeholder="Category" value={editForm.category || ''} onChange={ef('category')} />
            <input className="input text-sm" placeholder="Service Benefiting" value={editForm.service_benefiting || ''} onChange={ef('service_benefiting')} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Qty Needed</label>
              <input className="input text-sm" type="number" min="1" value={editForm.quantity_needed || 1} onChange={ef('quantity_needed')} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <select className="input text-sm" value={editForm.item_status || 'available'} onChange={ef('item_status')}>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select className="input text-sm" value={editForm.tax_receipt || 'possible'} onChange={ef('tax_receipt')}>
              <option value="yes">Tax Receipt: Yes</option>
              <option value="possible">Tax Receipt: Possible</option>
              <option value="no">Tax Receipt: No</option>
            </select>
            <input className="input text-sm" type="url" placeholder="Reference Link (optional)" value={editForm.link || ''} onChange={ef('link')} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Church Treasurer Email (private — for tax receipts)</label>
            <input className="input text-sm" type="email" placeholder="treasurer@church.org" value={editForm.treasurer_email || ''} onChange={ef('treasurer_email')} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Payment Method</label>
            <select className="input text-sm" value={editForm.payment_method || ''} onChange={ef('payment_method')}>
              <option value="">— Select —</option>
              <option value="direct_vendor">Direct to Vendor</option>
              <option value="online_purchase">Online Purchase</option>
              <option value="church_fund">Church General Fund — Donor sends to church fund with item noted in memo</option>
              <option value="other">Other — Custom Instructions</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Payment Instructions</label>
            <textarea className="input text-sm resize-none" rows={2} value={editForm.payment_instructions || ''} onChange={ef('payment_instructions')} placeholder="e.g. Send via Venmo to @username" />
          </div>

          {/* Phases */}
          <div>
            <p className="text-xs font-semibold text-navy mb-2">Phases</p>
            <div className="flex flex-col gap-2">
              {editPhases.map((ph, i) => (
                <div key={i} className="bg-sand rounded-lg p-2 flex flex-col gap-1.5">
                  <input className="input text-xs" placeholder="Phase label" value={ph.phase_label || ''} onChange={e => updatePhase(i, 'phase_label', e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input text-xs" type="number" min="1" placeholder="Qty" value={ph.quantity || ''} onChange={e => updatePhase(i, 'quantity', e.target.value)} />
                    <input className="input text-xs" type="date" value={ph.target_date || ''} onChange={e => updatePhase(i, 'target_date', e.target.value)} />
                  </div>
                  <input className="input text-xs" placeholder="Why is this needed by that date? (optional)" value={ph.phase_notes || ''} onChange={e => updatePhase(i, 'phase_notes', e.target.value)} />
                  <button type="button" onClick={() => removePhase(i)} className="text-xs text-red-400 hover:text-red-600 font-semibold self-end">Remove phase</button>
                </div>
              ))}
              <button type="button" onClick={() => setEditPhases(ps => [...ps, { phase_label: '', quantity: 1, target_date: '' }])}
                className="text-xs text-gold hover:text-gold-dark font-semibold text-left">
                + Add Phase
              </button>
            </div>
          </div>

          {/* Images */}
          {editImages.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-navy mb-2">Images — drag to reorder</p>
              <div className="flex flex-col gap-2">
                {editImages.map((img, i) => (
                  <div key={img.id || i} className="flex items-center gap-2 bg-sand rounded-lg p-2">
                    <img src={img.image_url} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0 border border-sand-dark" />
                    {i === 0 && <span className="text-[10px] font-bold text-gold bg-navy px-1.5 py-0.5 rounded flex-shrink-0">Main</span>}
                    <div className="flex flex-col gap-0.5 ml-auto">
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="text-navy hover:text-gold disabled:opacity-20 text-xs font-bold">▲</button>
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === editImages.length - 1} className="text-navy hover:text-gold disabled:opacity-20 text-xs font-bold">▼</button>
                    </div>
                    <button type="button" onClick={() => removeImage(i)} className="text-red-400 hover:text-red-600 text-xs font-semibold flex-shrink-0">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={handleSave} disabled={saving}
              className="flex-1 bg-gold text-navy text-sm font-semibold py-1.5 rounded-lg hover:bg-gold-dark transition-colors">
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
            <button type="button" onClick={() => setEditing(false)}
              className="flex-1 bg-gray-100 text-gray-600 text-sm font-semibold py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

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

  function load() {
    fetch('/api/connections')
      .then(r => r.json())
      .then(setConnections)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;
  if (connections.length === 0) return <p className="text-center text-gray-400 py-10">No connections yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      {connections.map(c => (
        <ConnectionCard key={c.id} connection={c} onDelete={load} />
      ))}
    </div>
  );
}

function ConnectionCard({ connection: c, onDelete }) {
  const [notes, setNotes] = useState(c.notes || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this connection? This cannot be undone.')) return;
    await deleteConnection(c.id);
    onDelete();
  }

  async function handleSaveNotes() {
    setSaving(true);
    try {
      await saveConnectionNotes(c.id, notes);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Failed to save notes: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <p className="font-bold text-navy">{c.name}</p>
          <a href={`mailto:${c.email}`} className="text-sm text-gold hover:underline">{c.email}</a>
          {c.phone && <p className="text-sm text-gray-500 mt-0.5">{c.phone}</p>}
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          {c.offer_type && (
            <span className="inline-block bg-sand-dark text-navy text-xs font-semibold px-2 py-1 rounded-full">{c.offer_type}</span>
          )}
          <p className="text-xs text-gray-400">{formatDate(c.created_at)}</p>
          <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-600 font-semibold">Delete</button>
        </div>
      </div>
      {c.description && (
        <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-sand-dark">{c.description}</p>
      )}
      <div className="mt-3 pt-3 border-t border-sand-dark">
        <label className="text-xs font-semibold text-navy mb-1 block">Internal Notes</label>
        <textarea
          className="input text-sm resize-none w-full"
          rows={2}
          placeholder="Add private notes here..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        <button onClick={handleSaveNotes} disabled={saving}
          className="mt-1.5 text-xs bg-gold text-navy font-semibold px-3 py-1 rounded-lg hover:bg-gold-dark transition-colors">
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Notes'}
        </button>
      </div>
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
