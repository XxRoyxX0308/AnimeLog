import clsx from 'clsx'

const STATUS_COLORS = {
  watching: 'bg-green-500',
  completed: 'bg-blue-500',
  on_hold: 'bg-yellow-500',
  dropped: 'bg-red-500',
  plan_to_watch: 'bg-purple-500'
}

const STATUS_LABELS = {
  watching: 'Watching',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped',
  plan_to_watch: 'Plan to Watch'
}

export default function StatusBadge({ status, size = 'md' }) {
  return (
    <span 
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm'
      )}
      style={{ backgroundColor: `${STATUS_COLORS[status]}20` }}
    >
      <span className={clsx('w-2 h-2 rounded-full', STATUS_COLORS[status])} />
      <span className="text-gray-200">{STATUS_LABELS[status] || status}</span>
    </span>
  )
}
