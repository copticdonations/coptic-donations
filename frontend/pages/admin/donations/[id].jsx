import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { STATUS_ORDER, STATUS_LABELS, formatCurrency, formatDate } from '../../../lib/utils';
import { updateStatus, uploadInstallationPhoto } from '../../../lib/api';
import Timeline from '../../../components/tracking/Timeline';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';

export default function AdminDonationPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusForm, setStatusForm] = useState({ status: '', message: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoSubmitting, setPhotoSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef();

  async function loadData() {
    if (!id) return;
    try {
      const res = await fetch(`/api/tracking/${id}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
        const currentStatus = json.status_updates.at(-1)?.status;
        const currentIdx = STATUS_ORDER.indexOf(currentStatus);
        const nextStatus = STATUS_ORDER[currentIdx + 1] || '';
        setStatusForm(prev => ({ ...prev, status: nextStatus }));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [id]);

  async function handleStatusUpdate(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!statusForm.status) return setError('Please select a status.');
    setSubmitting(true);
    try {
      await updateStatus(data.donation.id, { status: statusForm.status, message: statusForm.message });
      setSuccess('Status updated!');
      setStatusForm(prev => ({ ...prev, message: '' }));
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePhotoUpload(e) {
    e.preventDefault();
    if (!photoFile) return setError('Please select a photo.');
    setPhotoSubmitting(true);
    setError(''); setSuccess('');
    try {
      const fd = new FormData();
      fd.append('photo', photoFile);
      await uploadInstallationPhoto(data.donation.id, fd);
      setSuccess('Installation photo uploaded!');
      setPhotoFile(null);
      if (fileRef.current) fileRef.current.value = '';
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setPhotoSubmitting(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl font-bold text-navy mb-3">Donation Not Found</p>
        <Link href="/admin" className="btn-primary">Back to Admin</Link>
      </div>
    );
  }

  const { donation, status_updates } = data;
  const currentStatus = status_updates.at(-1)?.status;
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const availableNextStatuses = STATUS_ORDER.slice(currentIdx + 1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/admin" className="text-gold hover:text-gold-dark text-sm font-semibold flex items-center gap-1 mb-6">
        <span>&#8592;</span> Back to Admin
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Donation #{donation.id}</h1>
          <p className="font-mono text-gray-400 text-sm">{donation.tracking_code}</p>
        </div>
        <Badge status={currentStatus} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-5">
          <h2 className="font-bold text-navy mb-3">Details</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Donor" value={donation.donor_name} />
            <Row label="Item" value={donation.item_title} />
            <Row label="Amount" value={<span className="text-gold font-bold">{formatCurrency(donation.amount)}</span>} />
            <Row label="Donated" value={formatDate(donation.created_at)} />
          </dl>
        </div>

        {donation.item_image_url && (
          <div className="rounded-xl overflow-hidden shadow-md aspect-video bg-sand-dark">
            <img src={donation.item_image_url} alt={donation.item_title} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="font-bold text-navy mb-4">Donation Journey</h2>
        <Timeline statusUpdates={status_updates} />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">{success}</div>}

      {availableNextStatuses.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="font-bold text-navy mb-4">Update Status</h2>
          <form onSubmit={handleStatusUpdate} className="flex flex-col gap-4">
            <div>
              <label className="label">New Status</label>
              <select
                className="input"
                value={statusForm.status}
                onChange={e => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">-- Select status --</option>
                {availableNextStatuses.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Note (optional)</label>
              <textarea
                className="input resize-none"
                rows={3}
                value={statusForm.message}
                onChange={e => setStatusForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a note for the donor about this update..."
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary self-start">
              {submitting ? 'Updating...' : 'Update Status'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-bold text-navy mb-1">Installation Photo</h2>
        <p className="text-sm text-gray-500 mb-4">Upload a photo of the item installed or in use.</p>

        {donation.installation_photo_url && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img src={donation.installation_photo_url} alt="Installed" className="w-full max-h-64 object-cover" />
            <p className="text-xs text-gray-400 mt-1">Current installation photo</p>
          </div>
        )}

        <form onSubmit={handlePhotoUpload} className="flex flex-col gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={e => setPhotoFile(e.target.files[0])}
            className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:bg-gold-light file:text-navy file:font-semibold hover:file:bg-gold cursor-pointer"
          />
          <button type="submit" disabled={photoSubmitting} className="btn-secondary self-start text-sm px-4 py-2">
            {photoSubmitting ? 'Uploading...' : 'Upload Photo'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-sand-dark last:border-0">
      <dt className="text-gray-400">{label}</dt>
      <dd className="font-semibold text-navy">{value}</dd>
    </div>
  );
}
