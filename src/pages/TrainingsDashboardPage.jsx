import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Loader2,
  Search,
  Settings,
  Star,
  ShieldCheck,
  FileText,
  Clock,
  Users,
  MessageSquare,
  AlertTriangle,
  HandMetal,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  Heart,
} from 'lucide-react'
import { useTrainings } from '../hooks/useTrainings'
import { useViewMode } from '../contexts/ViewModeContext'

const ICON_MAP = {
  wave: HandMetal,
  shield: ShieldCheck,
  document: FileText,
  clock: Clock,
  users: Users,
  message: MessageSquare,
  alert: AlertTriangle,
  star: Star,
  book: BookOpen,
  graduation: GraduationCap,
  heart: Heart,
}

const ICON_BG = {
  wave: 'bg-purple-100 text-purple-600',
  shield: 'bg-amber-100 text-amber-600',
  document: 'bg-gray-100 text-gray-600',
  clock: 'bg-rose-100 text-rose-600',
  users: 'bg-pink-100 text-pink-600',
  message: 'bg-blue-100 text-blue-600',
  alert: 'bg-red-100 text-red-600',
  star: 'bg-yellow-100 text-yellow-600',
  book: 'bg-emerald-100 text-emerald-600',
  graduation: 'bg-indigo-100 text-indigo-600',
  heart: 'bg-rose-100 text-rose-600',
}

const TRS_LABELS = {
  'cat-1': { label: 'Staff Qualifications', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'cat-2': { label: 'Interactions (40%)', color: 'bg-green-50 text-green-700 border-green-200' },
  'cat-3': { label: 'Program Admin', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  'cat-4': { label: 'Environments', color: 'bg-orange-50 text-orange-700 border-orange-200' },
}

function getProgressColor(progress) {
  if (progress === 100) return 'bg-emerald-500'
  if (progress >= 75) return 'bg-teal-400'
  if (progress >= 40) return 'bg-amber-400'
  if (progress > 0) return 'bg-orange-400'
  return 'bg-gray-200'
}

function ProgressRing({ percentage, size = 80 }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  let strokeColor = '#14b8a6'
  if (percentage === 100) strokeColor = '#10b981'
  else if (percentage >= 75) strokeColor = '#14b8a6'
  else if (percentage >= 40) strokeColor = '#f59e0b'
  else if (percentage > 0) strokeColor = '#f97316'
  else strokeColor = '#e5e7eb'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color: strokeColor }}>
          {percentage}%
        </span>
      </div>
    </div>
  )
}

// Role Clarity is made of 11 static content pages under /dashboard/... (see
// Sidebar.jsx "Role Clarity" submenu). They don't yet have per-page progress
// tracking in the DB, so we treat the whole section as 0% complete for now.
// When we wire up visit / completion tracking we just swap the computed
// `ROLE_CLARITY_COMPLETED` value below.
const ROLE_CLARITY_TOTAL_PAGES = 11
const ROLE_CLARITY_COMPLETED = 0
// Send users to the Role Clarity landing page (mirrors the Sidebar submenu)
// rather than straight to the first content page, so they can pick which of
// the 11 questions to explore.
const ROLE_CLARITY_ENTRY = '/trainings/role-clarity'

export default function TrainingsDashboardPage() {
  const navigate = useNavigate()
  const { subjects: allSubjects, loading, error } = useTrainings(null)
  const { mobileMode } = useViewMode()
  const [activeTab, setActiveTab] = useState('todo')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter out TRS-categorized subjects (they have their own page)
  const subjects = allSubjects.filter((s) => !s.trs_category)

  // ── Category stats — used to render the To-do category tiles ─────────────
  // Onboarding: subjects with section === 'onboarding'
  const onboardingSubjects = allSubjects.filter((s) => s.section === 'onboarding')
  const onboardingSteps = onboardingSubjects.reduce((sum, s) => sum + (s.step_count || 0), 0)
  const onboardingDone  = onboardingSubjects.reduce((sum, s) => sum + (s.completed_steps || 0), 0)
  const onboardingPct   = onboardingSteps > 0
    ? Math.round((onboardingDone / onboardingSteps) * 100)
    : 0

  // TRS: subjects that have a trs_category set
  const trsSubjects = allSubjects.filter((s) => !!s.trs_category)
  const trsSteps = trsSubjects.reduce((sum, s) => sum + (s.step_count || 0), 0)
  const trsDone  = trsSubjects.reduce((sum, s) => sum + (s.completed_steps || 0), 0)
  const trsPct   = trsSteps > 0 ? Math.round((trsDone / trsSteps) * 100) : 0

  // Role Clarity: 11 static pages, no DB tracking yet.
  const roleClarityPct = ROLE_CLARITY_TOTAL_PAGES > 0
    ? Math.round((ROLE_CLARITY_COMPLETED / ROLE_CLARITY_TOTAL_PAGES) * 100)
    : 0

  const categoryTiles = [
    {
      key: 'onboarding',
      title: 'Onboarding',
      description: 'New-hire lessons to get you running.',
      icon: GraduationCap,
      iconClass: 'bg-indigo-100 text-indigo-600',
      meterClass: 'bg-indigo-500',
      completed: onboardingDone,
      total: onboardingSteps,
      unit: 'steps',
      pct: onboardingPct,
      onClick: () => navigate('/trainings/onboarding'),
    },
    {
      key: 'role-clarity',
      title: 'Role Clarity Training',
      description: 'Know your role, impact, and how we work.',
      icon: Users,
      iconClass: 'bg-pink-100 text-pink-600',
      meterClass: 'bg-pink-500',
      completed: ROLE_CLARITY_COMPLETED,
      total: ROLE_CLARITY_TOTAL_PAGES,
      unit: 'pages',
      pct: roleClarityPct,
      onClick: () => navigate(ROLE_CLARITY_ENTRY),
    },
    {
      key: 'trs',
      title: 'TRS Training',
      description: 'Texas Rising Star 4-Star compliance.',
      icon: ShieldCheck,
      iconClass: 'bg-amber-100 text-amber-600',
      meterClass: 'bg-amber-500',
      completed: trsDone,
      total: trsSteps,
      unit: 'steps',
      pct: trsPct,
      onClick: () => navigate('/trainings/trs'),
    },
  ]

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

  // Compute stats
  const totalSubjects = subjects.length
  const completedSubjects = subjects.filter((s) => s.progress === 100).length
  const todoSubjects = subjects.filter((s) => s.progress < 100)
  const avgProgress =
    totalSubjects > 0
      ? Math.round(subjects.reduce((sum, s) => sum + s.progress, 0) / totalSubjects)
      : 0
  const subjectsRemaining = totalSubjects - completedSubjects
  const totalRemainingMinutes = subjects.reduce((sum, s) => sum + s.remaining_minutes, 0)
  const readHours = Math.floor(totalRemainingMinutes / 60)
  const readMins = totalRemainingMinutes % 60

  const totalSteps = subjects.reduce((sum, s) => sum + s.step_count, 0)
  const totalCompletedSteps = subjects.reduce((sum, s) => sum + s.completed_steps, 0)

  // Filter subjects by tab
  const tabs = [
    { key: 'todo', label: 'To do', count: todoSubjects.length },
    {
      key: 'recent',
      label: 'Recent',
      count: subjects.filter((s) => s.progress > 0 && s.progress < 100).length,
    },
    { key: 'completed', label: 'Completed', count: completedSubjects },
  ]

  let filteredSubjects = subjects
  if (activeTab === 'todo') {
    filteredSubjects = subjects.filter((s) => s.progress < 100)
  } else if (activeTab === 'completed') {
    filteredSubjects = subjects.filter((s) => s.progress === 100)
  } else if (activeTab === 'recent') {
    filteredSubjects = subjects.filter((s) => s.progress > 0 && s.progress < 100)
  }

  if (searchQuery) {
    filteredSubjects = filteredSubjects.filter(
      (s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.trs_category && s.trs_category.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome to Trainings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Complete required training subjects to maintain TRS 4-Star compliance
        </p>
      </div>

      <div className={mobileMode ? 'flex flex-col gap-6' : 'flex gap-6'}>
        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trainings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            />
          </div>

          {/* Tabs */}
          <div className={`flex items-center border-b border-gray-200 mb-1 ${mobileMode ? 'gap-0 overflow-x-auto -mx-1 px-1 scrollbar-hide' : 'gap-1'}`}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`${mobileMode ? 'px-3 py-2.5 text-xs' : 'px-4 py-3 text-sm'} font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
            <div className="ml-auto flex-shrink-0">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category tiles — only on the "To do" tab. Each tile summarizes
              a training group (Onboarding / Role Clarity / TRS) with its own
              progress meter, and tapping a tile jumps to the section's
              dedicated page where individual lessons live. This replaces the
              flat list on the To-do tab so users see the high-level plan
              first, not 8 rows of onboarding lessons. */}
          {activeTab === 'todo' && (
            <div className={`grid gap-3 mb-4 ${mobileMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
              {categoryTiles.map((tile) => {
                const Icon = tile.icon
                return (
                  <button
                    key={tile.key}
                    onClick={tile.onClick}
                    className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${tile.iconClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-gray-900 truncate">
                            {tile.title}
                          </h4>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                          {tile.description}
                        </p>
                      </div>
                    </div>
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
                      {tile.completed}/{tile.total} {tile.unit} complete
                    </p>
                  </button>
                )
              })}
            </div>
          )}

          {/* Subject list — shown on Recent/Completed tabs. The To-do tab uses
              the category tiles above instead of a flat list of lessons. */}
          {activeTab !== 'todo' && (
          <div className="divide-y divide-gray-100">
            {filteredSubjects.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                {searchQuery
                  ? 'No trainings match your search.'
                  : 'No trainings in this category.'}
              </div>
            ) : (
              filteredSubjects.map((subject) => {
                const IconComponent = ICON_MAP[subject.icon] || FileText
                const iconClass = ICON_BG[subject.icon] || 'bg-gray-100 text-gray-600'
                const progressColor = getProgressColor(subject.progress)
                const trsInfo = subject.trs_category ? TRS_LABELS[subject.trs_category] : null

                if (mobileMode) {
                  return (
                    <div
                      key={subject.id}
                      onClick={() => {
                        const firstTopic = subject.topics?.[0]
                        const firstStep = firstTopic?.steps?.[0]
                        if (firstStep) {
                          navigate(`/trainings/view/${firstStep.id}`)
                        }
                      }}
                      className="py-3.5 px-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer active:bg-gray-100"
                    >
                      {/* Row 1: icon + title + chevron */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconClass}`}
                        >
                          {subject.progress === 100 ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <IconComponent className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 leading-snug">
                            {subject.title}
                          </h4>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {subject.topic_count} topics · {subject.step_count} steps · {subject.read_time}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
                      </div>
                      {/* Row 2: progress bar + % */}
                      <div className="flex items-center gap-2.5 mt-2.5 pl-12">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${progressColor}`}
                            style={{ width: `${subject.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 w-8 text-right">
                          {subject.progress}%
                        </span>
                      </div>
                      {/* Row 3: tags */}
                      {(trsInfo || subject.required_for) && (
                        <div className="flex items-center gap-1.5 mt-2 pl-12 flex-wrap">
                          {trsInfo && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${trsInfo.color}`}
                            >
                              {trsInfo.label}
                            </span>
                          )}
                          {subject.required_for && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                              <Users className="w-2.5 h-2.5" />
                              {subject.required_for}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                }

                return (
                  <div
                    key={subject.id}
                    onClick={() => {
                      // Navigate to first step of first topic
                      const firstTopic = subject.topics?.[0]
                      const firstStep = firstTopic?.steps?.[0]
                      if (firstStep) {
                        navigate(`/trainings/view/${firstStep.id}`)
                      }
                    }}
                    className="flex items-center gap-4 py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconClass}`}
                    >
                      {subject.progress === 100 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>

                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {subject.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400">
                          {subject.topic_count} topics &middot; {subject.step_count} steps
                          &middot; {subject.read_time}
                        </p>
                        {trsInfo && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${trsInfo.color}`}
                          >
                            {trsInfo.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-24 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${progressColor}`}
                          style={{ width: `${subject.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-10 text-right">
                        {subject.progress}%
                      </span>
                    </div>

                    {/* Required tag */}
                    {subject.required_for && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0 w-28">
                        <Users className="w-3.5 h-3.5" />
                        <span>Required for {subject.required_for}</span>
                      </div>
                    )}
                    {subject.section && !subject.required_for && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0 w-28">
                        <span className="capitalize">{subject.section === 'onboarding' ? 'Onboarding' : subject.section}</span>
                      </div>
                    )}

                    {/* Chevron */}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
                  </div>
                )
              })
            )}
          </div>
          )}

          {/* Showing count — only visible when the flat list is rendered
              (Recent / Completed tabs). The To-do tab shows the category
              tiles instead, so a row count wouldn't make sense there. */}
          {activeTab !== 'todo' && filteredSubjects.length > 0 && (
            <div className="text-center text-xs text-gray-400 py-4">
              Showing 1-{filteredSubjects.length} of {filteredSubjects.length}
            </div>
          )}
        </div>

        {/* Right sidebar — becomes a stacked grid on mobile */}
        <div className={mobileMode ? 'w-full space-y-4' : 'w-72 flex-shrink-0 space-y-6'}>
          {/* Progress card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Progress</h3>

            {/* User progress */}
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                R
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                <p className="font-semibold text-gray-900 text-sm">NexGen Admin</p>
                <p>
                  <span className="font-semibold text-gray-900">{avgProgress}%</span> completed
                </p>
                <p>
                  <span className="font-semibold">{subjectsRemaining}</span> subjects remaining
                </p>
                <p>
                  <span className="font-semibold">
                    {totalCompletedSteps}/{totalSteps}
                  </span>{' '}
                  steps completed
                </p>
                <p>
                  <span className="font-semibold">
                    {readHours > 0 ? `${readHours} hrs ${readMins} min` : `${readMins} min`}
                  </span>{' '}
                  reading time remaining
                </p>
              </div>
            </div>

            {/* Company progress ring */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <ProgressRing percentage={avgProgress} size={64} />
              <div>
                <p className="text-sm font-semibold text-gray-900">Company progress</p>
                <p className="text-xs text-gray-500">{avgProgress}% average completion</p>
              </div>
            </div>
          </div>

          {/* TRS Categories + Favorite Subjects cards removed — TRS progress
              now lives on the dedicated TRS landing page (/trainings/trs),
              reached via the TRS Training tile above. Per-category progress
              is surfaced there instead of in a cramped sidebar row. */}
        </div>
      </div>
    </div>
  )
}
