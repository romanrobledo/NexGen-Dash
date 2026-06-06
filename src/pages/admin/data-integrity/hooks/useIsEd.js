import { useAuth } from '../../../../contexts/AuthContext'

/** Ed Bague's hardcoded staff.id — matches the one baked into is_ed_bague(). */
const ED_STAFF_ID = 'bf23ac5b-add5-464e-b8f6-6efa58c5f2a9'

/**
 * useIsEd — returns true when the current user should see the verify /
 * correct / flag buttons.
 *
 * Mirrors the server-side rule in public.is_ed_bague():
 *   • Ed's specific staff.id (production rule)
 *   • OR any Founder (dev-mode broadening; same as server function)
 *
 * Front-end gating alone isn't a security boundary — RLS on the 9 tables is.
 * This hook just controls which buttons are rendered.
 */
export function useIsEd() {
  const { staff } = useAuth()
  if (!staff) return false
  if (staff.id === ED_STAFF_ID) return true
  if (staff.role?.toLowerCase?.() === 'founder') return true
  return false
}

/**
 * usePageAccess — returns whether the logged-in user can view the page.
 *
 * Spec: "Any user with role Founder, Operator, or Co-Integrator can view."
 * Others get redirected / access denied.
 */
export function usePageAccess() {
  const { staff } = useAuth()
  const role = staff?.role?.toLowerCase?.()
  const allowed = ['founder', 'operator', 'co-integrator']
  return {
    canView: !!role && allowed.includes(role),
    role: staff?.role || null,
  }
}

export { ED_STAFF_ID }
