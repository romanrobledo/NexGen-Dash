import { Link } from 'react-router-dom'
import {
  CalendarClock,
  ArrowRight,
  MapPin,
  Info,
} from 'lucide-react'
import { useCalendarEvents } from '../hooks/useCalendarEvents'

/**
 * Marketing → Events page — route: /marketing/events.
 *
 * Preview surface for the Events tab on the Calendars menu. Reads live
 * from `calendar_events` where calendar='events' (the same source that
 * powers /calendar?tab=events), so anything added on either surface
 * shows up here on next load. Read-only — for CRUD, users open the
 * Events tab via the header link.
 *
 * This page replaces the "Upcoming Events" block that used to live on
 * the Campaigns page. Split off so campaign planning and event
 * awareness live in dedicated menu items instead of stacking on one
 * page.
 */

export default function MarketingEventsPage() {
  const { events, loading } = useCalendarEvents('events')

  // Show every future event (from today onward), sorted by starts_at.
  // Unlike the Campaigns page preview (which capped at 5), this page IS
  // the full events surface — show all upcoming, then a separate "past"
  // section for context.
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const upcoming = (events || []).filter((e) => new Date(e.startsAt) >= now)
  const past = (events || [])
    .filter((e) => new Date(e.startsAt) < now)
    .reverse()
    .slice(0, 10)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
            <CalendarClock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Events</h2>
            <p className="text-gray-500 mt-0.5 text-sm">
              Fixed anchors — regulatory dates, observances, school-district
              milestones. Campaigns get planned around these.
            </p>
          </div>
        </div>
      </div>

      {/* Bidirectional-source explainer */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-800 leading-relaxed">
          <strong className="font-semibold">Same source as the Events tab.</strong>{' '}
          Events created / edited on <Link to="/calendar?tab=events" className="underline font-semibold">Calendars → Events</Link>{' '}
          appear here on next load, and vice versa — one table, two ways to
          reach it.
        </p>
      </div>

      {/* Upcoming section */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <CalendarClock className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900">Upcoming Events</h3>
              <p className="text-sm text-gray-500">
                Everything from today forward, sorted by date.
              </p>
            </div>
          </div>
          <Link
            to="/calendar?tab=events"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            Open Events tab
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-xs text-gray-400">
            Loading upcoming events…
          </div>
        ) : upcoming.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
              <CalendarClock className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              No upcoming events yet
            </p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Add events on the Events tab of the Calendars menu — Texas
              School Week, Space Day, Fire Prevention Week, holidays — and
              they'll appear here for campaign planning.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {upcoming.map((evt) => (
              <EventRow key={evt.id} event={evt} />
            ))}
          </ul>
        )}
      </section>

      {/* Upcoming Shot List moved to Marketing → Shot Lists menu — a
          single hub for both campaign and event shots so creators check
          one place. */}

      {/* Past section — small, for context */}
      {past.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-2xl p-5 mt-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <CalendarClock className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Recent Past Events</h3>
              <p className="text-[11px] text-gray-500">Last 10, most recent first.</p>
            </div>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {past.map((evt) => (
              <EventRow key={evt.id} event={evt} muted />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

// Upcoming Event Shot List was extracted to Marketing → Shot Lists menu.

// ─── Single row ──────────────────────────────────────────────────────────────

function EventRow({ event, muted = false }) {
  const start = new Date(event.startsAt)
  const dateLabel = start.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return (
    <li
      className={`border rounded-lg p-3 ${
        muted
          ? 'border-gray-200 bg-gray-50 opacity-75'
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
            muted ? 'bg-gray-100' : 'bg-indigo-100'
          }`}
        >
          <CalendarClock
            className={`w-4 h-4 ${muted ? 'text-gray-500' : 'text-indigo-600'}`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {event.title}
          </p>
          <p className="text-[11px] text-gray-500 tabular-nums flex items-center gap-1.5 flex-wrap">
            <span>{dateLabel}</span>
            {event.location && (
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {event.location}
              </span>
            )}
          </p>
        </div>
      </div>
    </li>
  )
}
