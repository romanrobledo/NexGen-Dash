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
  PanelLeftClose,
  PanelLeftOpen,
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

function NavItem({ item, collapsed }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const hasChildren = item.children && item.children.length > 0

  // Check if this item or any child is active
  const isDirectActive = item.path && location.pathname === item.path
  const isChildActive = hasChildren && item.children.some(
    (child) => child.path && location.pathname === child.path
  )
  // For Staff, Calendars, Trainings: also highlight when on nested routes
  const isNestedActive =
    (item.label === 'Staff' && location.pathname.startsWith('/staff/')) ||
    (item.label === 'Calendars' && location.pathname.startsWith('/calendars/')) ||
    (item.label === 'Trainings' && location.pathname.startsWith('/trainings'))
  const isParentActive = isDirectActive || isChildActive || isNestedActive

  // Auto-expand when a child route is active (only when not collapsed)
  useEffect(() => {
    if ((isChildActive || isNestedActive) && !collapsed) {
      setOpen(true)
    }
  }, [isChildActive, isNestedActive, collapsed])

  // Collapse children when sidebar collapses
  useEffect(() => {
    if (collapsed) setOpen(false)
  }, [collapsed])

  const handleClick = () => {
    if (collapsed) {
      // In collapsed mode, if the item has a direct path, navigate there
      // Otherwise navigate to the first child with a path
      if (item.path) {
        navigate(item.path)
      } else if (hasChildren) {
        const firstWithPath = item.children.find((c) => c.path)
        if (firstWithPath) navigate(firstWithPath.path)
      }
      return
    }
    if (hasChildren) {
      setOpen(!open)
    } else if (item.path) {
      navigate(item.path)
    }
  }

  if (collapsed) {
    return (
      <div className="relative group">
        <button
          onClick={handleClick}
          className={`w-full flex items-center justify-center p-2.5 rounded-lg mb-0.5 transition-colors ${
            isParentActive
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
          title={item.label}
        >
          <item.icon className="w-5 h-5" />
        </button>
        {/* Tooltip */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
          {item.label}
        </div>
      </div>
    )
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

export default function Sidebar({ collapsed = false, onToggle }) {
  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between py-6 ${collapsed ? 'px-3' : 'px-5'}`}>
        {!collapsed && (
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">NEXGEN</h1>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Nav items */}
      <nav className={`flex-1 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
        {navItems.map((item) => (
          <NavItem key={item.label} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer */}
      <div className={`py-4 border-t border-gray-100 ${collapsed ? 'px-2' : 'px-5'}`}>
        {!collapsed && (
          <p className="text-xs text-gray-400">&copy; 2026 NexGen School</p>
        )}
      </div>
    </aside>
  )
}
