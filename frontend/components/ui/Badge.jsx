import { STATUS_COLORS, STATUS_LABELS } from '../../lib/utils';

export default function Badge({ status }) {
  const color = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  );
}
