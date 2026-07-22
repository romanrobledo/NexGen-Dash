import { useLocation, useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  BotMessageSquare,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

/**
 * MobileBottomNav — iOS/Android-style tab bar fixed to the bottom edge.
 * Rendered only when mobileMode is true (see AppShell in App.jsx).
 *
 * Base tabs (every authenticated user):
 *   Trainings · AI Chat
 *
 * Admin-tier tabs (Founder, or anyone with admin_panel permission):
 *   Dashboard · Trainings · AI Chat · Admin
 *
 * To add a new permission-gated tab, add an entry to `buildNavItems` below.
 * Each entry supports an optional `matchPrefix` array for highlighting the
 * tab on nested routes (e.g., Admin lights up on anything under /admin or
 * /staff/).
 */
export default function MobileBottomNav() {
  const { staff, hasPermission } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const items = buildNavItems({ staff, hasPermission })

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-1px_6px_rgba(0,0,0,0.04)] z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Bottom navigation"
    >
      <div className="flex items-stretch justify-around">
        {items.map((item) => {
          const active = isActive(location.pathname, item)
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-1 transition-colors ${
                active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600 active:text-gray-700'
              }`}
              title={item.label}
            >
              {/* Active pill indicator at top edge of the button */}
              <span
                className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-b-full transition-all ${
                  active ? 'w-8 bg-blue-600' : 'w-0 bg-transparent'
                }`}
                aria-hidden="true"
              />
              <Icon className={`w-5 h-5 ${active ? 'scale-105' : ''} transition-transform`} />
              <span className="text-[10px] font-semibold leading-tight truncate max-w-full">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// ─── Nav item factory ───────────────────────────────────────────────────────

function buildNavItems({ staff, hasPermission }) {
  // Admin-tier = Founder role (short-circuits everything) OR any user with
  // admin_panel permission enabled. Matches how Sidebar.jsx gates the Admin
  // section, so the bottom bar stays consistent with the full sidebar.
  const isAdminTier =
    staff?.role?.toLowerCase?.() === 'founder' ||
    (hasPermission && hasPermission('admin_panel'))

  // Base tabs — shown to every authenticated user.
  //
  // "Clock in / out" used to live here; it was removed alongside the sidebar
  // entry and TopToolbar buttons when the platform got refocused around
  // training. Leaving the matchPrefix arrays exactly as they were so the
  // remaining tabs still highlight correctly on nested routes.
  const BASE = [
    {
      label: 'Training',
      icon: GraduationCap,
      path: '/trainings',
      // Trainings lights up on every /trainings/* page AND on the Roles pages
      // (they live under /dashboard/) to match the sidebar's nested-active rule.
      matchPrefix: ['/trainings', '/dashboard/'],
    },
    {
      label: 'AI Chat',
      icon: BotMessageSquare,
      path: '/ai-chat',
      matchPrefix: ['/ai-chat'],
    },
  ]

  if (isAdminTier) {
    return [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/',
        // Exact-match only for the root — we don't want every page to light up
        // the Dashboard tab.
        exact: true,
      },
      ...BASE,
      {
        label: 'Admin',
        icon: ShieldCheck,
        // Used to default to /admin/team-pulse; that page was removed with
        // the rest of the time-clock subsystem. Point at /admin (Staff
        // Accounts) instead — the most generally-useful admin landing.
        path: '/admin',
        matchPrefix: ['/admin', '/staff/'],
      },
    ]
  }

  return BASE
}

// ─── Active matcher ─────────────────────────────────────────────────────────
function isActive(pathname, item) {
  if (item.exact) return pathname === item.path
  if (pathname === item.path) return true
  if (item.matchPrefix) {
    return item.matchPrefix.some((p) => pathname === p || pathname.startsWith(p))
  }
  // Fallback: treat path as a prefix
  return pathname.startsWith(item.path + '/')
}
