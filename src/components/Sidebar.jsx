import {
  LayoutDashboard,
  Baby,
  Users,
  CalendarDays,
  FileBarChart,
  MessageSquare,
  TrendingUp,
  HeartPulse,
  Settings,
  HelpCircle,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Baby, label: 'Children' },
  { icon: Users, label: 'Staff' },
  { icon: CalendarDays, label: 'Schedule' },
  { icon: FileBarChart, label: 'Reports' },
  { icon: MessageSquare, label: 'Messages' },
  { icon: TrendingUp, label: 'Analytics' },
  { icon: HeartPulse, label: 'Health & Safety' },
  { icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-5 flex items-center gap-3">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
          <HeartPulse className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">NexGen</h1>
          <p className="text-xs text-gray-500">Child Care Center</p>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
              item.active
                ? 'bg-primary-light text-primary'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 m-3 mb-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Need Help?</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">Contact support for assistance</p>
        <button className="w-full py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors">
          Get Support
        </button>
      </div>
    </aside>
  )
}
