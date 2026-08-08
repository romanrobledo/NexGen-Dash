import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLeadsData } from './useLeadsData'
import { useBooksMonthly } from './useBooksMonthly'

/**
 * S.A.N.D. dashboard data orchestrator.
 *
 * Returns per-tile specs shaped as { id, category, title, state, value,
 * label, description, icon, blockedReason? } so the presentation layer
 * has one contract to render.
 *
 * The five tile states:
 *   loading  — a data source is still fetching
 *   error    — a source failed to load
 *   blocked  — no data source exists yet in the DB (needs a schema)
 *   empty    — source exists but has no rows for the reporting period
 *   value    — real value ready to render
 *
 * Never returns a fabricated number. Never invents deltas. Week-over-
 * week comparisons are omitted entirely until snapshot data lands
 * (see MEMORY.md → shadow-ratio-engine-lesson for why).
 */
export function useSandMetrics() {
  // ─── Occupancy — from public.nexgen_occupancy view ─────────────────────
  // The 145 operating capacity lives inside the view definition — that's
  // the named place for it. This hook does not hardcode capacity anywhere;
  // it renders whatever the view returns.
  const [occupancy, setOccupancy] = useState(null)
  const [occupancyLoading, setOccupancyLoading] = useState(true)
  const [occupancyError, setOccupancyError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function fetch() {
      if (!supabase) {
        if (mounted) {
          setOccupancyError('Supabase not configured')
          setOccupancyLoading(false)
        }
        return
      }
      try {
        const { data, error } = await supabase
          .from('nexgen_occupancy')
          .select('enrolled, capacity, occupancy_pct, seats_available, last_synced')
          .maybeSingle()
        if (!mounted) return
        if (error) throw error
        setOccupancy(data)
      } catch (err) {
        if (!mounted) return
        console.error('[useSandMetrics] occupancy fetch failed:', err?.message || err)
        setOccupancyError(err?.message || 'Failed to load occupancy')
      } finally {
        if (mounted) setOccupancyLoading(false)
      }
    }
    fetch()
    return () => { mounted = false }
  }, [])

  // ─── Leads + Tours — via useLeadsData ──────────────────────────────────
  const leadsData = useLeadsData()

  // Leads / Tours this week — computed here directly from the raw arrays.
  // useLeadsData's exported metrics squash 0 → null, which is fine for
  // "should I highlight this?" logic but wrong for a dashboard that
  // needs to distinguish "no data" (source unavailable) from "0 events"
  // (source available, no events in the period).
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

  const leadsThisWeek = useMemo(() => {
    if (!Array.isArray(leadsData.leads)) return null
    return leadsData.leads.filter((r) => {
      if (!r.created_at) return false
      const ms = new Date(r.created_at).getTime()
      return Number.isFinite(ms) && ms >= weekAgo
    }).length
  }, [leadsData.leads, weekAgo])

  const toursThisWeek = useMemo(() => {
    if (!Array.isArray(leadsData.tours)) return null
    return leadsData.tours.filter((t) => {
      const iso = t.scheduled_at || t.created_at
      if (!iso) return false
      const ms = new Date(iso).getTime()
      return Number.isFinite(ms) && ms >= weekAgo
    }).length
  }, [leadsData.tours, weekAgo])

  // ─── Financial rollups — via useBooksMonthly ───────────────────────────
  const books = useBooksMonthly()

  const currentMonthPrefix = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }, [])

  const currentMonthRevenue = useMemo(
    () =>
      books.revenueBySource
        .filter((r) => String(r.month).startsWith(currentMonthPrefix))
        .reduce((sum, r) => sum + r.total, 0),
    [books.revenueBySource, currentMonthPrefix]
  )

  const currentMonthExpenses = useMemo(
    () =>
      books.monthly
        .filter(
          (r) =>
            String(r.month).startsWith(currentMonthPrefix) && r.direction === 'debit'
        )
        .reduce((sum, r) => sum + r.total, 0),
    [books.monthly, currentMonthPrefix]
  )

  const currentCompleteness = useMemo(
    () =>
      books.completeness.find((c) => String(c.month).startsWith(currentMonthPrefix)) ||
      null,
    [books.completeness, currentMonthPrefix]
  )

  // Books "empty" state — no reconciled statements at all for this month.
  const booksHasCurrentMonthData =
    currentMonthRevenue !== 0 || currentMonthExpenses !== 0
  const netIsSafeToShow =
    booksHasCurrentMonthData && currentCompleteness && !currentCompleteness.isIncomplete

  // ─── Tile assembly ─────────────────────────────────────────────────────
  const tiles = useMemo(() => [
    // ── Weekly ───────────────────────────────────────────────────────────
    {
      id: 'occupancy',
      category: 'weekly',
      title: 'Occupancy Rate',
      icon: 'Users',
      state: occupancyLoading ? 'loading'
        : occupancyError ? 'error'
        : !occupancy ? 'empty'
        : 'value',
      value: occupancy ? `${occupancy.occupancy_pct}%` : null,
      label: occupancy
        ? `${occupancy.occupancy_pct}% of capacity (${occupancy.enrolled} of ${occupancy.capacity})`
        : null,
      description:
        'From public.nexgen_occupancy — capacity (145) lives in the view definition.',
    },
    {
      id: 'new_leads',
      category: 'weekly',
      title: 'New Leads',
      icon: 'UserPlus',
      state: leadsData.loading ? 'loading'
        : leadsData.error ? 'error'
        : leadsThisWeek == null ? 'empty'
        : 'value',
      value: leadsThisWeek != null ? String(leadsThisWeek) : null,
      label:
        leadsThisWeek != null
          ? `${leadsThisWeek} new lead${leadsThisWeek === 1 ? '' : 's'} in the last 7 days`
          : null,
      description: 'From public.leads (created_at within 7 days).',
    },
    {
      id: 'tours_held',
      category: 'weekly',
      title: 'Tours Held',
      icon: 'CalendarPlus',
      state: leadsData.loading ? 'loading'
        : leadsData.error ? 'error'
        : toursThisWeek == null ? 'empty'
        : 'value',
      value: toursThisWeek != null ? String(toursThisWeek) : null,
      label:
        toursThisWeek != null
          ? `${toursThisWeek} tour${toursThisWeek === 1 ? '' : 's'} in the last 7 days`
          : null,
      description: 'From public.tours (scheduled_at or created_at within 7 days).',
    },
    {
      id: 'new_enrollments_withdrawals',
      category: 'weekly',
      title: 'New Enrollments & Withdrawals',
      icon: 'UserX',
      state: 'blocked',
      blockedReason:
        'No history tracking yet. children.enrollment_status only holds current state, not transitions. Needs a children_status_history table (trigger-populated) before this can compute honestly.',
    },
    {
      id: 'trs_score',
      category: 'weekly',
      title: 'Average TRS Room Score',
      icon: 'Award',
      state: 'blocked',
      blockedReason:
        "Rachel's 30-min room assessments aren't modeled in the DB. Needs a room_assessments schema + intake UI before a score can render.",
    },

    // ── Monthly ──────────────────────────────────────────────────────────
    {
      id: 'revenue_net',
      category: 'monthly',
      title: 'Revenue & Net Profit',
      icon: 'DollarSign',
      state: books.loading ? 'loading'
        : books.error ? 'error'
        : !booksHasCurrentMonthData ? 'empty'
        : 'value',
      value: booksHasCurrentMonthData ? formatUSD(currentMonthRevenue) : null,
      label: booksHasCurrentMonthData
        ? netIsSafeToShow
          ? `${formatUSD(currentMonthRevenue)} revenue · ${formatUSD(
              currentMonthRevenue - currentMonthExpenses
            )} net`
          : `${formatUSD(currentMonthRevenue)} revenue · net hidden (expenses incomplete)`
        : null,
      description: netIsSafeToShow
        ? 'From v_books_monthly + v_books_revenue_by_source, current month.'
        : 'Net profit hidden until every check is categorized — see Books → Reports for the banner detail.',
    },
    {
      id: 'arpc',
      category: 'monthly',
      title: 'Average Revenue per Child (ARPC)',
      icon: 'TrendingUp',
      state:
        books.loading || occupancyLoading ? 'loading'
        : !occupancy || !booksHasCurrentMonthData ? 'empty'
        : (occupancy.enrolled ?? 0) === 0 ? 'empty'
        : 'value',
      value:
        occupancy && booksHasCurrentMonthData && occupancy.enrolled > 0
          ? formatUSD(currentMonthRevenue / occupancy.enrolled)
          : null,
      label:
        occupancy && booksHasCurrentMonthData && occupancy.enrolled > 0
          ? `${formatUSD(currentMonthRevenue / occupancy.enrolled)} per child (${formatUSD(currentMonthRevenue)} ÷ ${occupancy.enrolled})`
          : null,
      description:
        'Current-month revenue ÷ active enrolled. Both inputs are live.',
    },
    {
      id: 'churn',
      category: 'monthly',
      title: 'Monthly Churn %',
      icon: 'UserX',
      state: 'blocked',
      blockedReason:
        'Requires history tracking (see New Enrollments & Withdrawals) plus a start-of-month active-count snapshot. Neither exists yet.',
    },
    {
      id: 'ltgp',
      category: 'monthly',
      title: 'Lifetime Gross Profit per Family (LTGP)',
      icon: 'Award',
      state: 'blocked',
      blockedReason:
        'Depends on monthly churn (blocked) and a stable per-family margin (currently hidden while expenses are incomplete).',
    },
  ], [
    occupancy, occupancyLoading, occupancyError,
    leadsData.loading, leadsData.error, leadsThisWeek, toursThisWeek,
    books.loading, books.error, currentMonthRevenue, currentMonthExpenses,
    currentCompleteness, booksHasCurrentMonthData, netIsSafeToShow,
  ])

  return {
    tiles,
    weeklyTiles: tiles.filter((t) => t.category === 'weekly'),
    monthlyTiles: tiles.filter((t) => t.category === 'monthly'),
    loading:
      occupancyLoading || leadsData.loading || books.loading,
  }
}

function formatUSD(n) {
  if (n == null) return null
  const num = Number(n)
  if (Number.isNaN(num)) return null
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
