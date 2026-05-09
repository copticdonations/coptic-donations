export const STATUS_ORDER = ['commitment_received', 'item_sent', 'delivered', 'tax_receipt_sent', 'completed'];

export const STATUS_LABELS = {
  commitment_received: 'Commitment Received',
  item_sent: 'Item Sent',
  delivered: 'Delivered',
  tax_receipt_sent: 'Tax Receipt Sent',
  completed: 'Completed',
};

export const STATUS_COLORS = {
  commitment_received: 'bg-blue-100 text-blue-800',
  item_sent: 'bg-purple-100 text-purple-800',
  delivered: 'bg-orange-100 text-orange-800',
  tax_receipt_sent: 'bg-teal-100 text-teal-800',
  completed: 'bg-green-100 text-green-800',
};

export const STATUS_ICONS = {
  commitment_received: '✓',
  item_sent: '✈',
  delivered: '📦',
  tax_receipt_sent: '🧾',
  completed: '🕊',
};

export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(isoString) {
  if (!isoString) return '';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(isoString));
}
