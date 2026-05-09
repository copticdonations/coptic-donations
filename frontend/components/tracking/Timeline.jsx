import { STATUS_ORDER, STATUS_LABELS, STATUS_ICONS, formatDate } from '../../lib/utils';

export default function Timeline({ statusUpdates }) {
  const completedStatuses = new Set(statusUpdates.map(u => u.status));
  const latestStatus = statusUpdates.length > 0 ? statusUpdates[statusUpdates.length - 1].status : null;
  const latestIndex = STATUS_ORDER.indexOf(latestStatus);

  const getUpdateForStatus = (status) => statusUpdates.find(u => u.status === status);

  return (
    <div className="relative">
      <div className="hidden md:flex justify-between items-start relative">
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 z-0">
          <div
            className="h-full bg-gold transition-all duration-500"
            style={{ width: latestIndex >= 0 ? `${(latestIndex / (STATUS_ORDER.length - 1)) * 100}%` : '0%' }}
          />
        </div>

        {STATUS_ORDER.map((status, index) => {
          const completed = index <= latestIndex;
          const isCurrent = index === latestIndex;
          const update = getUpdateForStatus(status);

          return (
            <div key={status} className="flex flex-col items-center flex-1 z-10 px-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-4 transition-all duration-300 ${
                completed
                  ? isCurrent
                    ? 'bg-gold border-gold-dark text-navy scale-110 shadow-lg'
                    : 'bg-green-500 border-green-600 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {completed ? STATUS_ICONS[status] : index + 1}
              </div>
              <p className={`mt-2 text-xs font-semibold text-center leading-tight ${completed ? 'text-navy' : 'text-gray-400'}`}>
                {STATUS_LABELS[status]}
              </p>
              {update && (
                <p className="mt-1 text-xs text-gray-500 text-center">{formatDate(update.timestamp)}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="md:hidden flex flex-col gap-0">
        {STATUS_ORDER.map((status, index) => {
          const completed = index <= latestIndex;
          const isCurrent = index === latestIndex;
          const update = getUpdateForStatus(status);

          return (
            <div key={status} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-4 flex-shrink-0 ${
                  completed
                    ? isCurrent
                      ? 'bg-gold border-gold-dark text-navy'
                      : 'bg-green-500 border-green-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {completed ? STATUS_ICONS[status] : index + 1}
                </div>
                {index < STATUS_ORDER.length - 1 && (
                  <div className={`w-0.5 flex-1 min-h-8 mt-1 ${completed ? 'bg-gold' : 'bg-gray-200'}`} />
                )}
              </div>
              <div className="pb-6 flex-1 min-w-0">
                <p className={`font-semibold ${completed ? 'text-navy' : 'text-gray-400'}`}>
                  {STATUS_LABELS[status]}
                </p>
                {update && (
                  <>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(update.timestamp)}</p>
                    {update.message && (
                      <p className="text-sm text-gray-700 mt-1 italic">"{update.message}"</p>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:flex flex-col gap-3 mt-8">
        {statusUpdates.map(update => (
          update.message && (
            <div key={update.id} className="bg-white rounded-lg p-4 border-l-4 border-gold">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-navy">{STATUS_LABELS[update.status]}</span>
                <span className="text-xs text-gray-400">{formatDate(update.timestamp)}</span>
              </div>
              <p className="text-sm text-gray-700 italic">"{update.message}"</p>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
