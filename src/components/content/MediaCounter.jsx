import { Minus, Plus } from 'lucide-react'

export default function MediaCounter({ label, value, target, onChange }) {
  const percentage = Math.min(100, Math.round((value / target) * 100))
  const isComplete = value >= target

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-gray-700 w-16">{label}</span>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <Minus className="w-3.5 h-3.5 text-gray-500" />
      </button>
      <span
        className={`text-sm font-semibold w-14 text-center ${
          isComplete ? 'text-green-600' : 'text-gray-900'
        }`}
      >
        {value}/{target}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <Plus className="w-3.5 h-3.5 text-gray-500" />
      </button>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
