import { CheckCircle2 } from 'lucide-react'

export default function ProgramBadge({ name, color, bucket, status }) {
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
        status === 'completed' ? 'opacity-60' : ''
      }`}
      style={{ backgroundColor: color + '20', color: color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="truncate">{name}</span>
      {status === 'completed' && (
        <CheckCircle2 className="w-3 h-3 ml-auto flex-shrink-0" />
      )}
    </div>
  )
}
