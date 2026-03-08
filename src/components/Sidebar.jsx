import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  DollarSign,
  CalendarDays,
  BookOpen,
  GraduationCap,
  Users,
  School,
  CreditCard,
  UserCog,
  ChevronDown,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  {
    icon: UserCog,
    label: 'Staff',
    children: [
      { label: 'Responses', path: '/staff/responses' },
      { label: 'Staff Profile Database', path: '/staff/profile-database' },
    ],
  },
  {
    icon: DollarSign,
    label: 'Books',
    children: [
      { label: 'Accounts' },
      { label: 'Transactions' },
      { label: 'Reports' },
    ],
  },
  {
    icon: CalendarDays,
    label: 'Calendars',
    children: [
      { label: 'Content', path: '/calendars/content' },
      { label: 'School Calendar' },
      { label: 'Staff Calendar' },
      { label: 'Events' },
    ],
  },
  { icon: BookOpen, label: 'Lesson Plans' },
  {
    icon: GraduationCap,
    label: 'Trainings',
    children: [
      { label: 'Dashboard', path: '/trainings' },
      { label: 'Onboarding', path: '/trainings/onboarding' },
      { label: 'Tools', path: '/trainings/tools' },
      { label: "How To's", path: '/trainings/howtos' },
      { label: 'Admin', path: '/trainings/admin' },
    ],
  },
  {
    icon: Users,
    label: 'Families',
    children: [
      { label: 'Guardians' },
      { label: 'Students' },
      { label: 'Paperwork' },
    ],
  },
  {
    icon: School,
    label: 'Classrooms',
    children: [
      { label: 'Room A' },
      { label: 'Room B' },
      { label: 'Room C' },
    ],
  },
  {
    icon: CreditCard,
    label: 'Billing',
    children: [
      { label: 'Invoices' },
      { label: 'Payments' },
      { label: 'Plans' },
    ],
  },
]

function NavItem({ item }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const hasChildren = item.children && item.children.length > 0

  // Check if this item or any child is active
  const isDirectActive = item.path && location.pathname === item.path
  const isChildActive = hasChildren && item.children.some(
    (child) => child.path && location.pathname === child.path
  )
  // For Staff and Calendars: also highlight when on nested routes
  const isNestedActive =
    (item.label === 'Staff' && location.pathname.startsWith('/staff/')) ||
    (item.label === 'Calendars' && location.pathname.startsWith('/calendars/')) ||
    (item.label === 'Trainings' && location.pathname.startsWith('/trainings'))
  const isParentActive = isDirectActive || isChildActive || isNestedActive

  // Auto-expand when a child route is active
  useEffect(() => {
    if (isChildActive || isNestedActive) {
      setOpen(true)
    }
  }, [isChildActive, isNestedActive])

  const handleClick = () => {
    if (hasChildren) {
      setOpen(!open)
    } else if (item.path) {
      navigate(item.path)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
          isParentActive
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
          {item.children.map((child) => {
            const isActive = child.path && location.pathname === child.path
            return (
              <button
                key={child.label}
                onClick={() => child.path && navigate(child.path)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 font-medium'
                    : child.path
                      ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 cursor-pointer'
                      : 'text-gray-400 cursor-default'
                }`}
              >
                {child.label}
              </button>
            )
          })}
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
