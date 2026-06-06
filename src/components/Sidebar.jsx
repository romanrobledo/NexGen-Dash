import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useViewMode } from '../contexts/ViewModeContext'
import {
  LayoutDashboard,

  DollarSign,
  GraduationCap,
  Users,
  CreditCard,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Target,
  ShieldCheck,
  FileText,
  Building2,
  CalendarDays,
  ClipboardList,
  Clock,
  Zap,
  Activity,
  Megaphone,
  FolderOpen,
  UserPlus,
  Monitor,
  Smartphone,
  X,
  Menu,
  BotMessageSquare,
} from 'lucide-react'

// Each top-level item has a permissionKey that maps to role_permissions.
// Items WITHOUT a permissionKey are visible to everyone (universal access).
const navItems = [
  {
    icon: BotMessageSquare,
    label: 'AI Chat',
    path: '/ai-chat',
    // no permissionKey — accessible to every authenticated user
  },
  {
    icon: Zap,
    label: 'Quick Focus',
    permissionKey: 'quick_focus',
    path: '/quick-focus',
  },
  // "Clock in / out" and the entire time-clock/payroll subsystem were
  // removed when the platform got refocused around training. Pages,
  // routes, hooks, and the Team Pulse dashboard section have all been
  // deleted. The Supabase tables (daily_checkins, daily_checkouts,
  // lunch_breaks, payroll_submissions, time_edit_requests) still exist
  // and hold any historical data, but nothing in the client reads them.
  {
    icon: Building2,
    label: 'Facility',
    permissionKey: 'facility',
    children: [
      { label: 'Dashboard', path: '/facility' },
      { label: 'Engagement', path: '/facility/engagement' },
      {
        label: 'Rooms',
        children: [
          {
            label: 'After School 1',
            children: [
              { label: 'Lesson Plans' },
            ],
          },
          {
            label: 'After School 2',
            children: [
              { label: 'Lesson Plans' },
            ],
          },
          {
            label: 'Infant Room',
            children: [
              { label: 'Lesson Plans' },
            ],
          },
          {
            label: 'Pre-Kinder Room',
            children: [
              { label: 'Lesson Plans' },
            ],
          },
          {
            label: 'Pre-School Room',
            children: [
              { label: 'Lesson Plans' },
            ],
          },
          {
            label: 'Toddler Room',
            children: [
              { label: 'Lesson Plans' },
            ],
          },
          {
            label: 'Young Toddler Room',
            children: [
              { label: 'Lesson Plans' },
            ],
          },
        ],
      },
    ],
  },
  {
    icon: UserPlus,
    label: 'Leads',
    permissionKey: 'leads',
    children: [
      { label: 'Dashboard', path: '/leads' },
      { label: 'Tours', path: '/leads/tours' },
      { label: 'Procedures', path: '/leads/procedures' },
    ],
  },
  {
    icon: Users,
    label: 'Families',
    permissionKey: 'families',
    children: [
      { label: 'Guardians' },
      { label: 'Students' },
      { label: 'Paperwork' },
    ],
  },
  {
    icon: GraduationCap,
    label: 'Trainings',
    permissionKey: 'library',
    children: [
      { label: 'Dashboard', path: '/trainings' },
      { label: 'Onboarding', path: '/trainings/onboarding' },
      {
        label: 'Role Clarity',
        children: [
          { label: 'Who Are We', path: '/dashboard/who-are-we' },
          { label: 'Who Am I', path: '/dashboard/who-am-i' },
          { label: 'What Do I Do', path: '/dashboard/what-do-i-do' },
          { label: 'How Do I Do It', path: '/dashboard/how-do-i-do-it' },
          { label: 'When Do I Do It', path: '/dashboard/when-do-i-do-it' },
          { label: 'Why Is It Important', path: '/dashboard/why-is-it-important' },
          { label: 'How Do I Know I Am Doing A Good Job', path: '/dashboard/how-do-i-know' },
          { label: 'When Do We Meet', path: '/dashboard/when-do-we-meet' },
          { label: 'What Do We Talk About', path: '/dashboard/what-do-we-talk-about' },
          { label: 'Where Do We Go If You Have Questions', path: '/dashboard/where-to-go' },
          { label: 'What Are The Most Important Metrics', path: '/dashboard/important-metrics' },
        ],
      },
      // TRS sits directly under Role Clarity so the two compliance/context
      // groupings are visually adjacent in the sidebar. How To's intentionally
      // drops below them — it's more of a reference/how-do tool than a
      // structured training track.
      {
        label: 'TRS',
        children: [
          { label: 'Cat 1 — Staff Qualifications', path: '/trainings/trs/cat-1' },
          { label: 'Cat 2 — Interactions', path: '/trainings/trs/cat-2' },
          { label: 'Cat 3 — Program Admin', path: '/trainings/trs/cat-3' },
          { label: 'Cat 4 — Environments', path: '/trainings/trs/cat-4' },
        ],
      },
      { label: "How To's", path: '/trainings/howtos' },
      {
        label: 'Team Fulfillment',
        children: [
          {
            label: 'Classrooms',
            path: '/trainings/fulfillment',
            children: [
              { label: 'Infant Room', path: '/trainings/fulfillment/infant-room' },
              { label: 'Older Infant Room', path: '/trainings/fulfillment/older-infant-room' },
              { label: 'Young Toddler Room', path: '/trainings/fulfillment/young-toddler-room' },
              { label: 'Toddler Room', path: '/trainings/fulfillment/toddler-room' },
              { label: 'Pre-Kinder Room', path: '/trainings/fulfillment/pre-kinder-room' },
              { label: 'Kinder Room', path: '/trainings/fulfillment/kinder-room' },
              { label: 'Afterschool Room', path: '/trainings/fulfillment/afterschool-room' },
            ],
          },
          { label: 'Tools', path: '/trainings/fulfillment/tools' },
        ],
      },
      {
        label: 'Team Administration',
        children: [
          { label: 'Admin', path: '/trainings/admin' },
          { label: 'Tools', path: '/trainings/administration/tools' },
        ],
      },
      {
        label: 'Team Improvement',
        children: [
          { label: 'Support', path: '/trainings/support' },
          { label: 'Tools', path: '/trainings/improvement/tools' },
        ],
      },
      {
        label: 'Team Revenue',
        children: [
          {
            label: 'Sales',
            path: '/trainings/sales',
            children: [
              { label: 'Playbook', path: '/trainings/sales/playbook' },
              { label: 'Campaigns', path: '/trainings/sales/campaigns' },
              { label: 'Routine', path: '/trainings/sales/routine' },
            ],
          },
          { label: 'Marketing', path: '/trainings/marketing' },
          { label: 'Tours', path: '/trainings/tours' },
          { label: 'Offers', path: '/trainings/offers' },
          { label: 'Tools', path: '/trainings/revenue/tools' },
        ],
      },
    ],
  },
  // Calendars promoted from a sub-item under Resources to its own top-level
  // menu. Keeping it close to Trainings (rather than buried inside Resources)
  // so it's a one-click destination instead of a two-click drill-in. No
  // permissionKey yet — visible to all authenticated users. If we later want
  // to gate it, add a `calendars` entry to NAV_PERMISSIONS and attach it
  // here.
  {
    icon: CalendarDays,
    label: 'Calendars',
    children: [
      { label: 'School Calendar' },
      { label: 'Staff Calendar' },
      { label: 'Events' },
    ],
  },
  {
    icon: FolderOpen,
    label: 'Resources',
    permissionKey: 'resources',
    children: [
      { label: 'Handbooks', path: '/handbooks' },
      { label: 'Applications', path: '/applications' },
      { label: 'TRS', path: '/trs/documents' },
      { label: 'SOP Library', path: '/sop-library' },
    ],
  },
  // ── Visual break between the operational modules (Facility, Trainings,
  //     Resources) and the commercial modules (Billing, Marketing, Finance).
  { separator: true },
  {
    icon: CreditCard,
    label: 'Billing',
    permissionKey: 'billing',
    children: [
      { label: 'Dashboard', path: '/billing' },
      { label: 'Invoices' },
      { label: 'Payments' },
      { label: 'Plans' },
    ],
  },
  {
    icon: Megaphone,
    label: 'Marketing',
    permissionKey: 'marketing',
    children: [
      { label: 'Dashboard', path: '/marketing' },
      { label: 'Content Calendar', path: '/calendars/content' },
      {
        label: 'Offers',
        path: '/marketing/offers',
        children: [
          {
            label: 'Giveaways',
            path: '/marketing/offers/giveaways',
            children: [
              { label: 'Bags', path: '/marketing/offers/giveaways/bags' },
              { label: 'Kits', path: '/marketing/offers/giveaways/kits' },
              { label: 'Baskets', path: '/marketing/offers/giveaways/baskets' },
            ],
          },
          { label: 'Decoy', path: '/marketing/offers/decoy' },
          { label: 'Buy X, Get Y', path: '/marketing/offers/buy-x-get-y' },
          { label: 'Pay Less Now or Pay More Later', path: '/marketing/offers/pay-less-now' },
          {
            label: 'Free Goodwill Offer',
            path: '/marketing/offers/free-goodwill',
            children: [
              { label: '3 Month Scholarship', path: '/marketing/offers/free-goodwill/3-month-scholarship' },
            ],
          },
        ],
      },
    ],
  },
  {
    icon: DollarSign,
    label: 'Finance',
    permissionKey: 'finance',
    children: [
      { label: 'Dashboard', path: '/finance' },
      {
        label: 'Books',
        children: [
          { label: 'Accounts' },
          { label: 'Transactions' },
          { label: 'Reports' },
        ],
      },
    ],
  },
  {
    icon: ShieldCheck,
    label: 'Admin',
    permissionKey: 'admin_panel',
    children: [
      { label: 'S.A.N.D.', path: '/' },
      { label: 'Compliance', path: '/admin/performance-compliance' },
      // Team Pulse and its /admin/team-pulse route were deleted alongside
      // the broader time-clock/payroll cleanup. The section previously on
      // the S.A.N.D. dashboard is gone too.
      { label: 'Data Integrity', path: '/admin/data-integrity' },
      {
        label: 'Targets & Tasks',
        children: [
          { label: 'Dashboard', path: '/targets' },
          { label: 'Targets', path: '/targets/progress' },
          { label: 'Tasks', path: '/targets/tasks' },
        ],
      },
      {
        label: 'Staff Management',
        children: [
          { label: 'Accounts', path: '/admin' },
          { label: 'Submissions', path: '/staff/responses' },
          { label: 'Permissions', path: '/admin/permissions' },
          // Clocked Hours + Time Clock & Payroll entries removed alongside
          // the broader time-clock cleanup. Pages + DB tables are also gone.
        ],
      },
      {
        label: 'Platform Settings',
        children: [
          { label: 'Theme & Appearance', path: '/admin/settings/theme' },
          { label: 'Integrations', path: '/admin/settings/integrations' },
          { label: 'Webhooks', path: '/admin/settings/webhooks' },
        ],
      },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Recursively check if any descendant path matches the current location */
function hasActiveDescendant(children, pathname) {
  if (!children) return false
  return children.some(
    (child) =>
      (child.path && pathname === child.path) ||
      (child.path && pathname.startsWith(child.path + '/')) ||
      hasActiveDescendant(child.children, pathname)
  )
}

// ─── Recursive child-item renderer ───────────────────────────────────────────

function ChildItem({ child, depth = 0 }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const hasChildren = child.children && child.children.length > 0

  const isDirectActive = child.path && location.pathname === child.path
  const isDescendantActive = hasChildren && hasActiveDescendant(child.children, location.pathname)
  const isActive = isDirectActive || isDescendantActive

  // Auto-expand when a descendant is active
  useEffect(() => {
    if (isDescendantActive || isDirectActive) {
      setOpen(true)
    }
  }, [isDescendantActive, isDirectActive])

  const handleClick = () => {
    if (hasChildren) {
      setOpen(!open)
      // Also navigate if the item has its own path
      if (child.path) navigate(child.path)
    } else if (child.path) {
      navigate(child.path)
    }
  }

  // Indentation: first level of children uses pl-3, deeper levels add pl-3 more
  const paddingLeft = `${0.75 + depth * 0.75}rem`

  return (
    <div>
      <button
        onClick={handleClick}
        style={{ paddingLeft }}
        className={`w-full text-left pr-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
          isDirectActive
            ? 'text-blue-600 bg-blue-50 font-medium'
            : isDescendantActive
              ? 'text-blue-600 font-medium'
              : child.path || hasChildren
                ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 cursor-pointer'
                : 'text-gray-400 cursor-default'
        }`}
      >
        <span className="truncate">{child.label}</span>
        {hasChildren && (
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>
      {hasChildren && open && (
        <div className="mt-0.5 space-y-0.5">
          {child.children.map((grandchild) => (
            <ChildItem key={grandchild.label} child={grandchild} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Top-level NavItem ───────────────────────────────────────────────────────

function NavItem({ item, collapsed }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const hasChildren = item.children && item.children.length > 0

  // Check if this item or any child is active
  const isDirectActive = item.path && location.pathname === item.path
  const isChildActive = hasChildren && hasActiveDescendant(item.children, location.pathname)
  // For nested menus: also highlight when on nested routes
  const isNestedActive =
    (item.label === 'Trainings' &&
      (location.pathname.startsWith('/trainings') || location.pathname.startsWith('/dashboard/'))) ||
    (item.label === 'Targets & Tasks' && location.pathname.startsWith('/targets')) ||
    (item.label === 'Admin' &&
      (location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff/'))) ||
    (item.label === 'Quick Focus' && location.pathname === '/quick-focus') ||
    (item.label === 'Handbooks' && location.pathname === '/handbooks') ||
    (item.label === 'Applications' && location.pathname === '/applications') ||
    (item.label === 'Marketing' && location.pathname.startsWith('/marketing')) ||
    (item.label === 'Facility' && location.pathname.startsWith('/facility')) ||
    (item.label === 'Leads' && location.pathname.startsWith('/leads')) ||
    (item.label === 'AI Chat' && location.pathname.startsWith('/ai-chat'))
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
          {item.children.map((child) => (
            <ChildItem key={child.label} child={child} depth={0} />
          ))}
        </div>
      )}
    </div>
  )
}

function ViewModeToggle({ collapsed }) {
  const { mobileMode, setMobileMode } = useViewMode()

  if (collapsed) {
    return (
      <button
        onClick={() => setMobileMode(!mobileMode)}
        className="w-full flex items-center justify-center p-2.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        title={mobileMode ? 'Switch to Desktop' : 'Switch to Mobile'}
      >
        {mobileMode ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
      </button>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-400">&copy; 2026 NexGen School</p>
      <button
        onClick={() => setMobileMode(!mobileMode)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          mobileMode ? 'bg-blue-600' : 'bg-gray-300'
        }`}
        title={mobileMode ? 'Switch to Desktop' : 'Switch to Mobile'}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center transition-transform duration-200 ${
            mobileMode ? 'translate-x-5' : 'translate-x-0'
          }`}
        >
          {mobileMode ? (
            <Smartphone className="w-3 h-3 text-blue-600" />
          ) : (
            <Monitor className="w-3 h-3 text-gray-500" />
          )}
        </span>
      </button>
    </div>
  )
}

export default function Sidebar({ collapsed = false, onToggle, mobileOpen = false, onMobileClose }) {
  const { hasPermission, staff } = useAuth()
  const { mobileMode } = useViewMode()
  const location = useLocation()

  // Close mobile drawer on navigation
  useEffect(() => {
    if (mobileMode && onMobileClose) {
      onMobileClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, mobileMode])

  // Filter nav items by user permissions. Separators always pass through.
  const visibleItems = navItems.filter((item) => {
    if (item.separator) return true
    if (!item.permissionKey) return true
    if (!staff) return true
    return hasPermission(item.permissionKey)
  })

  // Tiny divider component used inline in the nav. Forest-gray line with
  // breathing room above and below. Hides its own padding when collapsed so
  // the line stays visually symmetric against the narrow rail.
  const NavDivider = ({ collapsed: isCollapsed }) => (
    <div
      className={isCollapsed ? 'my-2 mx-auto w-6 h-px bg-gray-200' : 'my-3 mx-2 h-px bg-gray-200'}
      aria-hidden="true"
    />
  )

  // Mobile mode: slide-over drawer.
  if (mobileMode) {
    return (
      <>
        {/* Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 transition-opacity"
            onClick={onMobileClose}
          />
        )}
        <aside
          className={`bg-white flex flex-col h-screen fixed left-0 top-0 w-72 z-50 shadow-xl transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-5">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">NEXGEN</h1>
            <button
              onClick={onMobileClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3">
            {visibleItems.map((item, i) =>
              item.separator ? (
                <NavDivider key={`sep-${i}`} collapsed={false} />
              ) : (
                <NavItem key={item.label} item={item} collapsed={false} />
              )
            )}
          </nav>

          {/* Footer with toggle */}
          <div className="py-4 border-t border-gray-100 px-5">
            <ViewModeToggle collapsed={false} />
          </div>
        </aside>
      </>
    )
  }

  // Desktop mode: standard sidebar
  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center py-6 ${collapsed ? 'justify-center px-3' : 'px-5'}`}>
        {!collapsed && (
          <h1 className="flex-1 text-center text-2xl font-black text-gray-900 tracking-tight">NEXGEN</h1>
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
        {visibleItems.map((item, i) =>
          item.separator ? (
            <NavDivider key={`sep-${i}`} collapsed={collapsed} />
          ) : (
            <NavItem key={item.label} item={item} collapsed={collapsed} />
          )
        )}
      </nav>

      {/* Footer with toggle */}
      <div className={`py-4 border-t border-gray-100 ${collapsed ? 'px-2' : 'px-5'}`}>
        <ViewModeToggle collapsed={collapsed} />
      </div>
    </aside>
  )
}

