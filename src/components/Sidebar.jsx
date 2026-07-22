import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useViewMode } from '../contexts/ViewModeContext'
import {
  LayoutDashboard,

  GraduationCap,
  Users,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Target,
  ShieldCheck,
  FileText,
  Building2,
  Map,
  CalendarDays,
  Clock,
  Gauge,
  UserSearch,
  Zap,
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
  // Pulse — high-level roadmap page. Rename history: Quick Focus → Roadmap
  // → Pulse. Same route + same permission key (`quick_focus`) so existing
  // role_permissions rows and any deep links to /quick-focus keep working;
  // only the user-facing label evolved. NOTE: the current "Tasks" menu
  // below was ALSO called "Pulse" earlier in this project's history — the
  // name has just shuffled between the two pages. The QuickFocusPage.jsx
  // filename stayed for git continuity.
  {
    icon: Zap,
    label: 'Pulse',
    permissionKey: 'quick_focus',
    path: '/quick-focus',
  },
  // Tasks menu removed from the sidebar. Left intact for now:
  //   - Route: /tasks still resolves (registered in src/App.jsx).
  //   - Page: src/pages/PulsePage.jsx (renders the project tile board).
  //   - Component: src/components/ProjectStatusBoard.jsx.
  //   - Data: src/lib/projects.js.
  // Nothing links to /tasks anymore — it's an undocumented deep-link path.
  // If we want to delete the code entirely, drop the four files above and
  // remove the /tasks Route from src/App.jsx in one pass.
  // ── Visual break #1: separates the personal-context layer (AI Chat,
  //     Pulse) from the team-learning cluster (Trainings → Resources).
  { separator: true },
  // Trainings is intentionally a LEAF (no submenu). Clicking it lands on the
  // tile-based /trainings dashboard where every training category — Onboarding,
  // Role Clarity, TRS, How To's, Team Fulfillment / Administration / Improvement
  // / Revenue — is its own clickable tile with a progress meter.
  {
    icon: GraduationCap,
    label: 'Training',
    permissionKey: 'library',
    path: '/trainings',
  },
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
  // ── Visual break #2: separates the team-learning cluster (Trainings,
  //     Calendars, Resources) from the people-pipeline cluster (Leads +
  //     Candidates — everyone touching the front of the enrollment / hiring
  //     funnel).
  { separator: true },
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
  // Candidates — placeholder top-level menu for the interview pipeline (no
  // path yet). Lives next to Leads because they're parallel funnels: Leads
  // is families coming in, Candidates is staff coming in. When the page is
  // built, register the route in App.jsx and attach `path: '/candidates'`
  // here. Add a `candidates` entry to NAV_PERMISSIONS if/when you want to
  // gate it (probably Founder + Operator + Director + Hiring Manager).
  {
    icon: UserSearch,
    label: 'Candidates',
  },
  // Facility — daily interactive floor plan for what's happening in every
  // room right now. Different from the Community menu below: this is the
  // live daily view (teachers, kids, per-room incidents, family incidents,
  // eventual Google Sheets submission), while Community is the capacity /
  // ratios reference grid.
  //
  // URL is /facility-map because Community already owns /facility (kept
  // stable across earlier Capacity → Facility → Community renames). If
  // you'd rather flip URLs, we can rename Community to /community and give
  // this menu /facility.
  {
    icon: Map,
    label: 'Facility',
    path: '/facility-map',
  },
  // ── Visual break #3: separates the people-pipeline cluster from the
  //     operations + commercial cluster (Community → Admin).
  { separator: true },
  // Community — room-level capacity dashboard. Renders the tile grid (one
  // per room from src/lib/rooms.js) at /facility; per-room detail lives at
  // /facility/:roomId.
  //
  // Rename history: Capacity → Facility → Community. Each step only the
  // user-facing label changed. The URL stayed /facility across the last
  // rename so we don't churn deep links / bookmarks every time the
  // menu label evolves. If you want the URL flipped to /community too,
  // one word and I'll swap it in App.jsx + the two page files. The
  // CapacityPage.jsx / CapacityRoomPage.jsx filenames stayed for
  // git-history continuity.
  //
  // Earlier: the original Facility menu had a Dashboard + Engagement +
  // Rooms→Lesson Plans tree backed by FacilityDashboardPage /
  // FacilityEngagementPage. Those pages were deleted; the current tile
  // grid (renamed twice now) replaces them.
  {
    icon: Building2,
    label: 'Community',
    path: '/facility',
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
  // Billing, Marketing, and Finance used to be top-level menus with their
  // own permission keys (billing / marketing / finance). They now live as
  // sub-menus under Admin, so access is implicitly gated by the
  // `admin_panel` permission on the parent instead of three separate keys.
  // Nested children (Offers → Giveaways etc. for Marketing, Books for
  // Finance) are preserved so every previously-reachable route still has
  // a nav path. The old billing/marketing/finance keys were dropped from
  // NAV_PERMISSIONS — no code referenced them.
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
        label: 'Billing',
        children: [
          { label: 'Dashboard', path: '/billing' },
          { label: 'Invoices' },
          { label: 'Payments' },
          { label: 'Plans' },
        ],
      },
      {
        label: 'Marketing',
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
        label: 'Finance',
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
    (item.label === 'Training' &&
      (location.pathname.startsWith('/trainings') || location.pathname.startsWith('/dashboard/'))) ||
    (item.label === 'Targets & Tasks' && location.pathname.startsWith('/targets')) ||
    (item.label === 'Admin' &&
      (location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff/'))) ||
    (item.label === 'Pulse' && location.pathname === '/quick-focus') ||
    (item.label === 'Handbooks' && location.pathname === '/handbooks') ||
    (item.label === 'Applications' && location.pathname === '/applications') ||
    (item.label === 'Marketing' && location.pathname.startsWith('/marketing')) ||
    (item.label === 'Leads' && location.pathname.startsWith('/leads')) ||
    // Community matches /facility exactly and /facility/:roomId, but NOT
    // /facility-map (that's the separate Facility menu). The trailing slash
    // on the startsWith check is what excludes /facility-map.
    (item.label === 'Community' &&
      (location.pathname === '/facility' || location.pathname.startsWith('/facility/'))) ||
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

