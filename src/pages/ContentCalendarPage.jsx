import { useState } from 'react'
import { Megaphone, Plus } from 'lucide-react'

/**
 * Campaigns page (route: /calendars/content, file kept for git continuity).
 *
 * Menu label was renamed from "Content Calendar" to "Campaigns" — this
 * page is now the campaign / shot list workspace. The Upcoming Events
 * preview lives on its own Marketing → Events submenu, and the monthly
 * calendar grid + event CRUD live on Calendars → Events tab.
 *
 * Layout (top → bottom):
 *   1. Page header
 *   2. Campaigns section — tabbed by timeframe (Day / Week / Month /
 *      Quarter / Annual). Multiple campaigns can overlap within a single
 *      timeframe.
 *
 * Upcoming Shot List was removed from this page — it moved to the
 * dedicated Marketing → Shot Lists menu so content creators check one
 * place for both campaign shots and event shots.
 *
 * Future data model (Supabase, some already created):
 *   campaigns   — id, name, description, timeframe, start_date, end_date,
 *                 status, program_id  ← created
 *   shot_items  — id, campaign_id, description, shoot_date, deadline_date,
 *                 status, assigned_to  ← created (surfaced on Shot Lists)
 */

const TIMEFRAMES = [
  { key: 'day',     label: 'Daily',    hint: 'Time-sensitive posts, story series, real-time capture' },
  { key: 'week',    label: 'Weekly',   hint: 'Weekly themes, series, drip content' },
  { key: 'month',   label: 'Monthly',  hint: 'Monthly programs, promos, features' },
  { key: 'quarter', label: 'Quarterly',hint: 'Seasonal campaigns, quarterly launches' },
  { key: 'annual',  label: 'Annual',   hint: 'Year-long anchors, brand pillars' },
]

export default function ContentCalendarPage() {
  const [activeTimeframe, setActiveTimeframe] = useState('week')

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
        <p className="text-gray-500 mt-1">
          Plan campaigns, schedule shoots, and keep the whole content team on
          one page. Fixed events live under Marketing → Events; the month
          calendar view lives on Calendars → Events tab.
        </p>
      </div>

      {/* Campaigns — tabbed by timeframe */}
      <CampaignsSection
        activeTimeframe={activeTimeframe}
        onTimeframeChange={setActiveTimeframe}
      />
    </div>
  )
}

// ─── Campaigns section ───────────────────────────────────────────────────────

function CampaignsSection({ activeTimeframe, onTimeframeChange }) {
  const active = TIMEFRAMES.find((t) => t.key === activeTimeframe) || TIMEFRAMES[0]

  return (
    <section className="mt-8 bg-white border border-gray-200 rounded-2xl p-5">
      {/* Section header */}
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-5 h-5 text-purple-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900">Campaigns</h3>
            <p className="text-sm text-gray-500">
              Grouped by timeframe. Campaigns can overlap within any timeframe —
              pick the one you're focused on.
            </p>
          </div>
        </div>
        <button
          disabled
          title="Coming soon — campaigns table not yet wired to Supabase"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 text-white opacity-50 cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Timeframe tab strip */}
      <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
        {TIMEFRAMES.map((t) => {
          const isActive = t.key === activeTimeframe
          return (
            <button
              key={t.key}
              onClick={() => onTimeframeChange(t.key)}
              className={`px-3 py-2 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              aria-pressed={isActive}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-500 italic mb-4">{active.hint}</p>

      {/* Empty state (until campaigns table is wired) */}
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
          <Megaphone className="w-6 h-6 text-purple-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-1">
          No {active.label.toLowerCase()} campaigns yet
        </p>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          When you create a campaign, it'll appear here with its status, dates,
          associated program, and the shots the team needs to capture.
        </p>
      </div>
    </section>
  )
}

// Upcoming Shot List was extracted to Marketing → Shot Lists menu.
