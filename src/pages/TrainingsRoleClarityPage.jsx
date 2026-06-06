import { useNavigate } from 'react-router-dom'
import {
  Users,
  User,
  Briefcase,
  Settings2,
  Calendar,
  Heart,
  CheckCircle2,
  UsersRound,
  MessageCircle,
  MapPin,
  Target,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'

/**
 * Role Clarity landing page.
 *
 * Mirrors the Sidebar "Trainings > Role Clarity" submenu — the 11 role-clarity
 * content pages live under /dashboard/... and are just static content (no
 * DB-backed progress yet). This landing page lets a user enter the section
 * from the Trainings dashboard and pick which question to explore, instead of
 * being dropped straight into the first page.
 *
 * When we wire per-page completion tracking (e.g. a `role_clarity_progress`
 * table or localStorage visits), the `completed` flag on each tile becomes a
 * live value — for now every tile shows as "Not started".
 */

const ROLE_CLARITY_PAGES = [
  {
    label: 'Who Are We',
    description: 'The NexGen story, mission, and team identity.',
    path: '/dashboard/who-are-we',
    icon: UsersRound,
    iconClass: 'bg-purple-100 text-purple-600',
  },
  {
    label: 'Who Am I',
    description: 'Your role in the larger team picture.',
    path: '/dashboard/who-am-i',
    icon: User,
    iconClass: 'bg-indigo-100 text-indigo-600',
  },
  {
    label: 'What Do I Do',
    description: 'The core responsibilities tied to your position.',
    path: '/dashboard/what-do-i-do',
    icon: Briefcase,
    iconClass: 'bg-blue-100 text-blue-600',
  },
  {
    label: 'How Do I Do It',
    description: 'Processes and standards for doing your work well.',
    path: '/dashboard/how-do-i-do-it',
    icon: Settings2,
    iconClass: 'bg-sky-100 text-sky-600',
  },
  {
    label: 'When Do I Do It',
    description: 'Timing, rhythms, and daily/weekly cadence.',
    path: '/dashboard/when-do-i-do-it',
    icon: Calendar,
    iconClass: 'bg-teal-100 text-teal-600',
  },
  {
    label: 'Why Is It Important',
    description: 'Why your role matters to students, staff, and families.',
    path: '/dashboard/why-is-it-important',
    icon: Heart,
    iconClass: 'bg-rose-100 text-rose-600',
  },
  {
    label: 'How Do I Know I Am Doing A Good Job',
    description: 'Metrics and signals of strong performance.',
    path: '/dashboard/how-do-i-know',
    icon: CheckCircle2,
    iconClass: 'bg-emerald-100 text-emerald-600',
  },
  {
    label: 'When Do We Meet',
    description: 'Team meeting cadence and your participation.',
    path: '/dashboard/when-do-we-meet',
    icon: Users,
    iconClass: 'bg-amber-100 text-amber-600',
  },
  {
    label: 'What Do We Talk About',
    description: 'Topics we cover in our recurring meetings.',
    path: '/dashboard/what-do-we-talk-about',
    icon: MessageCircle,
    iconClass: 'bg-orange-100 text-orange-600',
  },
  {
    label: 'Where Do We Go If You Have Questions',
    description: 'Escalation paths and who to reach out to.',
    path: '/dashboard/where-to-go',
    icon: MapPin,
    iconClass: 'bg-red-100 text-red-600',
  },
  {
    label: 'What Are The Most Important Metrics',
    description: 'The numbers we track and why they matter.',
    path: '/dashboard/important-metrics',
    icon: Target,
    iconClass: 'bg-pink-100 text-pink-600',
  },
]

export default function TrainingsRoleClarityPage() {
  const navigate = useNavigate()
  const { mobileMode } = useViewMode()

  // Placeholder — all pages report as "not started" until per-page tracking
  // is wired up. The UI is already designed to light up individual tiles once
  // real completion data is available.
  const completedCount = 0
  const totalCount = ROLE_CLARITY_PAGES.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

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
          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-pink-600" />
          </div>
          <div className="min-w-0">
            <h1 className={`font-bold text-gray-900 ${mobileMode ? 'text-xl' : 'text-2xl'}`}>
              Role Clarity
            </h1>
            <p className="text-sm text-gray-500 truncate">
              Know your role, your impact, and how we operate as a team.
            </p>
          </div>
        </div>
      </div>

      {/* Progress summary */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Progress</h3>
          <span className="text-xs text-gray-400 font-medium tabular-nums">
            {completedCount}/{totalCount} pages · {pct}%
          </span>
        </div>
        <div className="bg-gray-100 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full bg-pink-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Pages in this section are currently untracked. We'll light them up as completed
          once per-page tracking is wired in.
        </p>
      </div>

      {/* Tile grid */}
      <div
        className={`grid gap-3 ${
          mobileMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {ROLE_CLARITY_PAGES.map((page, idx) => {
          const Icon = page.icon
          return (
            <button
              key={page.path}
              onClick={() => navigate(page.path)}
              className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-pink-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${page.iconClass}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 leading-snug">
                      {page.label}
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                    {page.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
