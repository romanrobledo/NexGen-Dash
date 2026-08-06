import { useState } from 'react'
import {
  Camera,
  ClipboardList,
  CheckCircle2,
  Circle,
  Megaphone,
  CalendarClock,
} from 'lucide-react'

/**
 * Marketing → Shot Lists — route: /marketing/shot-lists.
 *
 * Dedicated content-creator hub. Absorbs the two "Upcoming Shot List"
 * sections that used to live inline on the Campaigns and Events pages
 * so creators check one place instead of two.
 *
 * Two shot sources feed this queue:
 *   - Campaign shots — tied to a campaigns row (shot_items.campaign_id)
 *   - Event shots    — tied to an event row (shot_items.event_id, TBD)
 *
 * A tab strip switches the view between "All" (mixed queue sorted by
 * deadline), "Campaigns", and "Events" so creators can filter by focus.
 *
 * On mobile this page is meant to be usable from a phone while shooting —
 * a big tap target next to each shot toggles its status. Once the
 * shot_items table gets its `status` column wired we'll persist that
 * check; for now the checkbox state is local UI only.
 */

const TABS = [
  { key: 'all',       label: 'All',       icon: ClipboardList, hint: 'Everything on deck, sorted by deadline.' },
  { key: 'campaigns', label: 'Campaigns', icon: Megaphone,     hint: 'Shots tied to active campaigns.' },
  { key: 'events',    label: 'Events',    icon: CalendarClock, hint: 'Shots tied to fixed calendar events.' },
]

export default function ShotListsPage() {
  const [activeTab, setActiveTab] = useState('all')
  // Local check-off state until shot_items.status wiring lands — keys are
  // shot ids, values true if checked. Resets on refresh.
  const [checked, setChecked] = useState({})

  function toggle(shotId) {
    setChecked((prev) => ({ ...prev, [shotId]: !prev[shotId] }))
  }

  const active = TABS.find((t) => t.key === activeTab) || TABS[0]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Shot Lists
            </h2>
            <p className="text-gray-500 mt-0.5 text-sm">
              Every shot on deck for creators — one queue for campaigns + events.
              Tap a shot to check it off as you capture it.
            </p>
          </div>
        </div>
      </div>

      {/* Tab strip */}
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
                  ? 'border-amber-500 text-amber-700'
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

      <p className="text-xs text-gray-500 italic mb-4">{active.hint}</p>

      {/* Content — empty until shot_items query is wired. Once live, this
          renders a list of ShotRow entries filtered by activeTab. */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <EmptyState tabKey={activeTab} />
      </div>
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ tabKey }) {
  const copy = {
    all:       'No shots scheduled yet. When campaigns or events add shots, they land here.',
    campaigns: 'No campaign shots scheduled. Add shots to a campaign to populate this queue.',
    events:    'No event shots scheduled. Attach shots to an event to populate this queue.',
  }[tabKey] || 'No shots yet.'

  return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
        <ClipboardList className="w-7 h-7 text-amber-400" />
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">
        No shots on deck
      </p>
      <p className="text-xs text-gray-500 max-w-md mx-auto">
        {copy}
      </p>
    </div>
  )
}

// eslint-disable-next-line no-unused-vars
function ShotRow({ shot, checked, onToggle }) {
  // Ready for when the query is live. Keeping this stub so we don't have
  // to rebuild the row markup once shot_items comes online.
  const Icon = checked ? CheckCircle2 : Circle
  return (
    <li className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
      <button
        onClick={() => onToggle(shot.id)}
        className="flex-shrink-0 mt-0.5"
        aria-label={checked ? 'Mark uncaptured' : 'Mark captured'}
      >
        <Icon
          className={`w-5 h-5 ${checked ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}
        />
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold ${
            checked ? 'text-gray-400 line-through' : 'text-gray-900'
          }`}
        >
          {shot.description}
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5">
          {shot.sourceLabel} · Deadline {shot.deadlineLabel}
        </p>
      </div>
    </li>
  )
}
