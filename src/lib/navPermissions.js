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

export const NAV_PERMISSIONS = [
  { key: 'quick_focus', label: 'Quick Focus' },
  // `time_clock` removed when the time-clock/payroll subsystem was retired.
  // Existing role_permissions rows with permission_key='time_clock' are
  // harmless — they just no longer correspond to any UI.
  { key: 'facility',    label: 'Facility'    },
  { key: 'leads',       label: 'Leads'       },
  { key: 'families',    label: 'Families'    },
  { key: 'library',     label: 'Trainings'   }, // legacy key name kept so existing role_permissions rows survive
  { key: 'resources',   label: 'Resources'   },
  { key: 'billing',     label: 'Billing'     },
  { key: 'marketing',   label: 'Marketing'   },
  { key: 'finance',     label: 'Finance'     },
  { key: 'admin_panel', label: 'Admin'       },
]
