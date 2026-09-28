import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Load the family roster with each family's children and guardians nested
 * inside. One round-trip per read via Supabase's embedded resource syntax
 * — three tables in one JSON payload.
 *
 * Return shape:
 *   families      — array of Family, each with { children, guardians } arrays
 *   familiesById  — Map<uuid, Family>  for quick detail-page lookups
 *   loading, error, refetch
 *
 * Consumers:
 *   - src/pages/FamiliesListPage.jsx   (roster)
 *   - src/pages/FamilyDetailPage.jsx   (looks a family up by :id)
 *
 * @typedef {Object} Guardian
 * @property {string}  id
 * @property {string}  firstName
 * @property {string}  lastName
 * @property {string|null} relationship
 * @property {string|null} phone
 * @property {string|null} email
 * @property {boolean} isPrimary
 * @property {boolean} pickupAuthorized
 * @property {number|null} emergencyPriority
 * @property {string|null} notes
 *
 * @typedef {Object} FamilyChild
 * @property {string}   id
 * @property {string}   fullName
 * @property {string|null} dateOfBirth
 * @property {number|null} roomNumber
 * @property {string|null} teacherName
 * @property {boolean|null} onCcms
 * @property {string|null} programClass
 *
 * @typedef {Object} Family
 * @property {string} id
 * @property {string} familyName
 * @property {string} primaryLastName
 * @property {boolean} active
 * @property {string|null} notes
 * @property {string} createdAt
 * @property {FamilyChild[]} children
 * @property {Guardian[]}   guardians
 * @property {Guardian|null} primaryGuardian  // convenience: the is_primary=true one, or first
 * @property {number[]}     roomNumbers      // deduped list for room filter
 */
export function useFamilies() {
  const [rows, setRows] = useState(/** @type {Family[]} */ ([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(/** @type {string|null} */ (null))

  const fetchFamilies = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    try {
      setError(null)
      const { data, error: qErr } = await supabase
        .from('families')
        .select(`
          id, family_name, primary_last_name, active, notes, created_at,
          children:children (
            id, full_name, date_of_birth, room_number, teacher_name,
            on_ccms, program_class
          ),
          guardians:guardians (
            id, first_name, last_name, relationship, phone, email,
            is_primary, pickup_authorized, emergency_priority, notes
          )
        `)
        .eq('active', true)
        .order('family_name', { ascending: true })

      if (qErr) {
        // Table missing (schema not deployed yet) → treat as empty. Same
        // graceful pattern useChildren uses.
        if (/relation|does not exist|schema cache/i.test(qErr.message)) {
          console.warn('[useFamilies] families table missing; treating as empty')
          setRows([])
          return
        }
        throw qErr
      }
      setRows((data || []).map(mapRow))
    } catch (err) {
      console.error('[useFamilies] fetch failed:', err?.message || err)
      setError(err?.message || 'Failed to load families')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchFamilies()
  }, [fetchFamilies])

  const familiesById = useMemo(() => {
    const m = new Map()
    for (const f of rows) m.set(f.id, f)
    return m
  }, [rows])

  return {
    families: rows,
    familiesById,
    loading,
    error,
    refetch: fetchFamilies,
  }
}

function mapRow(row) {
  const guardians = (row.guardians || []).map((g) => ({
    id: g.id,
    firstName: g.first_name,
    lastName: g.last_name,
    relationship: g.relationship,
    phone: g.phone,
    email: g.email,
    isPrimary: !!g.is_primary,
    pickupAuthorized: !!g.pickup_authorized,
    emergencyPriority: g.emergency_priority,
    notes: g.notes,
  }))
  const children = (row.children || []).map((c) => ({
    id: c.id,
    fullName: c.full_name,
    dateOfBirth: c.date_of_birth,
    roomNumber: c.room_number,
    teacherName: c.teacher_name,
    onCcms: c.on_ccms,
    programClass: c.program_class,
  }))
  const primaryGuardian =
    guardians.find((g) => g.isPrimary) || guardians[0] || null
  const roomNumbers = [
    ...new Set(children.map((c) => c.roomNumber).filter((n) => n != null)),
  ].sort((a, b) => a - b)

  return {
    id: row.id,
    familyName: row.family_name,
    primaryLastName: row.primary_last_name,
    active: !!row.active,
    notes: row.notes,
    createdAt: row.created_at,
    children,
    guardians,
    primaryGuardian,
    roomNumbers,
  }
}
