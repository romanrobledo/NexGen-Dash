import { useState } from 'react'
import {
  CalendarDays,
  School,
  Users,
  Sparkles,
  ExternalLink,
  Info,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'

/**
 * Calendar landing page — `/calendar`.
 *
 * Layout: left column of clickable calendar tabs (School / Staff / Events),
 * right column reserved for the Google Calendar iframe embed (per-calendar
 * URL slots into the src when the integration lands).
 *
 * The sidebar no longer nests School / Staff / Events under Calendars —
 * they live inside this page so navigation is one click deep instead of
 * two, and switching between calendars doesn't force a full page load.
 */

const CALENDARS = [
  {
    key: 'school',
    label: 'School Calendar',
    subtitle: 'Term dates, closures, and school-wide events',
    icon: School,
    accent: 'indigo',
    // Placeholder — swap in the real Google Calendar embed URL when
    // integration is wired up. See notes at the bottom of the file.
    embedSrc: null,
  },
  {
    key: 'staff',
    label: 'Staff Calendar',
    subtitle: 'Shifts, PTO, training days, and staff meetings',
    icon: Users,
    accent: 'emerald',
    embedSrc: null,
  },
  {
    key: 'events',
    label: 'Events',
    subtitle: 'Family events, community outreach, one-offs',
    icon: Sparkles,
    accent: 'amber',
    embedSrc: null,
  },
]

const ACCENTS = {
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
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Calendar</h2>
            <p className="text-gray-500 mt-0.5 text-sm">
              School, staff, and events in one place. Google Calendar embed lands here once auth is wired up.
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

        {/* Right embed column */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl overflow-hidden">
          {active.embedSrc ? (
            <iframe
              title={`${active.label} embed`}
              src={active.embedSrc}
              className="w-full h-[720px] border-0"
            />
          ) : (
            <EmbedPlaceholder cal={active} />
          )}
        </div>
      </div>

      {/* Info footer */}
      <div className="mt-6 bg-indigo-50/60 border border-indigo-100 border-l-4 border-l-indigo-500 rounded-xl p-4 flex gap-3">
        <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600">
          <p className="font-semibold text-indigo-700 uppercase tracking-wider text-[10px] mb-1">
            Integration coming
          </p>
          <p>
            When Google Calendar is connected, each tab above will drop the corresponding calendar's{' '}
            <code className="bg-white px-1 rounded text-[11px]">embedSrc</code>{' '}
            into the panel on the right. Add the calendar's public embed URL to{' '}
            <code className="bg-white px-1 rounded text-[11px]">CALENDARS</code> in CalendarPage.jsx to light it up.
          </p>
        </div>
      </div>
    </div>
  )
}

function EmbedPlaceholder({ cal }) {
  const a = ACCENTS[cal.accent] || ACCENTS.indigo
  const Icon = cal.icon
  return (
    <div className="h-[720px] flex flex-col items-center justify-center text-center p-8">
      <div className={`w-16 h-16 rounded-2xl ${a.chip} flex items-center justify-center mb-4`}>
        <Icon className={`w-8 h-8 ${a.icon}`} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{cal.label}</h3>
      <p className="text-sm text-gray-500 max-w-md">
        {cal.subtitle}. Google Calendar embed will render here once the calendar's public URL is added.
      </p>
      <a
        href="https://calendar.google.com/"
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
      >
        Open Google Calendar
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  )
}
