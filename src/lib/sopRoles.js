/**
 * Single source of truth for who can curate (create / edit / review) SOPs.
 *
 * The DB-side truth lives in the `is_sop_writer()` helper function + RLS
 * policies on `sops` / `sop_versions` / `sop_submissions`. This module must
 * stay in lockstep with that helper so the UI gates match server enforcement.
 *
 * Why only these three roles:
 *   - founder  — top-level owner of the operation
 *   - operator — multi-site owner/operator tier
 *   - director — the on-site operational lead who actually writes SOPs
 *
 * Everything else (teachers, kitchen, front desk, bus driver, etc.) is a
 * consumer: they read live SOPs and can file suggestions through the
 * submission queue, but they can't publish.
 */

export const SOP_CURATOR_ROLES = Object.freeze([
  'founder',
  'operator',
  'director',
])

/**
 * Decide whether a given staff row can curate SOPs.
 *
 * IMPORTANT: lowercase-normalize because there's at least one 'Founder'
 * (capitalized) row in the production DB. `useAuth().hasPermission` already
 * does this — we do the same here to stay consistent.
 *
 * @param {{ role?: string | null } | null | undefined} staff
 * @returns {boolean}
 */
export function canCurateSops(staff) {
  const role = staff?.role?.toLowerCase?.()
  if (!role) return false
  return SOP_CURATOR_ROLES.includes(role)
}
