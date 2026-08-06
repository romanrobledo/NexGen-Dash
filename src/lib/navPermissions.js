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
//
// KEYS THAT PREDATE THE CURRENT PLATFORM — kept because renaming them
// would invalidate existing `role_permissions` rows in Supabase:
//   `quick_focus`  → Pulse           (was Quick Focus → Roadmap → Pulse)
//   `library`      → Training        (was Training Library)
//   `admin_panel`  → Admin cluster   (also gates S.A.N.D., Meetings, Projects,
//                                     Marketing, Finance, Compliance today)
//
// KEYS WITHOUT COLUMNS (menus are universal — no permission gate):
//   AI Chat, Calendars, Candidates, Facility, S.A.N.D., Meetings
// Attach a `permissionKey` on the Sidebar item AND add an entry here to
// gate any of them.
//
// LEGACY ROW CLEANUP: these permission_key values no longer correspond
// to any UI; the rows can be dropped from Supabase whenever convenient:
//   `time_clock` (payroll subsystem retired)
//   `facility` (menu deleted, permission left orphaned)
//   `billing` / `marketing` / `finance` (folded into admin_panel earlier;
//   marketing and finance now top-level again but still gated by
//   admin_panel — see comment above)
export const NAV_PERMISSIONS = [
  { key: 'quick_focus',           label: 'Pulse'      },
  { key: 'library',               label: 'Training'   },
  // Org Chart — gates the org tree + drawer + Compass content.
  // Key already used by Sidebar's Org Chart entry.
  { key: 'training_role_clarity', label: 'Org Chart'  },
  // Resources — covers both the top-level SOP Library entry and the
  // Resources submenu (Handbooks / Applications / TRS). Same key on both.
  { key: 'resources',             label: 'Resources'  },
  { key: 'leads',                 label: 'Leads'      },
  { key: 'families',              label: 'Families'   },
  // Admin — currently gates the entire admin cluster: Admin submenu,
  // plus the top-level S.A.N.D. / Meetings / Projects / Marketing /
  // Finance / Compliance menus. Splitting these into per-menu keys
  // (`marketing`, `finance`, etc.) is a follow-up when we want finer
  // control; today one toggle grants all admin surfaces.
  { key: 'admin_panel',           label: 'Admin'      },
]
