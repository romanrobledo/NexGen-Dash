import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  CalendarClock,
  X,
  MapPin,
  Info,
  Camera,
  Target,
  Users,
  Sparkles,
  Gift,
} from 'lucide-react'
import { useCampaigns } from '../hooks/useCampaigns'
import { useCalendarEvents } from '../hooks/useCalendarEvents'

/**
 * Marketing → Calendar — route: /marketing/calendar.
 *
 * Combined month-grid view showing campaigns AND events on one canvas.
 * Filter tabs (All / Campaigns / Events) let planners focus on either
 * axis, or see them layered together to spot conflicts.
 *
 * Data sources:
 *   - Campaigns  → public.campaigns (start_date, end_date)
 *   - Events     → public.calendar_events where calendar='events'
 *                  (same source as Marketing → Events and the top-level
 *                  Calendars → Events tab — one table, three views)
 *
 * Clicking any tile opens a right-side drawer scoped to that entity.
 * The drawer shows placeholders for the focus fields (Purpose, Audience,
 * Avatar, Brand Messaging, Offer, Targets) until Phase 2 wires the
 * structured schema; it also previews the campaign's shot list.
 */

const TABS = [
  { key: 'all',       label: 'All',        icon: CalendarDays },
  { key: 'campaigns', label: 'Campaigns',  icon: Megaphone },
  { key: 'events',    label: 'Events',     icon: CalendarClock },
]

export default function MarketingCalendarPage() {
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [activeTab, setActiveTab] = useState('all')
  const [openEntity, setOpenEntity] = useState(
    /** @type {{kind:'campaign'|'event', data:any} | null} */ (null)
  )

  const { campaigns } = useCampaigns()
  const { events } = useCalendarEvents('events')

  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  // Grid cells (7 columns * 6 rows), each tagged with which day it covers.
  const cells = useMemo(() => {
    const first = new Date(year, month, 1)
    const start = new Date(first)
    start.setDate(1 - first.getDay())
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return {
        date: d,
        inMonth: d.getMonth() === month,
        isToday: isSameDay(d, new Date()),
      }
    })
  }, [year, month])

  // Which entities land on which day? Campaign spans a range; event may
  // span multi-day too. We iterate cells and match ranges — expensive
  // for large N, fine for typical marketing volumes.
  function entitiesOnDay(date) {
    const list = []
    if (activeTab !== 'events') {
      for (const c of campaigns) {
        if (dateInRange(date, c.startDate || c.start_date, c.endDate || c.end_date)) {
          list.push({ kind: 'campaign', data: c })
        }
      }
    }
    if (activeTab !== 'campaigns') {
      for (const e of events) {
        if (dateInRange(date, e.startsAt, e.endsAt || e.startsAt)) {
          list.push({ kind: 'event', data: e })
        }
      }
    }
    return list
  }

  function monthLabel() {
    return cursor.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Marketing Calendar
            </h2>
            <p className="text-gray-500 mt-0.5 text-sm">
              Campaigns and events on one canvas. Filter to focus, or view
              layered to spot overlaps. Tap any tile for the full brief.
            </p>
          </div>
        </div>
      </div>

      {/* Explainer */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-800 leading-relaxed">
          <strong className="font-semibold">Events sync bidirectionally</strong>{' '}
          with the Marketing → Events list and the operations{' '}
          <Link to="/calendar?tab=events" className="underline font-semibold">
            Calendars → Events
          </Link>{' '}
          tab. Campaigns come from the Campaigns menu.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {TABS.map((t) => {
          const isActive = t.key === activeTab
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2 ${
                isActive
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              aria-pressed={isActive}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Month grid */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Month bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-sm font-bold text-gray-900">{monthLabel()}</h3>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="px-2 py-2 text-center">
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            const list = entitiesOnDay(cell.date)
            return (
              <div
                key={i}
                className={`min-h-[92px] border-r border-b border-gray-100 last-in-row:border-r-0 p-1.5 ${
                  cell.inMonth ? 'bg-white' : 'bg-gray-50/60'
                }`}
              >
                <p
                  className={`text-[11px] font-semibold mb-1 ${
                    cell.isToday
                      ? 'text-indigo-700'
                      : cell.inMonth
                        ? 'text-gray-700'
                        : 'text-gray-300'
                  }`}
                >
                  {cell.date.getDate()}
                </p>
                <div className="space-y-0.5">
                  {list.map((entity, j) => (
                    <EntityPill
                      key={`${entity.kind}-${entity.data.id}-${j}`}
                      entity={entity}
                      onClick={() => setOpenEntity(entity)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right-side drawer */}
      {openEntity && (
        <EntityDrawer
          entity={openEntity}
          onClose={() => setOpenEntity(null)}
        />
      )}
    </div>
  )
}

// ─── Pill on a calendar day ──────────────────────────────────────────────────

function EntityPill({ entity, onClick }) {
  const isCampaign = entity.kind === 'campaign'
  const Icon = isCampaign ? Megaphone : CalendarClock
  const label = isCampaign
    ? entity.data.name
    : entity.data.title
  return (
    <button
      onClick={onClick}
      className={`w-full text-left text-[10px] font-semibold px-1.5 py-0.5 rounded truncate flex items-center gap-1 ${
        isCampaign
          ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
          : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
      }`}
      title={label}
    >
      <Icon className="w-2.5 h-2.5 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  )
}

// ─── Right-side drawer for campaign / event details ──────────────────────────

function EntityDrawer({ entity, onClose }) {
  const isCampaign = entity.kind === 'campaign'
  const data = entity.data
  const title = isCampaign ? data.name : data.title
  const Icon = isCampaign ? Megaphone : CalendarClock
  const accent = isCampaign
    ? { text: 'text-purple-700', bg: 'bg-purple-100' }
    : { text: 'text-indigo-700', bg: 'bg-indigo-100' }

  const startLabel = isCampaign
    ? formatDate(data.startDate || data.start_date)
    : formatDate(data.startsAt)
  const endLabel = isCampaign
    ? formatDate(data.endDate || data.end_date)
    : formatDate(data.endsAt || data.startsAt)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <aside
        className="fixed right-0 top-0 h-full w-full sm:w-[520px] bg-white z-50 shadow-2xl flex flex-col"
        role="dialog"
        aria-label={`${title} details`}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-200">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent.bg}`}
          >
            <Icon className={`w-5 h-5 ${accent.text}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-[10px] uppercase tracking-wider font-bold ${accent.text}`}
            >
              {isCampaign ? 'Campaign' : 'Event'}
            </p>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {title}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {startLabel}
              {endLabel && endLabel !== startLabel && ` — ${endLabel}`}
              {!isCampaign && data.location && (
                <>
                  {' '}
                  <span className="inline-flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    {data.location}
                  </span>
                </>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* About */}
          <FocusSection
            icon={Info}
            label="About"
            content={data.description}
            emptyHint={
              isCampaign
                ? 'Campaign description not set. Add one when editing the campaign.'
                : "Event description not set. Add one when editing the event."
            }
          />

          {/* Focus — placeholder until Phase 2 schema lands */}
          <FocusPlaceholder
            icon={Target}
            label="Focus"
            hint="What this is for, why now, what success looks like."
          />

          {/* Target Audience */}
          <FocusPlaceholder
            icon={Users}
            label="Target Audience"
            hint="Members / non-members. Who we're speaking to."
          />

          {/* Avatar */}
          <FocusPlaceholder
            icon={Sparkles}
            label="Avatar"
            hint="Which customer avatar this is dialed for."
          />

          {/* Brand Messaging */}
          <FocusPlaceholder
            icon={Sparkles}
            label="Brand Messaging"
            hint="Core message, tone, do-not-say list."
          />

          {/* Offer */}
          <FocusPlaceholder
            icon={Gift}
            label="Offer"
            hint="What we're putting in front of them (giveaway, discount, event RSVP)."
          />

          {/* Targets / KPIs */}
          <FocusPlaceholder
            icon={Target}
            label="Targets"
            hint="Tour bookings, leads, reach, engagement — what we're measuring."
          />

          {/* Shot List preview */}
          <ShotListSection isCampaign={isCampaign} entityId={data.id} />
        </div>
      </aside>
    </>
  )
}

function FocusSection({ icon: Icon, label, content, emptyHint }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {label}
        </h3>
      </div>
      {content ? (
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      ) : (
        <p className="text-xs text-gray-400 italic">{emptyHint}</p>
      )}
    </section>
  )
}

function FocusPlaceholder({ icon: Icon, label, hint }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-gray-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {label}
        </h3>
      </div>
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-3">
        <p className="text-xs text-gray-500 italic leading-relaxed">
          {hint}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">
          Field lands in Phase 2 when we wire the structured focus schema.
        </p>
      </div>
    </section>
  )
}

function ShotListSection({ isCampaign, entityId }) {
  // Shot list preview stays as an empty state until shot_items query is
  // filtered by campaign_id / event_id. Kept structurally so creators
  // know this is where they'll see the shots when they land here.
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <Camera className="w-4 h-4 text-gray-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Shot List
        </h3>
      </div>
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
        <p className="text-xs text-gray-500 italic mb-2">
          No shots on the list for this {isCampaign ? 'campaign' : 'event'} yet.
        </p>
        <Link
          to="/marketing/shot-lists"
          className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 underline"
        >
          Open Shot Lists hub →
        </Link>
      </div>
    </section>
  )
}

// ─── Date helpers ────────────────────────────────────────────────────────────

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function dateInRange(target, startStr, endStr) {
  if (!startStr) return false
  const start = new Date(startStr)
  const end = endStr ? new Date(endStr) : start
  const tYear = target.getFullYear()
  const tMonth = target.getMonth()
  const tDate = target.getDate()
  const startKey = start.getFullYear() * 10000 + start.getMonth() * 100 + start.getDate()
  const endKey = end.getFullYear() * 10000 + end.getMonth() * 100 + end.getDate()
  const targetKey = tYear * 10000 + tMonth * 100 + tDate
  return targetKey >= startKey && targetKey <= endKey
}

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}
