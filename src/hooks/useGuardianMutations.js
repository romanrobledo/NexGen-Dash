import { useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Mutations for the guardians table.
 *
 * Fetch is intentionally NOT here — useFamilies() already pulls guardians
 * nested under each family in a single embedded query. Mutations expect
 * the caller to call useFamilies().refetch() after a successful write.
 *
 * Contract for is_primary:
 *   The DB doesn't enforce "one primary per family," so this hook does it
 *   client-side. When creating or updating a guardian with is_primary =
 *   true, EVERY other guardian in the same family is first flipped to
 *   is_primary = false in the same call. Not perfectly atomic without a
 *   Postgres function, but the two-step is guarded so a partial failure
 *   surfaces as an error the caller can handle.
 *
 * Return shape:
 *   {
 *     createGuardian(familyId, values),
 *     updateGuardian(id, values),
 *     deleteGuardian(id),
 *     pending: boolean,
 *     error: string | null,
 *   }
 *
 * Every mutation returns { data, error } — `data` is the affected row(s)
 * on success, `error` is a friendly message on failure. Consumers should
 * always check `error` before treating the operation as successful.
 */
export function useGuardianMutations() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(/** @type {string|null} */ (null))

  async function unsetOtherPrimaries(familyId, exceptId) {
    // Clear is_primary on every OTHER guardian in the family. exceptId is
    // NULL for creates (no id yet) and the current guardian's id for
    // updates so we don't fight our own write below.
    let q = supabase
      .from('guardians')
      .update({ is_primary: false })
      .eq('family_id', familyId)
      .eq('is_primary', true)
    if (exceptId) q = q.neq('id', exceptId)
    const { error: unsetErr } = await q
    if (unsetErr) throw new Error(`Failed to demote existing primary: ${unsetErr.message}`)
  }

  async function createGuardian(familyId, values) {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    if (!familyId) return { data: null, error: 'Missing family id' }
    setPending(true)
    setError(null)
    try {
      const payload = normalizePayload(familyId, values)

      if (payload.is_primary) {
        await unsetOtherPrimaries(familyId, null)
      }

      const { data, error: insErr } = await supabase
        .from('guardians')
        .insert(payload)
        .select()
        .single()
      if (insErr) throw new Error(insErr.message)
      return { data, error: null }
    } catch (err) {
      const msg = err?.message || 'Failed to create guardian'
      setError(msg)
      return { data: null, error: msg }
    } finally {
      setPending(false)
    }
  }

  async function updateGuardian(id, values) {
    if (!supabase) return { data: null, error: 'Supabase not configured' }
    if (!id) return { data: null, error: 'Missing guardian id' }
    setPending(true)
    setError(null)
    try {
      const payload = normalizePayload(null, values)
      // family_id is not editable — pull the current row's family_id so
      // the primary-uniqueness step knows which family to operate on.
      if (payload.is_primary) {
        const { data: current, error: selErr } = await supabase
          .from('guardians')
          .select('family_id')
          .eq('id', id)
          .single()
        if (selErr) throw new Error(selErr.message)
        await unsetOtherPrimaries(current.family_id, id)
      }

      const { data, error: updErr } = await supabase
        .from('guardians')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      if (updErr) throw new Error(updErr.message)
      return { data, error: null }
    } catch (err) {
      const msg = err?.message || 'Failed to update guardian'
      setError(msg)
      return { data: null, error: msg }
    } finally {
      setPending(false)
    }
  }

  async function deleteGuardian(id) {
    if (!supabase) return { error: 'Supabase not configured' }
    if (!id) return { error: 'Missing guardian id' }
    setPending(true)
    setError(null)
    try {
      const { error: delErr } = await supabase
        .from('guardians')
        .delete()
        .eq('id', id)
      if (delErr) throw new Error(delErr.message)
      return { error: null }
    } catch (err) {
      const msg = err?.message || 'Failed to delete guardian'
      setError(msg)
      return { error: msg }
    } finally {
      setPending(false)
    }
  }

  return { createGuardian, updateGuardian, deleteGuardian, pending, error }
}

/**
 * Convert form values → DB payload. Trims strings, empty → null. The
 * only required fields at the DB layer are first_name + last_name; the
 * form validates that before calling this, so we don't repeat it here.
 */
function normalizePayload(familyId, v) {
  const trim = (s) => (typeof s === 'string' ? s.trim() : s)
  const emptyToNull = (s) => {
    const t = trim(s)
    return t === '' ? null : t
  }
  const payload = {
    first_name:         trim(v.first_name),
    last_name:          trim(v.last_name),
    relationship:       emptyToNull(v.relationship),
    phone:              emptyToNull(v.phone),
    email:              emptyToNull(v.email),
    is_primary:         !!v.is_primary,
    pickup_authorized:  v.pickup_authorized !== false,
    emergency_priority: v.emergency_priority == null || v.emergency_priority === ''
                          ? null
                          : Number(v.emergency_priority),
    notes:              emptyToNull(v.notes),
  }
  // family_id is only set on create; updates don't touch it (guardians
  // shouldn't move families — if a guardian belongs to a new family,
  // create a fresh row).
  if (familyId) payload.family_id = familyId
  return payload
}
