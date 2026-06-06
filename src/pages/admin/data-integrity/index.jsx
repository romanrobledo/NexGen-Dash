import { useState, useCallback, useMemo } from 'react'
import { BarChart3, Users, Target, Home, Award, Shield, ShieldOff } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { useViewMode } from '../../../contexts/ViewModeContext'
import { usePageAccess } from './hooks/useIsEd'
import { useCurrentCycle } from './hooks/useCurrentCycle'
import { verifiedThisCycle, isOverdue } from './utils/cycleMath'
import StatusDashboard from './StatusDashboard'
import DomainCard from './DomainCard'
import SendToPaperclipButton from './SendToPaperclipButton'
import { useIsEd } from './hooks/useIsEd'

/**
 * /admin/data-integrity — Ed Bague's data verification workspace.
 *
 * Phase 2 scope: Baseline Numbers domain end-to-end only. The other 5 domain
 * configs are defined below but commented out — uncomment each block once
 * Roman confirms Baseline Numbers works the way he wants.
 */

// ─── Domain configs ─────────────────────────────────────────────────────────

const BASELINE_NUMBERS = {
  label: 'Baseline Numbers',
  icon: BarChart3,
  blurb: "The weekly and monthly numbers that tell you how the center is actually doing. Click any row to drill in.",
  tableName: 'data_integrity_baseline_numbers',
  domainKey: 'baseline_numbers',
  editableField: 'metric_value',
  rowLabel: (row) => row.metric_name,
  // Collapse to one row per metric_name (latest submission), so the card
  // shows 12 rows instead of every historical submission. The detail page
  // (/admin/data-integrity/metric/:metricName) shows the full history.
  groupKey: 'metric_name',
  detailRoute: (row) => `/admin/data-integrity/metric/${encodeURIComponent(row.metric_name)}`,
  renderRow: (row, groupMeta) => {
    const cadenceLabel =
      row.period_type === 'weekly' ? 'Weekly' :
      row.period_type === 'monthly' ? 'Monthly' : ''
    const periodLabel = row.period_ending
      ? ` · ${row.period_type === 'monthly' ? 'Month' : 'Week'} ending ${new Date(row.period_ending + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : ''
    const historyLabel = groupMeta && groupMeta.historyCount > 1
      ? ` · ${groupMeta.historyCount} submissions`
      : ''
    return {
      displayLabel: humanizeMetricName(row.metric_name),
      displayExtra: `${cadenceLabel}${periodLabel}${historyLabel}`,
      value: row.metric_value,
      valueType: 'number',
    }
  },
}

// ─── Future domains — uncomment incrementally in Phase 2b ──────────────────
// const STAFF_ROSTER = { label: 'Staff Roster', icon: Users, ... }
// const STRATEGIC_PRIORITIES = { label: 'Strategic Priorities', icon: Target, ... }
// const ROOMS = { label: 'Room Layout', icon: Home, ... }
// const PERFORMANCE_BASELINE = { label: 'Performance Baseline', icon: Award, ... }
// const COMPLIANCE = { label: 'Compliance', icon: Shield, ... }

const ACTIVE_DOMAINS = [BASELINE_NUMBERS]

// ─── Helpers ────────────────────────────────────────────────────────────────

function humanizeMetricName(key) {
  if (!key) return ''
  // Special-case acronyms and the arrow token
  return key
    .split('_')
    .map((word) => {
      const lower = word.toLowerCase()
      if (lower === 'arpc' || lower === 'trs' || lower === 'hhsc') return word.toUpperCase()
      if (lower === 'to' && key.includes('tour_to_enrollment')) return '→'
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
    .replace(' → ', ' → ')
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DataIntegrityPage() {
  const { staff } = useAuth()
  const { mobileMode } = useViewMode()
  const canEdit = useIsEd()
  const { canView, role } = usePageAccess()

  // Collected status per domain — updated via callback from each DomainCard
  const [domainStates, setDomainStates] = useState({})

  // Stable callback for cards so they don't loop on every render
  const handleDomainUpdate = useCallback((update) => {
    setDomainStates((prev) => {
      const current = prev[update.key]
      if (
        current &&
        current.status === update.status &&
        current.latestVerifiedAt === update.latestVerifiedAt &&
        current.rowCount === update.rowCount
      ) {
        return prev
      }
      return { ...prev, [update.key]: update }
    })
  }, [])

  // Roll-ups across all active domains
  const { latestVerifiedAt, counts, verifiedDomainKeys } = useMemo(() => {
    const states = Object.values(domainStates)
    let latest = null
    let verified = 0
    let needsReview = 0
    let overdue = 0
    const verifiedKeys = []
    for (const s of states) {
      if (s.latestVerifiedAt) {
        if (!latest || new Date(s.latestVerifiedAt) > new Date(latest)) {
          latest = s.latestVerifiedAt
        }
      }
      if (s.status === 'verified') { verified += 1; verifiedKeys.push(s.key) }
      else if (s.status === 'overdue') overdue += 1
      else if (s.status === 'needs_review' || s.status === 'flagged') needsReview += 1
    }
    return {
      latestVerifiedAt: latest,
      counts: { verified, needsReview, overdue },
      verifiedDomainKeys: verifiedKeys,
    }
  }, [domainStates])

  const cycle = useCurrentCycle(latestVerifiedAt)

  // Gate: only Founder / Operator / Co-Integrator can view
  if (!canView) {
    return <AccessDenied role={role} />
  }

  return (
    <div className={mobileMode ? 'space-y-5' : 'max-w-5xl mx-auto space-y-6'}>
      <StatusDashboard
        firstName={staff?.first_name}
        lastReviewedAt={latestVerifiedAt}
        daysSinceLastReview={cycle.daysSinceLastReview}
        nextReviewDay={cycle.cycleEnd}
        counts={counts}
      />

      {ACTIVE_DOMAINS.map((config) => (
        <DomainCard
          key={config.domainKey}
          config={config}
          onDomainStatusChange={handleDomainUpdate}
        />
      ))}

      {/* Hint about what's coming — remove once all 6 domains are live */}
      {ACTIVE_DOMAINS.length < 6 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white/50 p-5 text-center">
          <p className="text-sm font-semibold text-gray-700">
            More sections are on the way
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Once Baseline Numbers is dialed in, we'll turn on Staff Roster, Strategic
            Priorities, Rooms, Performance, and Compliance — same flow, one at a time.
          </p>
        </div>
      )}

      <SendToPaperclipButton
        verifiedDomains={verifiedDomainKeys}
        cycleId={cycle.cycleId}
        canSend={canEdit}
      />
    </div>
  )
}

// ─── Access-denied view ─────────────────────────────────────────────────────

function AccessDenied({ role }) {
  return (
    <div className="max-w-xl mx-auto mt-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <ShieldOff className="w-7 h-7 text-gray-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Just a heads up</h2>
      <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
        This page is for Ed, Roman, and Robyn — the folks who keep the data clean.
        {role ? ` Your role (${role}) isn't on the list.` : ''} Ping Roman if you think you should see this.
      </p>
    </div>
  )
}
