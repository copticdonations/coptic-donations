async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getItems(params = {}) {
  const q = new URLSearchParams();
  if (params.category) q.set('category', params.category);
  if (params.sort) q.set('sort', params.sort);
  const url = q.toString() ? `/api/items?${q}` : '/api/items';
  return handleResponse(await fetch(url));
}

export async function getItem(id) {
  return handleResponse(await fetch(`/api/items/${id}`));
}

export async function getItemImages(itemId) {
  return handleResponse(await fetch(`/api/items/${itemId}/images`));
}

export async function addItemImage(itemId, formData) {
  return handleResponse(await fetch(`/api/items/${itemId}/images`, {
    method: 'POST',
    body: formData,
  }));
}

export async function createItem(formData) {
  return handleResponse(await fetch('/api/items', {
    method: 'POST',
    body: formData,
  }));
}

export async function updateItem(id, body) {
  return handleResponse(await fetch(`/api/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
}

export async function deleteItem(id) {
  return handleResponse(await fetch(`/api/items/${id}`, { method: 'DELETE' }));
}

export async function createDonation(body) {
  return handleResponse(await fetch('/api/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
}

export async function getItemById(id) {
  return handleResponse(await fetch(`/api/items/${id}`));
}

export async function getDonationById(id) {
  return handleResponse(await fetch(`/api/donations/${id}`));
}

export async function getAdminDonations(page = 1, status = '') {
  const params = new URLSearchParams({ page, limit: 20 });
  if (status) params.set('status', status);
  return handleResponse(await fetch(`/api/donations?${params}`));
}

export async function getTracking(code) {
  return handleResponse(await fetch(`/api/tracking/${encodeURIComponent(code)}`));
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

export async function uploadDonorReceipt(donationId, formData) {
  return handleResponse(await fetch(`/api/donations/${donationId}/receipt`, {
    method: 'POST',
    body: formData,
  }));
}

export async function getAdminStats() {
  return handleResponse(await fetch('/api/admin/stats'));
}

export async function login(password) {
  return handleResponse(await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  }));
}

export async function subscribeNewsletter(data) {
  return handleResponse(await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }));
}

export async function submitContact(data) {
  return handleResponse(await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }));
}

export async function submitConnection(data) {
  return handleResponse(await fetch('/api/connections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }));
}

export async function deleteConnection(id) {
  return handleResponse(await fetch(`/api/connections/${id}`, { method: 'DELETE' }));
}

export async function saveConnectionNotes(id, notes) {
  return handleResponse(await fetch(`/api/connections/${id}/notes`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  }));
}

export async function deleteItemImage(itemId, imageId) {
  return handleResponse(await fetch(`/api/items/${itemId}/images/${imageId}`, { method: 'DELETE' }));
}

export async function reorderItemImages(itemId, order) {
  return handleResponse(await fetch(`/api/items/${itemId}/images/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order }),
  }));
}

export async function addItemPhase(itemId, phase) {
  return handleResponse(await fetch(`/api/items/${itemId}/phases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(phase),
  }));
}

export async function updateItemPhase(itemId, phaseId, phase) {
  return handleResponse(await fetch(`/api/items/${itemId}/phases/${phaseId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(phase),
  }));
}

export async function deleteItemPhase(itemId, phaseId) {
  return handleResponse(await fetch(`/api/items/${itemId}/phases/${phaseId}`, { method: 'DELETE' }));
}
