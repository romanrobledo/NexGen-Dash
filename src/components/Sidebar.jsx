import { useState } from 'react'
import {
  LayoutDashboard,
  DollarSign,
  CalendarDays,
  MessageSquare,
  BookOpen,
  UtensilsCrossed,
  Users,
  School,
  CreditCard,
  UserCog,
  Receipt,
  ChevronDown,
  Shield,
  FileText,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  {
    icon: DollarSign,
    label: 'Books',
    children: ['Accounts', 'Transactions', 'Reports'],
  },
  {
    icon: CalendarDays,
    label: 'Calendars',
    children: ['School Calendar', 'Staff Calendar', 'Events'],
  },
  { icon: MessageSquare, label: 'Messages' },
  { icon: BookOpen, label: 'Lesson Plans' },
  { icon: UtensilsCrossed, label: 'Food Program' },
  {
    icon: Users,
    label: 'Families',
    children: ['Guardians', 'Students', 'Paperwork'],
    defaultOpen: true,
  },
  {
    icon: School,
    label: 'Classrooms',
    children: ['Room A', 'Room B', 'Room C'],
  },
  {
    icon: CreditCard,
    label: 'Billing',
    children: ['Invoices', 'Payments', 'Plans'],
  },
  {
    icon: UserCog,
    label: 'Staff',
    children: ['Directory', 'Schedules', 'Reviews'],
  },
  { icon: Receipt, label: 'Payroll' },
]

function NavItem({ item }) {
  const [open, setOpen] = useState(item.defaultOpen || false)
  const hasChildren = item.children && item.children.length > 0

  return (
    <div>
      <button
        onClick={() => hasChildren && setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
          item.active
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-5 h-5" />
          {item.label}
        </div>
        {hasChildren && (
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>
      {hasChildren && open && (
        <div className="ml-8 mt-0.5 space-y-0.5">
          {item.children.map((child) => (
            <button
              key={child}
              className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {child}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      <div className="px-5 py-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">NEXGEN</h1>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">&copy; 2026 NexGen School</p>
      </div>
    </aside>
  )
}
