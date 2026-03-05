import { MapPin, UserPlus, AlertTriangle, FileText } from 'lucide-react'

const activities = [
  {
    icon: MapPin,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Field Trip Scheduled',
    description: 'Zoo visit planned for March 15',
    time: '2 hours ago',
  },
  {
    icon: UserPlus,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: 'New Enrollment',
    description: 'Emma Wilson joined Toddlers class',
    time: '4 hours ago',
  },
  {
    icon: AlertTriangle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    title: 'Health Alert',
    description: 'Seasonal flu advisory sent to parents',
    time: 'Yesterday',
  },
  {
    icon: FileText,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    title: 'Report Generated',
    description: 'Monthly attendance report ready',
    time: 'Yesterday',
  },
]

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 w-80">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <p className="text-sm text-gray-500">Latest updates and notifications</p>
      </div>
      <div className="space-y-4">
        {activities.map((activity, i) => (
          <div key={i} className="flex gap-3">
            <div className={`w-9 h-9 rounded-full ${activity.iconBg} flex items-center justify-center shrink-0`}>
              <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-xs text-gray-500">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
