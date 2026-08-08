import {
  Users,
  UserPlus,
  TrendingUp,
  CalendarPlus,
  Award,
  DollarSign,
  UserX,
  Loader2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react'
import { useSandMetrics } from '../hooks/useSandMetrics'

/**
 * S.A.N.D. — Sleep At Night Dashboard.
 *
 * Rebuild on 2026-08-07: previously this component read from public.metrics,
 * a stub table of hardcoded values (Occupancy was showing 380 for a 145-
 * seat operation, ARPC was 24500 with no unit, LTGP was 895.25 against no
 * baseline — every tile was fabricated).
 *
 * New contract:
 *   - Every tile derives from a named DB source (nexgen_occupancy, the
 *     leads/tours tables, v_books_*), or renders a grey "blocked" state
 *     with an honest explanation of what schema is missing.
 *   - Units are declared on every rendered number.
 *   - Absent data renders as "No data yet" — never $0.00 as a proxy for
 *     absence.
 *   - Week-over-week deltas are DROPPED until a snapshot table exists.
 *     A fabricated comparison is worse than no comparison.
 *
 * See useSandMetrics for the tile spec + state machine.
 */

const iconMap = {
  Users,
  UserPlus,
  TrendingUp,
  CalendarPlus,
  Award,
  DollarSign,
  UserX,
}

export default function MetricsDashboard() {
  const { weeklyTiles, monthlyTiles } = useSandMetrics()

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">S.A.N.D.</h2>
        <p className="text-gray-500 mt-1">
          Sleep At Night Dashboard — live snapshot from real data sources.
          Grey tiles are honest unknowns, not zeros.
        </p>
      </div>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {weeklyTiles.map((tile) => (
            <TileCard key={tile.id} tile={tile} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {monthlyTiles.map((tile) => (
            <TileCard key={tile.id} tile={tile} />
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── TileCard — 5-state renderer ────────────────────────────────────────────

function TileCard({ tile }) {
  switch (tile.state) {
    case 'loading':
      return (
        <TileShell tile={tile} accent="default">
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Loading…</span>
          </div>
        </TileShell>
      )
    case 'error':
      return (
        <TileShell tile={tile} accent="red">
          <div className="flex items-start gap-2 mt-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-700 leading-relaxed">
              Load error — reload the page. If persistent, check the source
              named in this tile's description.
            </p>
          </div>
        </TileShell>
      )
    case 'blocked':
      return (
        <TileShell tile={tile} accent="gray">
          <p className="text-lg font-semibold text-gray-400 mb-1">—</p>
          <p className="text-xs font-medium text-gray-500 mb-2">
            Not measurable yet
          </p>
          <div className="flex items-start gap-1.5">
            <AlertCircle className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-500 leading-relaxed italic">
              {tile.blockedReason}
            </p>
          </div>
        </TileShell>
      )
    case 'empty':
      return (
        <TileShell tile={tile} accent="gray">
          <p className="text-lg font-semibold text-gray-400 mb-1">—</p>
          <p className="text-xs font-medium text-gray-500 mb-2">No data yet</p>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            {tile.description}
          </p>
        </TileShell>
      )
    case 'value':
    default:
      return (
        <TileShell tile={tile} accent="default">
          <p className="text-3xl font-bold text-gray-900 mb-1 tabular-nums">
            {tile.value}
          </p>
          <p className="text-xs font-medium text-gray-700 mb-2 leading-snug">
            {tile.label}
          </p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {tile.description}
          </p>
        </TileShell>
      )
  }
}

function TileShell({ tile, accent, children }) {
  const IconComponent = iconMap[tile.icon] || Users
  const cardCls =
    accent === 'gray'
      ? 'bg-gray-50 border-gray-200'
      : accent === 'red'
        ? 'bg-red-50 border-red-200'
        : 'bg-white border-gray-200 hover:shadow-md'
  const iconWrapCls =
    accent === 'gray'
      ? 'bg-gray-100 text-gray-500'
      : accent === 'red'
        ? 'bg-red-100 text-red-600'
        : 'bg-blue-100 text-blue-600'
  return (
    <div className={`rounded-xl border p-5 transition-shadow ${cardCls}`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500 leading-snug pr-2">
          {tile.title}
        </h3>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconWrapCls}`}
        >
          <IconComponent className="w-5 h-5" />
        </div>
      </div>
      {children}
    </div>
  )
}
