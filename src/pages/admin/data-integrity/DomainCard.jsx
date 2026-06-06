import { useEffect, useMemo } from 'react'
import { useDataIntegrityDomain } from './hooks/useDataIntegrityDomain'
import { useIsEd } from './hooks/useIsEd'
import DomainRow from './DomainRow'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flag,
  Loader2,
} from 'lucide-react'
import { relativeDaysSentence } from './utils/cycleMath'

/**
 * DomainCard — generic container that renders one domain's header,
 * status, and row list. Driven entirely by the `config` prop so the
 * same component works for all 6 domains once their configs are written.
 *
 * @param {object} config
 * @param {string}   config.label          — "Baseline Numbers"
 * @param {React.FC} config.icon           — Lucide icon component
 * @param {string}   config.blurb          — one-sentence plain-English description
 * @param {string}   config.tableName      — Supabase table
 * @param {string}   config.domainKey      — verification_log.domain enum value
 * @param {string}   config.editableField  — column that "Needs Correction" edits
 * @param {Function} config.rowLabel       — (row) => string — human identifier for log/webhook
 * @param {Function} config.renderRow      — (row) => { displayLabel, displayExtra, value, valueType }
 *
 * @param {Function} onDomainStatusChange — optional: called with the latest domain status
 */
export default function DomainCard({ config, onDomainStatusChange }) {
  const canEdit = useIsEd()
  const {
    rows,
    loading,
    error,
    actioningId,
    domainStatus,
    latestVerifiedAt,
    verify,
    correct,
    flag,
  } = useDataIntegrityDomain({
    tableName: config.tableName,
    domainKey: config.domainKey,
    editableField: config.editableField,
    rowLabel: config.rowLabel,
  })

  /**
   * If config.groupKey is set, collapse rows to the "latest per group" so the
   * card stays tidy (e.g., Baseline Numbers → one row per metric_name, not
   * one row per historical submission).
   *
   * We also attach `groupMeta` ({ historyCount }) so the row renderer can
   * surface "4 submissions" alongside the value.
   */
  const displayRows = useMemo(() => {
    if (!config.groupKey) return rows.map((r) => ({ row: r, groupMeta: null }))

    const byKey = new Map()
    for (const r of rows) {
      const k = r[config.groupKey]
      const entry = byKey.get(k)
      if (!entry) {
        byKey.set(k, { rows: [r], latest: r })
        continue
      }
      entry.rows.push(r)
      // Pick newer: prefer a real period_ending, then the greater date, then
      // fall back to updated_at/created_at.
      const aPe = r.period_ending ? new Date(r.period_ending).getTime() : -1
      const bPe = entry.latest.period_ending ? new Date(entry.latest.period_ending).getTime() : -1
      if (aPe !== bPe) {
        if (aPe > bPe) entry.latest = r
      } else {
        const aU = new Date(r.updated_at || r.created_at).getTime()
        const bU = new Date(entry.latest.updated_at || entry.latest.created_at).getTime()
        if (aU > bU) entry.latest = r
      }
    }
    // Also prefer rows that actually have a value over placeholder null rows
    for (const entry of byKey.values()) {
      const withValue = entry.rows.find((r) => r.metric_value != null)
      if (withValue) {
        const a = new Date(withValue.updated_at || withValue.created_at).getTime()
        const b = new Date(entry.latest.updated_at || entry.latest.created_at).getTime()
        if (entry.latest.metric_value == null || a >= b) entry.latest = withValue
      }
    }
    return Array.from(byKey.values()).map(({ latest, rows: group }) => ({
      row: latest,
      groupMeta: {
        historyCount: group.filter((r) => r.metric_value != null).length,
      },
    }))
  }, [rows, config.groupKey])

  // Let the parent page know when status/timestamp changes (for Send to Paperclip gating)
  useEffect(() => {
    if (!onDomainStatusChange) return
    onDomainStatusChange({
      key: config.domainKey,
      status: domainStatus,
      latestVerifiedAt,
      rowCount: rows.length,
    })
    // Parent should memoize its callback; even if it doesn't, changes here
    // are driven by domainStatus/latestVerifiedAt which are stable per data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainStatus, latestVerifiedAt, rows.length, config.domainKey])

  const Icon = config.icon
  const chip = CARD_STATUS_CHIP[domainStatus] || CARD_STATUS_CHIP.needs_review

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-[#EDF4EC] flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-[#1B4332]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-gray-900">{config.label}</h2>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${chip.cls}`}
            >
              <chip.Icon className="w-3 h-3" />
              {chip.label}
            </span>
          </div>
          {config.blurb && (
            <p className="text-sm text-gray-500 mt-0.5">{config.blurb}</p>
          )}
          <p className="text-[11px] text-gray-400 mt-1">
            Last checked across all rows: <span className="font-medium text-gray-500">{relativeDaysSentence(latestVerifiedAt)}</span>
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Loading rows…
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            Couldn't load this section: {error}
          </div>
        ) : displayRows.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-6 text-center">
            No rows yet. Add one from the admin backend to get started.
          </p>
        ) : (
          displayRows.map(({ row, groupMeta }) => {
            const rendered = config.renderRow(row, groupMeta)
            const detailHref = config.detailRoute ? config.detailRoute(row) : null
            return (
              <DomainRow
                key={row.id}
                row={row}
                displayLabel={rendered.displayLabel}
                displayExtra={rendered.displayExtra}
                value={rendered.value}
                valueType={rendered.valueType}
                canEdit={canEdit}
                isActioning={actioningId === row.id}
                detailHref={detailHref}
                onVerify={() => verify(row.id)}
                onCorrect={(newValue) => correct(row.id, newValue)}
                onFlag={(notes) => flag(row.id, notes)}
              />
            )
          })
        )}
      </div>
    </section>
  )
}

const CARD_STATUS_CHIP = {
  verified: {
    Icon: CheckCircle2,
    label: 'VERIFIED THIS CYCLE',
    cls: 'bg-[#52B788]/20 text-[#1B4332] border-[#52B788]/40',
  },
  needs_review: {
    Icon: Clock,
    label: 'NEEDS REVIEW',
    cls: 'bg-gray-50 text-gray-600 border-gray-200',
  },
  overdue: {
    Icon: AlertTriangle,
    label: 'OVERDUE',
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  flagged: {
    Icon: Flag,
    label: 'HAS FLAGS',
    cls: 'bg-red-50 text-red-600 border-red-200',
  },
}
