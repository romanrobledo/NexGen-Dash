// Single source of truth for top-level sidebar menus and their permission keys.
//
// - Sidebar uses `key` as each top-level nav item's `permissionKey`, which
//   gates menu visibility via `hasPermission(key)`.
// - The Admin → Permissions page renders one toggle column per entry here.
//
// To add a new top-level menu to the dashboard:
//   1) add an entry here
//   2) set `permissionKey: '<key>'` on the matching Sidebar navItem
//   Both sides then stay in lockstep automatically.

// Column order here matches sidebar order top-to-bottom so admins can scan
// down a role's row and read access in the same sequence as the menu.
export const NAV_PERMISSIONS = [
  // Key stays `quick_focus` — the user-facing label has evolved through
  // Quick Focus → Roadmap → Pulse. Renaming the key would invalidate
  // every existing role_permissions row, so it stays stable.
  { key: 'quick_focus', label: 'Pulse'       },
  // `time_clock` removed when the time-clock/payroll subsystem was retired.
  // Existing role_permissions rows with permission_key='time_clock' are
  // harmless — they just no longer correspond to any UI.
  { key: 'library',     label: 'Trainings'   }, // legacy key name kept so existing role_permissions rows survive
  { key: 'leads',       label: 'Leads'       },
  // `calendars` doesn't have a permission gate yet — Calendars is universal.
  // Add `{ key: 'calendars', label: 'Calendars' }` here AND attach the same
  // key to the Sidebar item when you want to gate it.
  { key: 'resources',   label: 'Resources'   },
  // `facility` removed when the Facility menu + pages were deleted (its
  // per-room responsibilities moved under /capacity). Existing
  // role_permissions rows with permission_key='facility' are harmless —
  // they just no longer correspond to any UI.
  { key: 'families',    label: 'Families'    },
  // `capacity` will be added once the page is built and gated. Universal
  // for now (no permissionKey on the Sidebar item).
  //
  // `billing`, `marketing`, and `finance` were removed when those menus
  // moved from top-level to sub-items under Admin. Access is now gated by
  // the parent `admin_panel` permission — three separate keys weren't
  // needed anymore. No code references them; existing role_permissions
  // rows with those keys are harmless and can be cleaned up in Supabase
  // whenever convenient.
  { key: 'admin_panel', label: 'Admin'       },
]
