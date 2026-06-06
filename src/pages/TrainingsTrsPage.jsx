import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Users,
  MessageSquare,
  FileText,
  Home,
  ChevronRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { useTrainings } from '../hooks/useTrainings'

/**
 * TRS landing page.
 *
 * Mirrors the Sidebar "Trainings > TRS" submenu — the 4 TRS category pages
 * are registered under /trainings/:category/:subcategory and handled by
 * TrainingCategoryPage. This landing page lets a user jump into TRS from the
 * Trainings dashboard tile and pick which TRS category to explore instead of
 * being dropped straight into Cat 1.
 *
 * Progress is computed live from `training_subjects` where `trs_category`
 * matches — so each category tile shows the real % complete pulled from the
 * same rows the main Trainings dashboard uses.
 */

const TRS_CATEGORIES = [
  {
    key: 'cat-1',
    label: 'Cat 1 — Staff Qualifications',
    description: 'Credentials, training hours, and ongoing professional development.',
    path: '/trainings/trs/cat-1',
    icon: Users,
    iconClass: 'bg-blue-100 text-blue-600',
    meterClass: 'bg-blue-500',
  },
  {
    key: 'cat-2',
    label: 'Cat 2 — Interactions',
    description: 'Teacher-child interactions (weighted 40% of TRS score).',
    path: '/trainings/trs/cat-2',
    icon: MessageSquare,
    iconClass: 'bg-green-100 text-green-600',
    meterClass: 'bg-green-500',
  },
  {
    key: 'cat-3',
    label: 'Cat 3 — Program Admin',
    description: 'Policies, record-keeping, and parent involvement.',
    path: '/trainings/trs/cat-3',
    icon: FileText,
    iconClass: 'bg-purple-100 text-purple-600',
    meterClass: 'bg-purple-500',
  },
  {
    key: 'cat-4',
    label: 'Cat 4 — Environments',
    description: 'Indoor and outdoor classroom environment standards.',
    path: '/trainings/trs/cat-4',
    icon: Home,
    iconClass: 'bg-orange-100 text-orange-600',
    meterClass: 'bg-orange-500',
  },
]

export default function TrainingsTrsPage() {
  const navigate = useNavigate()
  const { mobileMode } = useViewMode()
  const { subjects, loading } = useTrainings(null)

  // Roll up per-category progress from the same training_subjects data the
  // main Trainings dashboard uses, so the % here matches what the dashboard
  // tile shows.
  const categoryStats = TRS_CATEGORIES.map((cat) => {
    const catSubjects = subjects.filter((s) => s.trs_category === cat.key)
    const totalSteps = catSubjects.reduce((sum, s) => sum + (s.step_count || 0), 0)
    const doneSteps = catSubjects.reduce((sum, s) => sum + (s.completed_steps || 0), 0)
    const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0
    return { ...cat, totalSteps, doneSteps, pct }
  })

  const totalSteps = categoryStats.reduce((sum, c) => sum + c.totalSteps, 0)
  const doneSteps = categoryStats.reduce((sum, c) => sum + c.doneSteps, 0)
  const overallPct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0

  return (
    <div className={mobileMode ? '' : 'max-w-5xl mx-auto'}>
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/trainings')}
          className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Back to Trainings"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <h1 className={`font-bold text-gray-900 ${mobileMode ? 'text-xl' : 'text-2xl'}`}>
              TRS Training
            </h1>
            <p className="text-sm text-gray-500 truncate">
              Texas Rising Star 4-Star compliance across all four categories.
            </p>
          </div>
        </div>
      </div>

      {/* Progress summary */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Overall TRS Progress</h3>
          <span className="text-xs text-gray-400 font-medium tabular-nums">
            {doneSteps}/{totalSteps} steps · {overallPct}%
          </span>
        </div>
        <div className="bg-gray-100 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full bg-amber-500 transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* Category tiles */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
        </div>
      ) : (
        <div
          className={`grid gap-3 ${
            mobileMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
          }`}
        >
          {categoryStats.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.key}
                onClick={() => navigate(cat.path)}
                className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-amber-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.iconClass}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-gray-900 leading-snug">
                        {cat.label}
                      </h4>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${cat.meterClass}`}
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 tabular-nums w-10 text-right">
                    {cat.pct}%
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 tabular-nums">
                  {cat.doneSteps}/{cat.totalSteps} steps complete
                </p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
