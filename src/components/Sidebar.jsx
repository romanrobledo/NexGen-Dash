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
const navItems = [
  // Top block — Facility / Students / Staff. The three daily-operations
  // anchors sit together at the top so they're one click from anywhere.
  //
  // Students + Staff are shortcuts to pages that ALSO exist inside deeper
  // menus (Families → Students, Org Chart route context). Duplication is
  // intentional: two entry points to one page is fine; two different
  // pages both called Students is not.
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
  // ── Visual break #1: separates the daily-operations anchor
  //     (Facility/Students/Staff) from the learning + focus cluster
  //     (AI Chat, Pulse, Training → Resources).
  { separator: true },
  // AI Chat + Pulse — moved into the learning/focus cluster on 2026-08-07
  // (were above the top separator). They belong with Training and
  // Resources thematically: AI Chat is knowledge-seeking, Pulse is
  // roadmap/focus. Routes + permission keys unchanged, so nothing else
  // needs updating.
  //
  // Tasks menu — historical note: a "Tasks" menu was removed from the
  // sidebar in an earlier session. Legacy artifacts left intact:
  //   - Route: /tasks still resolves (registered in src/App.jsx).
  //   - Page: src/pages/PulsePage.jsx (project tile board).
  //   - Component: src/components/ProjectStatusBoard.jsx.
  //   - Data: src/lib/projects.js.
  // Nothing links to /tasks anymore. If we want to delete the code
  // entirely, drop the four files above and remove the /tasks Route.
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
  // referenced above was ALSO called "Pulse" earlier in this project's
  // history — the name has just shuffled between the two pages. The
  // QuickFocusPage.jsx filename stayed for git continuity.
  {
    icon: Zap,
    label: 'Pulse',
    permissionKey: 'quick_focus',
    path: '/quick-focus',
  },
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
  // Calendars — singular menu, no submenus. Sub-calendars (Google Calendar
  // Sync / School / Staff / Events) live INSIDE the /calendar page as
  // left-column tabs. Route stayed /calendar across rename → rename → rename
  // to avoid churning any bookmarks; only the visible label evolves.
  {
    icon: CalendarDays,
    label: 'Calendars',
    path: '/calendar',
  },
  // Org Chart — single-leaf menu. Landing is the role selector (Who Am I)
  // and each role opens a combined page with What Do I Do / How Do I Do It /
  // When Do I Do It / Why Is It Important / How Do I Know I Am Doing A Good
  // Job stacked as scroll sections. No sub-menus.
  {
    icon: Network,
    label: 'Org Chart',
    permissionKey: 'training_role_clarity',
    path: '/org-chart',
  },
  // SOP Library — promoted from a nested Resources child to a top-level
  // menu. Inherits the `resources` permission key so existing access rules
  // don't change; only its position in the sidebar moves.
  {
    icon: BookOpen,
    label: 'SOP Library',
    permissionKey: 'resources',
    path: '/sop-library',
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
  // ── Visual break #2: separates the learning + focus cluster (AI Chat,
  //     Pulse, Training, Calendars, Org Chart, SOP Library, Resources)
  //     from the people-pipeline cluster (Leads + Candidates — everyone
  //     touching the front of the enrollment / hiring funnel).
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
  // Candidates — the hiring twin of Leads. Same three-page shape
  // (Dashboard / Interviews / Procedures) so anyone who knows the Leads
  // section already knows this one. Shares `useCandidatesData` across
  // the three pages so counts stay aligned. No permission key yet;
  // add a `candidates` entry to NAV_PERMISSIONS when you want to gate
  // it (probably Founder + Operator + Director + Hiring Manager).
  {
    icon: UserSearch,
    label: 'Candidates',
    children: [
      { label: 'Dashboard', path: '/candidates' },
      { label: 'Interviews', path: '/candidates/interviews' },
      { label: 'Procedures', path: '/candidates/procedures' },
    ],
  },
  // Families — moved up out of the ops/commercial block so it lives next to
  // its people-pipeline peers (Leads for prospective families, Candidates
  // for staff, Families for enrolled). Placement above Facility keeps the
  // "who" cluster together before the "where" cluster starts.
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
  // ── Visual break #3: separates the people-pipeline cluster from the
  //     operations + commercial cluster.
  //     (Facility used to sit above this break — it was lifted to the
  //     very top of the sidebar on 2026-08-07 so the daily-ops anchor is
  //     one click away instead of scrolled past.)
  { separator: true },
  // Community menu removed — its content (per-room capacity + child-to-
  // teacher ratios) moved behind a "TRS Ratio" button on the Facility page
  // header. Route /facility still resolves to CapacityPage.jsx so any
  // in-app links from that button don't 404.
  //
  // Families moved up next to Leads / Candidates (see block above). What
  // remains here is the operations + commercial cluster. Admin is now a
  // slimmer container; Targets & Tasks / Marketing / Finance / Compliance
  // each got lifted out to their own top-level menus so they're one click
  // deep instead of two. Every lifted menu inherits the `admin_panel`
  // permission key so access rules don't change.
  // S.A.N.D. — lifted out of Admin. The Sleep At Night Dashboard is the
  // most-visited surface in the app; one click deep beats two. Same
  // admin_panel permission gate so access rules don't change.
  {
    icon: LayoutDashboard,
    label: 'S.A.N.D.',
    permissionKey: 'admin_panel',
    path: '/',
  },
  // Meetings — lifted out of Admin. Holds "The Rhythm" (teams / cadence /
  // meeting agenda / outcomes) that used to live on the Pulse page.
  // Route stays /admin/meetings so bookmarks + Admin's isNestedActive
  // check still resolve correctly.
  {
    icon: Users,
    label: 'Meetings',
    permissionKey: 'admin_panel',
    path: '/admin/meetings',
  },
  {
    icon: ShieldCheck,
    label: 'Admin',
    permissionKey: 'admin_panel',
    children: [
      {
        label: 'Staff Management',
        children: [
          { label: 'Accounts', path: '/admin' },
          { label: 'Submissions', path: '/staff/responses' },
          { label: 'Permissions', path: '/admin/permissions' },
        ],
      },
      // Billing moved out to Finance — it's a money-flow concern, not a
      // staff-management one, so it belongs alongside Books under Finance.
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
  // Officers — Paperclip agent feeds. Each of the 10 Paperclip agents has
  // its own scoped page here and its own /webhook/nexgen-officer-<key>
  // path. n8n POSTs briefings straight into public.officer_briefings
  // (multi-tenant via the `entity` column, default 'nexgen') and the
  // OfficerPage reads its scope live.
  //
  // Order below matches Paperclip's canonical hierarchy: CEO first,
  // Junior COO second (their direct executor), then the eight officers
  // alphabetically. Officer keys MUST match Paperclip agent ids exactly.
  {
    icon: Bot,
    label: 'Officers',
    permissionKey: 'admin_panel',
    children: [
      { label: 'CEO',                  path: '/officers/ceo' },
      { label: 'Junior COO',           path: '/officers/junior-coo' },
      { label: 'Detail Officer',       path: '/officers/detail' },
      { label: 'Fulfillment Officer',  path: '/officers/fulfillment' },
      { label: 'Improvement Officer',  path: '/officers/improvement' },
      { label: 'Legal Officer',        path: '/officers/legal' },
      { label: 'Response Officer',     path: '/officers/response' },
      { label: 'Revenue Officer',      path: '/officers/revenue' },
      { label: 'Teams Officer',        path: '/officers/teams' },
      { label: 'Tech Officer',         path: '/officers/tech' },
    ],
  },
  // Projects — renamed from "Targets & Tasks". Menu label only; underlying
  // routes (/targets, /targets/progress, /targets/tasks) unchanged so deep
  // links, permission key (admin_panel), and page filenames all still work.
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
  // Marketing — lifted out of Admin. Full offer tree preserved so no
  // previously-reachable page becomes a dead link.
  {
    icon: Megaphone,
    label: 'Marketing',
    permissionKey: 'admin_panel',
    children: [
      { label: 'Dashboard', path: '/marketing' },
      // Shot Lists — dedicated hub for content creators. Unifies the
      // campaign shot list AND the event shot list into one queue so
      // creators check one page in the morning instead of two. Each
      // shot can be checked off as it's captured.
      { label: 'Shot Lists', path: '/marketing/shot-lists' },
      // Upload — landing pad for creators to drop photos and videos
      // after a shoot. Routes to Google Drive (and any other targets)
      // via an n8n webhook so we don't have to build storage ourselves.
      { label: 'Upload', path: '/marketing/upload' },
      // Renamed from "Content Calendar" — this menu is the Campaigns
      // workspace. Shot lists moved to their own submenu above.
      { label: 'Campaigns', path: '/calendars/content' },
      // Events — preview of the fixed-dates calendar, scoped to a
      // marketing context. Reads the same calendar_events table as
      // /calendar?tab=events, so it stays in sync bidirectionally.
      { label: 'Events', path: '/marketing/events' },
      // Marketing Calendar — combined month grid showing campaigns AND
      // events on one canvas. Filters: All / Campaigns / Events. Click
      // any tile to open a right-side drawer with focus fields + shot
      // list preview. Events sync with both the Marketing → Events
      // submenu AND the top-level Calendars → Events tab.
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
  // Finance — lifted out of Admin, now also absorbs Billing (previously a
  // sibling under Admin). Billing is money-flowing-out, Books is
  // money-flowing-in/tracking — they're the same domain, so co-locating
  // matches how Directors think about them.
  {
    icon: DollarSign,
    label: 'Finance',
    permissionKey: 'admin_panel',
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
  // Compliance — lifted out of Admin AND absorbs Data Integrity as a
  // child. Both were previously sibling leaves under Admin. Grouping them
  // matches how they're actually used: performance/compliance audits and
  // data-integrity checks are the same "is our house in order" job.
  {
    icon: ClipboardCheck,
    label: 'Compliance',
    permissionKey: 'admin_panel',
    children: [
      { label: 'Overview', path: '/admin/performance-compliance' },
      { label: 'Data Integrity', path: '/admin/data-integrity' },
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

