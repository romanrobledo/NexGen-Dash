import { Users, UserCheck, UserCog, CalendarDays } from 'lucide-react'

const stats = [
  {
    title: 'Total Children',
    value: '84',
    subtitle: '+3 from last month',
    subtitleColor: 'text-green-500',
    icon: Users,
    iconBg: 'bg-purple-50',
    iconColor: 'text-primary',
  },
  {
    title: 'Present Today',
    value: '78',
    subtitle: '92.9% attendance',
    subtitleColor: 'text-green-500',
    icon: UserCheck,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    title: 'Staff On Duty',
    value: '12',
    subtitle: 'Full staff',
    subtitleColor: 'text-green-500',
    icon: UserCog,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Upcoming Events',
    value: '5',
    subtitle: 'This week',
    subtitleColor: 'text-gray-500',
    icon: CalendarDays,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
]

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
            <div className={`w-9 h-9 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
          <p className={`text-sm ${stat.subtitleColor}`}>{stat.subtitle}</p>
        </div>
      ))}
    </div>
  )
}
