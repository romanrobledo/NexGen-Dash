import {
  UserPlus,
  ClipboardCheck,
  MessageSquare,
  CalendarPlus,
  FileText,
  Bell,
} from 'lucide-react'

const actions = [
  { icon: UserPlus, label: 'New Enrollment', color: 'bg-green-50 text-green-600 hover:bg-green-100' },
  { icon: ClipboardCheck, label: 'Take Attendance', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
  { icon: MessageSquare, label: 'Message Parents', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
  { icon: CalendarPlus, label: 'Schedule Event', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
  { icon: FileText, label: 'Daily Report', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
  { icon: Bell, label: 'Send Alert', color: 'bg-red-50 text-red-600 hover:bg-red-100' },
]

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 w-80">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${action.color}`}
          >
            <action.icon className="w-6 h-6" />
            <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
