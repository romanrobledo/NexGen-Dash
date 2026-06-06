import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Shared data source for anything lead-related across the app.
 *
 * Both the Marketing Dashboard and the Leads Dashboard call this hook so
 * they read from the same Supabase tables (`leads`, `tours`, `enrollments`).
 * Either page can be extended without the numbers drifting out of sync.
 *
 * Gracefully returns empty arrays if the tables don't exist yet — the UI
 * then shows zero/placeholder states instead of erroring out.
 */
export function useLeadsData() {
  const [leads, setLeads] = useState([])
  const [tours, setTours] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      if (!supabase) {
        setLoading(false)
        return
      }
      try {
        const safe = async (q) => {
          const res = await q
          if (res.error) {
            console.warn('Leads data query skipped:', res.error.message)
            return { data: [] }
          }
          return res
        }

        const [l, t, e] = await Promise.all([
          safe(supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(500)),
          safe(supabase.from('tours').select('*').order('scheduled_at', { ascending: false }).limit(500)),
          safe(supabase.from('enrollments').select('*').order('created_at', { ascending: false }).limit(500)),
        ])

        if (cancelled) return
        setLeads(l.data || [])
        setTours(t.data || [])
        setEnrollments(e.data || [])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()
    return () => {
      cancelled = true
    }
  }, [])

  // Derived metrics — safe to use directly in dashboard cards.
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 7)

  const inSince = (row, since, field = 'created_at') => {
    const d = row[field] ? new Date(row[field]) : null
    return d && d >= since
  }

  const leadsThisMonth = leads.filter((r) => inSince(r, monthStart)).length
  const leadsThisWeek = leads.filter((r) => inSince(r, weekStart)).length
  const toursThisMonth = tours.filter((r) => inSince(r, monthStart, 'scheduled_at') || inSince(r, monthStart)).length
  const enrollmentsThisMonth = enrollments.filter((r) => inSince(r, monthStart)).length
  const conversionPct = (leadsThisMonth && enrollmentsThisMonth)
    ? Math.round((enrollmentsThisMonth / leadsThisMonth) * 100)
    : null

  return {
    leads,
    tours,
    enrollments,
    loading,
    error,
    metrics: {
      leadsThisMonth: leadsThisMonth || null,
      leadsThisWeek: leadsThisWeek || null,
      toursThisMonth: toursThisMonth || null,
      enrollmentsThisMonth: enrollmentsThisMonth || null,
      conversionPct,
    },
  }
}
