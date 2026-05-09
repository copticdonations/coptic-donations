export const STATUS_ORDER = ['received', 'processing', 'shipped', 'delivered', 'installed'];

export const STATUS_LABELS = {
  received: 'Donation Received',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  installed: 'Installed & In Use',
};

export const STATUS_COLORS = {
  received: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-orange-100 text-orange-800',
  installed: 'bg-green-100 text-green-800',
};

export const STATUS_ICONS = {
  received: '✓',
  processing: '⚙',
  shipped: '✈',
  delivered: '📦',
  installed: '🕊',
};

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(isoString) {
  if (!isoString) return '';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(isoString));
}
