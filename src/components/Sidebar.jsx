import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useViewMode } from '../contexts/ViewModeContext'
import {
  LayoutDashboard,

  GraduationCap,
  Users,
  Baby,
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
  Bot,
  BookOpen,
  Network,
  Megaphone,
  DollarSign,
  ClipboardCheck,
} from 'lucide-react'

// Each top-level item has a permissionKey that maps to role_permissions.
// Items WITHOUT a permissionKey are visible to everyone (universal access).
//
// Structural restructure on 2026-08-07:
//   - Top block: Facility / Students / Staff / Families
//   - Learning cluster: AI Chat → Resources, Compliance nested here
//   - People pipeline: Leads / Candidates / Marketing
//   - Operations: Projects / Meetings / Admin (Admin now absorbs S.A.N.D.,
//     Officers, and Finance as children — one place for everything the
//     Founder/Operator lives in).
const navItems = [
  // ── Top block ────────────────────────────────────────────────────────────
  // Facility / Students / Staff / Families — daily-operations anchors.
  // Students + Staff are shortcuts to pages that ALSO exist inside deeper
  // menus (Families → Students). Two entry points to one page is fine;
  // two different pages both called Students is not.
  {
    icon: Map,
    label: 'Facility',
    path: '/facility-map',
  },
  {
    icon: Baby,
    label: 'Students',
    permissionKey: 'families',
    path: '/roster',
  },
  {
    icon: Users,
    label: 'Staff',
    permissionKey: 'admin_panel',
    path: '/staff/profile-database',
  },
  // Families — parent menu with Guardians / Students / Paperwork.
  // Sits at the top with the other "who" anchors, right under Staff.
  {
    icon: Users,
    label: 'Families',
    permissionKey: 'families',
    children: [
      { label: 'Guardians' },
      { label: 'Students', path: '/roster' },
      { label: 'Paperwork' },
    ],
  },
  // ── Visual break #1: top block → learning + focus cluster.
  { separator: true },

  // ── Learning + focus cluster ─────────────────────────────────────────────
  // AI Chat / Pulse / Training / Calendars / Org Chart / SOP Library /
  // Compliance / Resources.
  //
  // Tasks menu — historical note: removed from the sidebar in an earlier
  // session. Legacy artifacts left intact:
  //   - Route /tasks still resolves (in src/App.jsx)
  //   - Page src/pages/PulsePage.jsx (project tile board)
  //   - Component src/components/ProjectStatusBoard.jsx
  //   - Data src/lib/projects.js
  {
    icon: BotMessageSquare,
    label: 'AI Chat',
    path: '/ai-chat',
  },
  // Pulse — high-level roadmap page. Same route + same permission key
  // (quick_focus). QuickFocusPage.jsx filename kept for git continuity.
  {
    icon: Zap,
    label: 'Pulse',
    permissionKey: 'quick_focus',
    path: '/quick-focus',
  },
  // Training is a LEAF — /trainings dashboard shows every training
  // category as its own tile.
  {
    icon: GraduationCap,
    label: 'Training',
    permissionKey: 'library',
    path: '/trainings',
  },
  // Calendars — sub-calendars (Google Calendar Sync / School / Staff /
  // Events) are tabs INSIDE /calendar, not submenu entries.
  {
    icon: CalendarDays,
    label: 'Calendars',
    path: '/calendar',
  },
  // Org Chart — single-leaf menu.
  {
    icon: Network,
    label: 'Org Chart',
    permissionKey: 'training_role_clarity',
    path: '/org-chart',
  },
  // SOP Library — promoted from a nested Resources child to a top-level
  // menu. Inherits the `resources` permission key.
  {
    icon: BookOpen,
    label: 'SOP Library',
    permissionKey: 'resources',
    path: '/sop-library',
  },
  // Compliance — moved into the learning cluster right below SOP Library.
  // Same "is our house in order" job as the reference material lives with,
  // so it fits with SOP Library thematically. Absorbs Data Integrity as a
  // child (both previously sibling leaves under Admin).
  {
    icon: ClipboardCheck,
    label: 'Compliance',
    permissionKey: 'admin_panel',
    children: [
      { label: 'Overview', path: '/admin/performance-compliance' },
      { label: 'Data Integrity', path: '/admin/data-integrity' },
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
    ],
  },
  // ── Visual break #2: learning cluster → people-pipeline cluster.
  { separator: true },

  // ── People-pipeline cluster ──────────────────────────────────────────────
  // Leads / Candidates / Marketing — everyone touching the front of the
  // enrollment, hiring, or acquisition funnel. Families moved out to the
  // top block (they're already enrolled).
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
  // Candidates — hiring twin of Leads. Same three-page shape.
  {
    icon: UserSearch,
    label: 'Candidates',
    children: [
      { label: 'Dashboard', path: '/candidates' },
      { label: 'Interviews', path: '/candidates/interviews' },
      { label: 'Procedures', path: '/candidates/procedures' },
    ],
  },
  // Advertising — renamed from Marketing (label only). Routes stay under
  // /marketing/* so bookmarks, deep links, permission key, and every
  // sub-page filename are unchanged. Sits in the pipeline cluster right
  // below Candidates.
  {
    icon: Megaphone,
    label: 'Advertising',
    permissionKey: 'admin_panel',
    children: [
      { label: 'Dashboard', path: '/marketing' },
      { label: 'Shot Lists', path: '/marketing/shot-lists' },
      { label: 'Upload', path: '/marketing/upload' },
      { label: 'Campaigns', path: '/calendars/content' },
      { label: 'Events', path: '/marketing/events' },
      { label: 'Calendar', path: '/marketing/calendar' },
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
  // ── Visual break #3: pipeline → operations cluster.
  { separator: true },

  // ── Operations cluster ───────────────────────────────────────────────────
  // Projects / Meetings / Admin. Admin now absorbs S.A.N.D., Officers, and
  // Finance as children — one place for everything the Founder/Operator
  // lives in.
  //
  // Projects — routes (/targets, /targets/progress, /targets/tasks)
  // unchanged so deep links + page filenames still work.
  {
    icon: Target,
    label: 'Projects',
    permissionKey: 'admin_panel',
    children: [
      { label: 'Dashboard', path: '/targets' },
      { label: 'Targets', path: '/targets/progress' },
      { label: 'Tasks', path: '/targets/tasks' },
    ],
  },
  // Meetings — parent with two children:
  //   Structure — "The Rhythm" (teams / cadence / agenda / outcomes).
  //     Route stays /admin/meetings so bookmarks + AdminMeetingsPage
  //     filename are unchanged.
  //   Calendar — placeholder, no path yet.
  {
    icon: Users,
    label: 'Meetings',
    permissionKey: 'admin_panel',
    children: [
      { label: 'Structure', path: '/admin/meetings' },
      { label: 'Calendar' },
    ],
  },
  // Staff Management — lifted out of Admin to a top-level menu on
  // 2026-08-07. Sits directly above Admin so the two settings clusters
  // remain visually adjacent. Same permission key (admin_panel) so
  // access rules don't change; only position moves.
  {
    icon: Users,
    label: 'Staff Management',
    permissionKey: 'admin_panel',
    children: [
      { label: 'Accounts', path: '/admin' },
      { label: 'Submissions', path: '/staff/responses' },
      { label: 'Permissions', path: '/admin/permissions' },
    ],
  },
  // Admin — top-level container that now holds S.A.N.D., Platform
  // Settings, Officers, and Finance. Staff Management moved out to a
  // top-level menu above (see block just above). Order inside Admin:
  //   1. S.A.N.D. — highest-frequency dashboard
  //   2. Platform Settings — theme, integrations, webhooks
  //   3. Officers — AI agent feeds (Paperclip pipeline)
  //   4. Finance — money flows (billing + books)
  {
    icon: ShieldCheck,
    label: 'Admin',
    permissionKey: 'admin_panel',
    children: [
      // S.A.N.D. — Sleep At Night Dashboard. Path is '/' because it's
      // the app landing page. Top of Admin so it's the first thing you
      // see when you open the menu.
      { label: 'S.A.N.D.', path: '/' },
      {
        label: 'Platform Settings',
        children: [
          { label: 'Theme & Appearance', path: '/admin/settings/theme' },
          { label: 'Integrations', path: '/admin/settings/integrations' },
          { label: 'Webhooks', path: '/admin/settings/webhooks' },
        ],
      },
      // Officers — 10 Paperclip agent feeds. Order matches Paperclip's
      // canonical hierarchy: CEO, Junior COO, then eight officers
      // alphabetically. Officer keys MUST match Paperclip agent ids.
      {
        label: 'Officers',
        children: [
          { label: 'CEO',                 path: '/officers/ceo' },
          { label: 'Junior COO',          path: '/officers/junior-coo' },
          { label: 'Detail Officer',      path: '/officers/detail' },
          { label: 'Fulfillment Officer', path: '/officers/fulfillment' },
          { label: 'Improvement Officer', path: '/officers/improvement' },
          { label: 'Legal Officer',       path: '/officers/legal' },
          { label: 'Response Officer',    path: '/officers/response' },
          { label: 'Revenue Officer',     path: '/officers/revenue' },
          { label: 'Teams Officer',       path: '/officers/teams' },
          { label: 'Tech Officer',        path: '/officers/tech' },
        ],
      },
      // Finance — Dashboard, Billing (money out), Books (money in +
      // tracking). Books surface built 2026-08-07.
      {
        label: 'Finance',
        children: [
          { label: 'Dashboard', path: '/finance' },
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
            label: 'Books',
            children: [
              { label: 'Accounts',     path: '/finance/books/accounts' },
              { label: 'Transactions', path: '/finance/books/transactions' },
              { label: 'Reports',      path: '/finance/books/reports' },
            ],
          },
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
  // For nested menus: also highlight when on nested routes.
  // Training's nested check excludes /trainings/role-clarity because that
  // page now lives under the Org Chart menu — Training should NOT light up
  // while a user is on any Role Clarity or Org Chart page.
  const isNestedActive =
    (item.label === 'Training' &&
      ((location.pathname.startsWith('/trainings') &&
        !location.pathname.startsWith('/trainings/role-clarity')) ||
       location.pathname.startsWith('/dashboard/'))) ||
    (item.label === 'Org Chart' &&
      (location.pathname.startsWith('/org-chart') ||
       location.pathname.startsWith('/trainings/role-clarity') ||
       location.pathname.startsWith('/dashboard/'))) ||
    (item.label === 'Projects' && location.pathname.startsWith('/targets')) ||
    // Admin owns most /admin/* routes EXCEPT the ones that got lifted into
    // top-level menus (Meetings, Compliance). Without those exclusions,
    // Admin would light up simultaneously with Meetings on /admin/meetings
    // or with Compliance on /admin/data-integrity — both would look active.
    (item.label === 'Admin' &&
      ((location.pathname.startsWith('/admin') &&
        !location.pathname.startsWith('/admin/meetings') &&
        !location.pathname.startsWith('/admin/data-integrity') &&
        !location.pathname.startsWith('/admin/performance-compliance')) ||
       location.pathname.startsWith('/staff/'))) ||
    (item.label === 'Compliance' &&
      (location.pathname.startsWith('/admin/performance-compliance') ||
       location.pathname.startsWith('/admin/data-integrity'))) ||
    (item.label === 'Finance' && location.pathname.startsWith('/finance')) ||
    (item.label === 'Pulse' && location.pathname === '/quick-focus') ||
    (item.label === 'Handbooks' && location.pathname === '/handbooks') ||
    (item.label === 'Applications' && location.pathname === '/applications') ||
    (item.label === 'Marketing' && location.pathname.startsWith('/marketing')) ||
    (item.label === 'Leads' && location.pathname.startsWith('/leads')) ||
    (item.label === 'Candidates' && location.pathname.startsWith('/candidates')) ||
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
                <NavItem key={`nav-${i}-${item.label}`} item={item} collapsed={false} />
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
            <NavItem key={`nav-${i}-${item.label}`} item={item} collapsed={collapsed} />
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

