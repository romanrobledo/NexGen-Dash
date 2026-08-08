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
 * As of 2026-08-08 every tab gates on a `nav_*` permission key that
 * exists in `src/lib/navItems.js` and is seeded in `role_permissions`.
 * Under the CLOSED hasPermission default, a tab is hidden when the
 * user's role doesn't have that key.
 *
 * MVP scope note: the four tabs below are admin-shaped — Teachers /
 * Support currently see only the Training tab under this filter.
 * That's a design conversation, not a bug in this refactor. When
 * you're ready, expand MOBILE_TABS with items that make sense for
 * classroom / support workflows (Facility is universal, Compliance
 * is granted to those roles, etc.).
 */

// The four tabs. Each references a nav_* permission key from
// src/lib/navItems.js so the mobile bar and the sidebar stay in
// lockstep — one source of truth for role visibility.
const MOBILE_TABS = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
    // S.A.N.D. lives inside the Admin sub-menu in the sidebar; the
    // mobile Dashboard tab points at the same route (/). No standalone
    // nav_sand key yet — see the "Admin — S.A.N.D. scoping" comment in
    // src/lib/navItems.js if that's ever needed.
    permissionKey: 'nav_admin',
    // Exact-match only for the root — we don't want every page to
    // light up the Dashboard tab.
    exact: true,
  },
  {
    label: 'Training',
    icon: GraduationCap,
    path: '/trainings',
    permissionKey: 'nav_training',
    // Trainings lights up on every /trainings/* page AND on Roles
    // pages (they live under /dashboard/) to match the sidebar's
    // nested-active rule.
    matchPrefix: ['/trainings', '/dashboard/'],
  },
  {
    label: 'AI Chat',
    icon: BotMessageSquare,
    path: '/ai-chat',
    permissionKey: 'nav_ai_chat',
    matchPrefix: ['/ai-chat'],
  },
  {
    label: 'Admin',
    icon: ShieldCheck,
    path: '/admin',
    permissionKey: 'nav_admin',
    matchPrefix: ['/admin', '/staff/'],
  },
]

export default function MobileBottomNav() {
  const { staff, hasPermission } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Filter tabs the same way Sidebar filters top-level items:
  //   - Universal (no permissionKey) → always shown. None of the current
  //     tabs are universal, but the check is here so future universal
  //     tabs (e.g., Facility) can slot in without special-casing.
  //   - No staff loaded yet → show everything (avoids empty-bar flash
  //     during initial auth hydration).
  //   - Otherwise → gate on hasPermission(key).
  const items = MOBILE_TABS.filter((tab) => {
    if (!tab.permissionKey) return true
    if (!staff) return true
    return hasPermission(tab.permissionKey)
  })

  // Guard: don't render the bar at all if the user's role has zero
  // visible tabs. Better a missing bar than an empty one.
  if (items.length === 0) return null

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

// ─── Active matcher ─────────────────────────────────────────────────────────

function isActive(pathname, item) {
  if (item.exact) return pathname === item.path
  if (pathname === item.path) return true
  if (item.matchPrefix) {
    return item.matchPrefix.some((p) => pathname === p || pathname.startsWith(p))
  }
  return pathname.startsWith(item.path + '/')
}
