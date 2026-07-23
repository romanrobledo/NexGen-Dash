import { useState } from 'react'
import {
  CalendarDays,
  School,
  Users,
  Sparkles,
  ExternalLink,
  Info,
  Link2,
  Check,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import CalendarMonthView from '../components/CalendarMonthView'

/**
 * Calendars landing page — `/calendar`.
 *
 * Two distinct kinds of calendars live here, split by the `type` field on
 * each entry:
 *
 *   1. `type: 'sync'` — Google Calendar Sync. The one and only tab that
 *      connects to an external Google account via OAuth. Its embed shows
 *      the linked user's Google Calendar. Read-only from the app's
 *      perspective (events are managed in Google).
 *
 *   2. everything else — School / Staff / Events. Fully in-app calendars.
 *      Their events live in Supabase (schema TBD) and are created/edited
 *      here by staff. No Google connection required. Each will get its
 *      own month/week view + event CRUD UI in a follow-up.
 *
 * Right now every tab renders a placeholder because neither the Google
 * OAuth nor the in-app calendar UI is built yet — but the placeholders are
 * distinct so it's obvious which piece is missing (auth wiring vs the
 * calendar UI itself).
 */

const CALENDARS = [
  // The only Google-connected tab. OAuth flow lives here; the embed shows
  // the linked user's Google Calendar (external, read-only from the app).
  {
    key: 'sync',
    type: 'sync',
    label: 'Google Calendar Sync',
    subtitle: 'Connect a Google account to view its calendar here',
    icon: Link2,
    accent: 'violet',
  },
  // The three below are in-app calendars — their events are stored in
  // Supabase and edited here by staff. They are NOT populated by the Google
  // Sync tab; each has its own event store and UI.
  {
    key: 'school',
    type: 'internal',
    label: 'School Calendar',
    subtitle: 'Term dates, closures, and school-wide events',
    icon: School,
    accent: 'indigo',
  },
  {
    key: 'staff',
    type: 'internal',
    label: 'Staff Calendar',
    subtitle: 'Shifts, PTO, training days, and staff meetings',
    icon: Users,
    accent: 'emerald',
  },
  {
    key: 'events',
    type: 'internal',
    label: 'Events',
    subtitle: 'Family events, community outreach, one-offs',
    icon: Sparkles,
    accent: 'amber',
  },
]

const ACCENTS = {
  violet:  { chip: 'bg-violet-50',  icon: 'text-violet-600',  active: 'border-violet-300 bg-violet-50/50' },
  indigo:  { chip: 'bg-indigo-50',  icon: 'text-indigo-600',  active: 'border-indigo-300 bg-indigo-50/50' },
  emerald: { chip: 'bg-emerald-50', icon: 'text-emerald-600', active: 'border-emerald-300 bg-emerald-50/50' },
  amber:   { chip: 'bg-amber-50',   icon: 'text-amber-600',   active: 'border-amber-300 bg-amber-50/50' },
}

export default function CalendarPage() {
  const { mobileMode } = useViewMode()
  const [activeKey, setActiveKey] = useState(CALENDARS[0].key)
  const active = CALENDARS.find((c) => c.key === activeKey) || CALENDARS[0]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Calendars</h2>
            <p className="text-gray-500 mt-0.5 text-sm">
              Google Calendar Sync links an external Google account. School, Staff, and Events are in-app calendars — created and edited here by anyone with access.
            </p>
          </div>
        </div>
      </div>

      <div className={`grid gap-4 ${mobileMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
        {/* Left picker column */}
        <div className="lg:col-span-1 space-y-2">
          {CALENDARS.map((cal) => {
            const a = ACCENTS[cal.accent] || ACCENTS.indigo
            const isActive = cal.key === activeKey
            const Icon = cal.icon
            return (
              <button
                key={cal.key}
                onClick={() => setActiveKey(cal.key)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-colors ${
                  isActive
                    ? a.active
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg ${a.chip} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${a.icon}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{cal.label}</p>
                  <p className="text-xs text-gray-500 truncate">{cal.subtitle}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right column — the Sync tab gets a dedicated OAuth-connect panel;
            the three internal calendars render a real month grid with event
            CRUD, filtered to the active calendar's key. */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl overflow-hidden">
          {active.type === 'sync' ? (
            <SyncPanel cal={active} />
          ) : (
            <CalendarMonthView
              calendar={active.key}
              calendarLabel={active.label}
              accent={active.accent}
            />
          )}
        </div>
      </div>

      {/* Info footer — sync integration is still open work */}
      <div className="mt-6 bg-indigo-50/60 border border-indigo-100 border-l-4 border-l-indigo-500 rounded-xl p-4 flex gap-3">
        <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600">
          <p className="font-semibold text-indigo-700 uppercase tracking-wider text-[10px] mb-1">
            Google Calendar Sync waits on OAuth
          </p>
          <p>
            The Connect button lights up once <code className="bg-white px-1 rounded text-[11px]">VITE_GOOGLE_CLIENT_ID</code>{' '}
            is set and the token exchange endpoint is live. Until then School,
            Staff, and Events are fully functional in-app calendars backed by
            the <code className="bg-white px-1 rounded text-[11px]">calendar_events</code> Supabase table.
          </p>
        </div>
      </div>
    </div>
  )
}

// Sync tab — Google Calendar connection surface. Independent from the other
// three tabs: this one connects an external Google account and renders that
// account's calendar (read-only from the app). Doesn't feed anything into
// School/Staff/Events. Once OAuth is wired, replace the disabled button
// with the connect handler and swap the placeholder body for the linked
// calendar's embed.
function SyncPanel({ cal }) {
  const a = ACCENTS[cal.accent] || ACCENTS.violet
  const Icon = cal.icon
  return (
    <div className="h-[720px] flex flex-col items-center justify-center text-center p-8">
      <div className={`w-16 h-16 rounded-2xl ${a.chip} flex items-center justify-center mb-4`}>
        <Icon className={`w-8 h-8 ${a.icon}`} />
      </div>
      <p className="text-[10px] uppercase tracking-wider font-bold text-violet-600 mb-1">
        Not connected
      </p>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{cal.label}</h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        Connect a Google account and its calendar renders here. Independent of
        the School / Staff / Events tabs — those are separate in-app calendars
        with their own events.
      </p>

      {/* Disabled connect button — flip to an onClick handler that kicks off
          the OAuth redirect once VITE_GOOGLE_CLIENT_ID is wired. */}
      <button
        disabled
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold shadow-sm opacity-50 cursor-not-allowed"
      >
        <Link2 className="w-4 h-4" />
        Connect Google Calendar
      </button>
      <p className="text-[11px] text-gray-400 mt-2 italic">
        OAuth flow coming — button lights up once auth is wired.
      </p>

      {/* What connecting does — sets expectations without over-promising */}
      <div className="mt-8 w-full max-w-md text-left">
        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">
          What connecting does
        </p>
        <ul className="space-y-1.5">
          {[
            { name: 'Read the linked account’s calendar', desc: 'Embed renders here inside this tab' },
            { name: 'One account at a time', desc: 'Re-connect to switch to a different Google account' },
            { name: 'No effect on other tabs', desc: 'School / Staff / Events stay in-app, edited by staff' },
          ].map((item) => (
            <li
              key={item.name}
              className="flex items-start gap-2.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
            >
              <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 text-gray-300" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800">{item.name}</p>
                <p className="text-[11px] text-gray-500">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <a
        href="https://calendar.google.com/"
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-violet-600 font-medium"
      >
        Open Google Calendar in a new tab
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  )
}
