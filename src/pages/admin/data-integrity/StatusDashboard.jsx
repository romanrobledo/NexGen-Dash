import { ClipboardList, CheckCircle2, AlertTriangle, Flame, CalendarCheck } from 'lucide-react'
import { fmtFullTimestamp, fmtReviewDay } from './utils/cycleMath'

/**
 * StatusDashboard — the friendly top card.
 *
 * Plain-language, at-a-glance summary. No jargon.
 *
 * @param {object} props
 * @param {string} props.firstName          — logged-in user's first name
 * @param {string|null} props.lastReviewedAt — ISO timestamp of latest verify across all domains
 * @param {number|null} props.daysSinceLastReview
 * @param {Date}   props.nextReviewDay
 * @param {object} props.counts              — { verified, needsReview, overdue }
 */
export default function StatusDashboard({
  firstName,
  lastReviewedAt,
  daysSinceLastReview,
  nextReviewDay,
  counts,
}) {
  const { verified = 0, needsReview = 0, overdue = 0 } = counts || {}

  return (
    <section className="rounded-2xl border border-[#52B788]/30 bg-gradient-to-br from-[#EDF4EC] to-white p-6 md:p-8 shadow-sm">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#1B4332] flex items-center justify-center shadow-sm shrink-0">
          <ClipboardList className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-[#081C15]">Data Integrity</h1>
          <p className="text-sm text-gray-600 mt-1">
            Hi{firstName ? ` ${firstName}` : ''}! Here's what needs your attention.
          </p>
        </div>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-5">
        <MetaCell
          icon={CheckCircle2}
          label="Last reviewed"
          value={lastReviewedAt ? fmtFullTimestamp(lastReviewedAt) : "Not yet — Ed's first check is ahead"}
        />
        <MetaCell
          icon={CalendarCheck}
          label="Next review"
          value={fmtReviewDay(nextReviewDay)}
        />
        <MetaCell
          icon={Flame}
          label="Days since last review"
          value={
            daysSinceLastReview == null
              ? '—'
              : daysSinceLastReview === 0
                ? 'today'
                : `${daysSinceLastReview} ${daysSinceLastReview === 1 ? 'day' : 'days'}`
          }
        />
      </div>

      {/* Status counts */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Status</p>
        <ul className="space-y-2">
          <StatusLine
            icon={CheckCircle2}
            iconCls="text-[#1B4332]"
            text={
              <>
                <span className="font-semibold text-gray-900">{verified}</span>{' '}
                {verified === 1 ? 'section' : 'sections'} verified this week
              </>
            }
          />
          <StatusLine
            icon={AlertTriangle}
            iconCls="text-amber-500"
            text={
              <>
                <span className="font-semibold text-gray-900">{needsReview}</span>{' '}
                {needsReview === 1 ? 'section' : 'sections'} still need a check
              </>
            }
          />
          <StatusLine
            icon={Flame}
            iconCls="text-red-500"
            text={
              <>
                <span className="font-semibold text-gray-900">{overdue}</span>{' '}
                {overdue === 1 ? 'section' : 'sections'} overdue (haven't been checked in over a week)
              </>
            }
          />
        </ul>
      </div>
    </section>
  )
}

function MetaCell({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 p-3">
      <div className="w-8 h-8 rounded-lg bg-[#EDF4EC] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-[#1B4332]" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{value}</p>
      </div>
    </div>
  )
}

function StatusLine({ icon: Icon, iconCls, text }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-600">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconCls}`} />
      <span>{text}</span>
    </li>
  )
}
