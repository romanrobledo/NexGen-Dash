/**
 * Role constants for the app's back-office access model.
 *
 * The list below IS the source of truth for what counts as "admin
 * tier" in the app. Anything that gates on admin-tier access — route
 * guards, StaffCertificationPanel, mobile bottom nav Dashboard/Admin
 * tabs — imports this constant rather than typing the list at each
 * call site. One place to change when a role is added.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SYNCED WITH: public.current_staff_is_books_admin() in Supabase.
 *
 * The SQL function reads:
 *   SELECT EXISTS (
 *     SELECT 1 FROM public.staff s
 *     WHERE s.auth_user_id = auth.uid()
 *       AND s.role IN ('Founder','Operator','Co-Integrator')
 *   );
 *
 * If a role is added or removed HERE, update the SQL function in the
 * SAME commit. Otherwise route guards and RLS will disagree, causing
 * menu items that appear but 500 on click (or worse — items that
 * pass the UI check but fail the DB check silently).
 * ═══════════════════════════════════════════════════════════════════
 */
export const BOOKS_ADMIN_ROLES = ['Founder', 'Operator', 'Co-Integrator']

/**
 * True when the given staff row's role is in the admin-tier set.
 * Case-sensitive by design — staff.role is free text and admin
 * shouldn't get bypassed by a typo like 'founder' vs 'Founder'.
 *
 * @param {{ role?: string } | null | undefined} staff
 * @returns {boolean}
 */
export function isBooksAdmin(staff) {
  return !!staff?.role && BOOKS_ADMIN_ROLES.includes(staff.role)
}
