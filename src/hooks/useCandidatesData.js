import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Shared data source for anything candidate/hiring-related across the app.
 *
 * Parallel to useLeadsData — Leads is the enrollment funnel (families
 * coming in), Candidates is the hiring funnel (staff coming in). Both
 * hooks follow the same shape so a page built for one can be re-styled
 * for the other without rewriting data-flow code.
 *
 * Reads from three Supabase tables:
 *   `candidates`  — every applicant, one row per person
 *   `interviews`  — phone screens, in-person interviews, follow-ups
 *   `hires`       — closed candidates who accepted an offer
 *
 * None of these tables need to exist for the hook to work — missing
 * tables gracefully resolve to empty arrays and every downstream page
 * renders zero/placeholder states instead of erroring out. When the
 * hiring pipeline is wired up (n8n, Google Sheet, or manual entry),
 * the pages populate automatically.
 */
export function useCandidatesData() {
  const [candidates, setCandidates] = useState([])
  const [interviews, setInterviews] = useState([])
  const [hires, setHires] = useState([])
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
            console.warn('Candidates data query skipped:', res.error.message)
            return { data: [] }
          }
          return res
        }

        const [c, i, h] = await Promise.all([
          safe(supabase.from('candidates').select('*').order('created_at', { ascending: false }).limit(500)),
          safe(supabase.from('interviews').select('*').order('scheduled_at', { ascending: false }).limit(500)),
          safe(supabase.from('hires').select('*').order('created_at', { ascending: false }).limit(500)),
        ])

        if (cancelled) return
        setCandidates(c.data || [])
        setInterviews(i.data || [])
        setHires(h.data || [])
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

  const candidatesThisMonth = candidates.filter((r) => inSince(r, monthStart)).length
  const candidatesThisWeek = candidates.filter((r) => inSince(r, weekStart)).length
  const interviewsThisMonth = interviews.filter(
    (r) => inSince(r, monthStart, 'scheduled_at') || inSince(r, monthStart)
  ).length
  const hiresThisMonth = hires.filter((r) => inSince(r, monthStart)).length
  const conversionPct = (candidatesThisMonth && hiresThisMonth)
    ? Math.round((hiresThisMonth / candidatesThisMonth) * 100)
    : null

  return {
    candidates,
    interviews,
    hires,
    loading,
    error,
    metrics: {
      candidatesThisMonth: candidatesThisMonth || null,
      candidatesThisWeek: candidatesThisWeek || null,
      interviewsThisMonth: interviewsThisMonth || null,
      hiresThisMonth: hiresThisMonth || null,
      conversionPct,
    },
  }
}
