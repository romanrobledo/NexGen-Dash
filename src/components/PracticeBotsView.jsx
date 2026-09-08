import { Mic, Play, Lock, History } from 'lucide-react'

/**
 * Shared page shell for the "SalesAI Voice Trainer"-style practice-bots
 * pages. Rendered by:
 *   - PracticeBotsPage         (/trainings/practice)
 *   - OnboardingExercisePage   (/trainings/onboarding/exercise)
 *
 * Phase 1 (this file) is UI-only:
 *   - Start Call fires the `onStart(scenario)` callback so the parent
 *     page can log / open a modal — no live bot yet.
 *   - Recent Sessions is a placeholder empty state; Phase 2 wires it
 *     to a `practice_sessions` table.
 *
 * Layout mirrors Roman's reference screenshot, adapted to NexGen's
 * light theme (white surfaces, gray borders, blue accents). Difficulty
 * pill colors: emerald / amber / rose.
 *
 * @param {{
 *   title: string,
 *   subtitle: string,
 *   badge?: { label: string, tone?: 'red'|'blue'|'amber' } | null,
 *   scenarios: import('../lib/practiceScenarios').Scenario[],
 *   onStart?: (scenario: import('../lib/practiceScenarios').Scenario) => void,
 * }} props
 */
export default function PracticeBotsView({
  title,
  subtitle,
  badge = null,
  scenarios,
  onStart,
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Banner title={title} subtitle={subtitle} badge={badge} />
      <ScenariosSection scenarios={scenarios} onStart={onStart} />
      <RecentSessionsSection />
    </div>
  )
}

/**
 * Top banner — page title, subtitle, and optional emphasis badge
 * (e.g., "MANDATORY DAILY", "FIRST WEEK").
 */
function Banner({ title, subtitle, badge }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8 text-center">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-2xl mx-auto">{subtitle}</p>
      {badge && <BannerBadge {...badge} />}
    </div>
  )
}

function BannerBadge({ label, tone = 'red' }) {
  const styles = {
    red:   'bg-red-50    border-red-200    text-red-700',
    blue:  'bg-blue-50   border-blue-200   text-blue-700',
    amber: 'bg-amber-50  border-amber-200  text-amber-700',
  }
  return (
    <div className="mt-4 flex justify-center">
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold tracking-wider uppercase ${styles[tone]}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {label}
      </span>
    </div>
  )
}

/**
 * Scenarios grid — 1 column on mobile, up to 3 across on desktop.
 */
function ScenariosSection({ scenarios, onStart }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-5">
        <Mic className="w-4 h-4 text-blue-600" />
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Scenarios
        </h2>
      </div>
      {scenarios.length === 0 ? (
        <p className="text-sm text-gray-400 italic">
          No scenarios yet. Check back once the first drills are wired.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {scenarios.map((s) => (
            <ScenarioCard key={s.key} scenario={s} onStart={onStart} />
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * A single scenario card — title + difficulty pill on top, description
 * middle, Best score + CTA button on bottom. Card height matches within
 * a row via `flex flex-col` so the CTA row sits flush at the bottom.
 */
function ScenarioCard({ scenario, onStart }) {
  const { title, difficulty, description, status, bestScore } = scenario
  const ready = status === 'ready'
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 transition p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-bold text-gray-900 leading-snug">{title}</h3>
        <DifficultyPill difficulty={difficulty} />
      </div>
      <p className="text-xs text-gray-600 leading-relaxed mb-4 flex-1">
        {description}
      </p>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-[11px] text-gray-500">
          Best:{' '}
          <span className={bestScore != null ? 'font-bold text-gray-900' : 'text-gray-400'}>
            {bestScore != null ? bestScore : '—'}
          </span>
        </span>
        {ready ? (
          <button
            onClick={() => onStart?.(scenario)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition"
          >
            <Play className="w-3 h-3" />
            Start Call
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-[11px] font-semibold">
            <Lock className="w-3 h-3" />
            Coming Soon
          </span>
        )}
      </div>
    </div>
  )
}

function DifficultyPill({ difficulty }) {
  const styles = {
    easy:   'bg-emerald-50 border-emerald-200 text-emerald-700',
    medium: 'bg-amber-50   border-amber-200   text-amber-700',
    hard:   'bg-rose-50    border-rose-200    text-rose-700',
  }
  return (
    <span
      className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold tracking-wider uppercase ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  )
}

/**
 * Recent Sessions — Phase 1 empty state. Phase 2 replaces this with
 * a query against public.practice_sessions.
 */
function RecentSessionsSection() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-5">
        <History className="w-4 h-4 text-gray-500" />
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Recent Sessions
        </h2>
      </div>
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
        <p className="text-sm text-gray-500">No sessions yet.</p>
        <p className="text-xs text-gray-400 mt-1">
          Start a scenario above — completed calls will show up here with your score.
        </p>
      </div>
    </section>
  )
}
