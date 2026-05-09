async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getItems(category) {
  const url = category ? `/api/items?category=${encodeURIComponent(category)}` : '/api/items';
  return handleResponse(await fetch(url));
}

export async function getItem(id) {
  return handleResponse(await fetch(`/api/items/${id}`));
}

export async function createDonation(body) {
  return handleResponse(await fetch('/api/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
}

export async function getTracking(code) {
  return handleResponse(await fetch(`/api/tracking/${encodeURIComponent(code)}`));
}

export async function getAdminDonations(page = 1, status = '') {
  const params = new URLSearchParams({ page, limit: 20 });
  if (status) params.set('status', status);
  return handleResponse(await fetch(`/api/donations?${params}`));
}

export async function createItem(formData) {
  return handleResponse(await fetch('/api/items', {
    method: 'POST',
    body: formData,
  }));
}

export async function updateStatus(donationId, body) {
  return handleResponse(await fetch(`/api/donations/${donationId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
}

export async function uploadInstallationPhoto(donationId, formData) {
  return handleResponse(await fetch(`/api/donations/${donationId}/installation-photo`, {
    method: 'POST',
    body: formData,
  }));
}

export async function getAdminStats() {
  return handleResponse(await fetch('/api/admin/stats'));
}
