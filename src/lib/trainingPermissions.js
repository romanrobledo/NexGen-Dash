// Per-category training access toggles.
//
// These keys live ALONGSIDE the main NAV_PERMISSIONS (one key per top-level
// sidebar item) — not as columns in the main matrix. The Admin → Permissions
// page surfaces them behind a gear icon in each role's "TRAININGS" cell, so
// the main matrix stays a clean 11-column overview while the per-category
// fine-tuning happens in a focused modal.
//
// Permission semantics (see `useAuth().hasPermission` in AuthContext):
//   - Default OPEN. If `role_permissions` has no explicit row for a training_*
//     key, the user sees the tile. This preserves current behavior for every
//     existing role on first deploy — nobody loses access until an admin
//     explicitly toggles a category off.
//   - Founder always sees everything (case-insensitive role match).
//   - Sidebar-level access is still strictly gated by the `library` key.
//     If `library` is OFF for a role, none of these per-category keys matter
//     — the entire Trainings menu is hidden.
//
// `key` values match the order of categories on TrainingsDashboardPage so the
// modal toggles read in the same sequence as the tiles.

export const TRAINING_PERMISSIONS = [
  { key: 'training_onboarding',            label: 'Onboarding' },
  { key: 'training_role_clarity',          label: 'Role Clarity' },
  { key: 'training_trs',                   label: 'TRS' },
  { key: 'training_howtos',                label: "How To's" },
  { key: 'training_team_fulfillment',      label: 'Team Fulfillment' },
  { key: 'training_team_administration',   label: 'Team Administration' },
  { key: 'training_team_improvement',      label: 'Team Improvement' },
  { key: 'training_team_revenue',          label: 'Team Revenue' },
]

/** Prefix used to detect training keys in hasPermission's default-open branch. */
export const TRAINING_PERMISSION_PREFIX = 'training_'
