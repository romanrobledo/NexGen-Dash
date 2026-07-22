import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Loader2,
  ShieldCheck,
  GraduationCap,
  ChevronRight,
  Briefcase,
  ClipboardList,
} from 'lucide-react'
import { useTrainings } from '../hooks/useTrainings'
import { useViewMode } from '../contexts/ViewModeContext'
import { useAuth } from '../contexts/AuthContext'

/**
 * Trainings dashboard — `/trainings`.
 *
 * Intentionally simple: a header, one overall progress bar, and a grid of
 * category tiles. No tabs, no search, no flat lesson list. The Trainings
 * sidebar entry is a leaf, so this page IS the navigation surface for the
 * entire trainings section — every category opens from one of these tiles.
 *
 * Each tile carries its own progress meter so a teacher can scan their
 * remaining work at a glance. For categories backed by `training_subjects`
 * (Onboarding, TRS) we compute progress live. For not-yet-tracked
 * categories (How To's, the four Team tracks) we show 0% / "tracking
 * coming soon" without breaking the visual rhythm of the page — every
 * tile looks the same.
 *
 * To add a new category, add an entry to CATEGORIES below — `path` is where
 * the tile navigates, `getStats(allSubjects)` returns `{ done, total, unit }`.
 * No other plumbing needed.
 *
 * Role Clarity used to live here as a tile; it moved to the top-level
 * Org Chart menu because it's org-structure content, not training. Its
 * page + route (/trainings/role-clarity) stayed put for URL stability.
 */

/**
 * @typedef {Object} CategoryStat
 * @property {number} done    Completed units
 * @property {number} total   Total units (0 means "no data yet" → tile shows hint)
 * @property {string} unit    Human-readable unit name (steps / pages / modules)
 */

// `permissionKey` on each entry maps to the matching `TRAINING_PERMISSIONS`
// row in src/lib/trainingPermissions.js. The dashboard filters tiles by
// `hasPermission(tile.permissionKey)` before render — so an admin who turns
// "Team Revenue" OFF for the `teacher` role causes the Team Revenue tile to
// disappear from that teacher's `/trainings` view (and from the overall
// progress math).
const CATEGORIES = [
  {
    key: 'onboarding',
    permissionKey: 'training_onboarding',
    title: 'Onboarding',
    description: 'New-hire lessons to get up to speed quickly.',
    icon: GraduationCap,
    iconClass: 'bg-indigo-100 text-indigo-600',
    meterClass: 'bg-indigo-500',
    path: '/trainings/onboarding',
    getStats: (allSubjects) => {
      const subs = allSubjects.filter((s) => s.section === 'onboarding')
      const total = subs.reduce((sum, s) => sum + (s.step_count || 0), 0)
      const done = subs.reduce((sum, s) => sum + (s.completed_steps || 0), 0)
      return { done, total, unit: 'steps' }
    },
  },
  {
    key: 'trs',
    permissionKey: 'training_trs',
    title: 'TRS',
    description: 'Texas Rising Star 4-Star compliance across all categories.',
    icon: ShieldCheck,
    iconClass: 'bg-amber-100 text-amber-600',
    meterClass: 'bg-amber-500',
    path: '/trainings/trs',
    getStats: (allSubjects) => {
      const subs = allSubjects.filter((s) => !!s.trs_category)
      const total = subs.reduce((sum, s) => sum + (s.step_count || 0), 0)
      const done = subs.reduce((sum, s) => sum + (s.completed_steps || 0), 0)
      return { done, total, unit: 'steps' }
    },
  },
  // Rename history: "Team Fulfillment" → "Teachers". Key, permissionKey,
  // and path stayed the same so existing role_permissions rows and any
  // deep links to /trainings/fulfillment keep working; only the label
  // changed to reflect the audience (classroom teachers).
  {
    key: 'team-fulfillment',
    permissionKey: 'training_team_fulfillment',
    title: 'Teachers',
    description: 'Classroom-specific training for every age group.',
    icon: Briefcase,
    iconClass: 'bg-emerald-100 text-emerald-600',
    meterClass: 'bg-emerald-500',
    path: '/trainings/fulfillment',
    getStats: () => ({ done: 0, total: 0, unit: 'modules' }),
  },
  // Rename history: "Team Administration" → "Administration". Same
  // key/permission/path preservation as Teachers above.
  {
    key: 'team-administration',
    permissionKey: 'training_team_administration',
    title: 'Administration',
    description: 'Admin processes, policies, and operations.',
    icon: ClipboardList,
    iconClass: 'bg-purple-100 text-purple-600',
    meterClass: 'bg-purple-500',
    path: '/trainings/admin',
    getStats: () => ({ done: 0, total: 0, unit: 'modules' }),
  },
  // "Team Improvement" and "Team Revenue" tiles removed — Vivid Digital
  // and Bizsync handle those workstreams externally, so the center
  // doesn't need in-house training tracks for them. Routes /trainings/
  // support and /trainings/sales are still registered in App.jsx so
  // deep links don't 404 for now; can be pruned in a future cleanup.
]

export default function TrainingsDashboardPage() {
  const navigate = useNavigate()
  const { mobileMode } = useViewMode()
  const { hasPermission } = useAuth()
  const { subjects: allSubjects, loading, error } = useTrainings(null)

  // Resolve each category's stats once per fetch, then filter out tiles this
  // role isn't permitted to see. The permission check happens AFTER stats so
  // hidden categories don't even show up in the overall progress math —
  // otherwise a teacher who can't see Team Revenue would still see their
  // overall % dragged down by trainings they're not assigned.
  const tiles = useMemo(
    () =>
      CATEGORIES.filter((cat) => hasPermission(cat.permissionKey)).map(
        (cat) => {
          const stats = cat.getStats(allSubjects)
          const pct =
            stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
          return { ...cat, ...stats, pct }
        }
      ),
    // hasPermission is a closure over `permissions` state which already
    // triggers re-renders on change, but we list `allSubjects` explicitly so
    // ESLint's exhaustive-deps lint is happy.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSubjects, hasPermission]
  )

  // Overall progress = sum of all known DONE units / sum of all known TOTAL
  // units across categories that have data. Categories with total=0 are
  // excluded so they don't drag the percentage down before they're seeded.
  const { overallDone, overallTotal, overallPct } = useMemo(() => {
    let done = 0
    let total = 0
    for (const t of tiles) {
      if (t.total > 0) {
        done += t.done
        total += t.total
      }
    }
    return {
      overallDone: done,
      overallTotal: total,
      overallPct: total > 0 ? Math.round((done / total) * 100) : 0,
    }
  }, [tiles])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <h3 className="font-semibold mb-1">Error loading trainings</h3>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className={mobileMode ? '' : 'max-w-6xl mx-auto'}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-sm">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className={`font-bold text-gray-900 ${mobileMode ? 'text-xl' : 'text-2xl'}`}>
            Trainings
          </h1>
          <p className="text-sm text-gray-500">
            Pick a track to dive in. Your progress lives on each tile.
          </p>
        </div>
      </div>

      {/* Overall progress strip */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Overall Progress</h3>
          <span className="text-xs text-gray-400 font-medium tabular-nums">
            {overallTotal > 0
              ? `${overallDone}/${overallTotal} · ${overallPct}%`
              : 'Tracking coming soon'}
          </span>
        </div>
        <div className="bg-gray-100 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Computed across every category that's already tracked. Categories
          marked "tracking coming soon" aren't counted yet.
        </p>
      </div>

      {/* Empty state — surfaces when a role has every training category
          turned OFF in role_permissions. Without this, the page would render
          a blank grid and look broken. */}
      {tiles.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <GraduationCap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">
            No trainings assigned to your role yet
          </p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            An admin can grant access from Admin → Permissions by opening the
            gear icon in the Trainings column for your role.
          </p>
        </div>
      )}

      {/* Category tile grid */}
      <div
        className={`grid gap-3 ${
          mobileMode
            ? 'grid-cols-1'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {tiles.map((tile) => {
          const Icon = tile.icon
          const hasData = tile.total > 0
          return (
            <button
              key={tile.key}
              onClick={() => navigate(tile.path)}
              className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${tile.iconClass}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-gray-900 leading-snug">
                      {tile.title}
                    </h4>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                    {tile.description}
                  </p>
                </div>
              </div>

              {/* Progress meter — even untracked categories show an empty
                  bar so every tile has the same visual rhythm. */}
              <div className="flex items-center gap-2.5">
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${tile.meterClass}`}
                    style={{ width: `${tile.pct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 tabular-nums w-10 text-right">
                  {tile.pct}%
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 tabular-nums">
                {hasData
                  ? `${tile.done}/${tile.total} ${tile.unit} complete`
                  : 'Tracking coming soon'}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
