import { useState } from 'react'
import { Loader2, Search, Settings, Star, ShieldCheck, FileText, Clock, Users, MessageSquare, AlertTriangle, HandMetal } from 'lucide-react'
import { useTrainings } from '../hooks/useTrainings'

const ICON_MAP = {
  wave: HandMetal,
  shield: ShieldCheck,
  document: FileText,
  clock: Clock,
  users: Users,
  message: MessageSquare,
  alert: AlertTriangle,
  star: Star,
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
}

function getProgressColor(progress) {
  if (progress >= 75) return 'bg-teal-400'
  if (progress >= 40) return 'bg-amber-400'
  if (progress > 0) return 'bg-orange-400'
  return 'bg-gray-200'
}

function ProgressRing({ percentage, size = 80 }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

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
          stroke="#14b8a6"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-teal-600">{percentage}%</span>
      </div>
    </div>
  )
}

export default function TrainingsDashboardPage() {
  const { subjects, loading, error } = useTrainings()
  const [activeTab, setActiveTab] = useState('todo')
  const [searchQuery, setSearchQuery] = useState('')

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
  const avgProgress = totalSubjects > 0
    ? Math.round(subjects.reduce((sum, s) => sum + s.progress, 0) / totalSubjects)
    : 0
  const subjectsRemaining = totalSubjects - completedSubjects
  const totalReadMinutes = subjects
    .filter((s) => s.progress < 100)
    .reduce((sum, s) => {
      const match = s.read_time.match(/(\d+)/)
      return sum + (match ? parseInt(match[1]) : 0)
    }, 0)
  const readHours = Math.floor(totalReadMinutes / 60)
  const readMins = totalReadMinutes % 60

  // Filter subjects by tab
  const tabs = [
    { key: 'todo', label: 'To do', count: todoSubjects.length },
    { key: 'recent', label: 'Recent', count: subjects.filter((s) => s.progress > 0 && s.progress < 100).length },
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
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome to Trainings</h2>
      </div>

      <div className="flex gap-6">
        {/* Main content area */}
        <div className="flex-1">
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
          <div className="flex items-center gap-1 border-b border-gray-200 mb-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
            <div className="ml-auto">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subject list */}
          <div className="divide-y divide-gray-100">
            {filteredSubjects.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                {searchQuery ? 'No trainings match your search.' : 'No trainings in this category.'}
              </div>
            ) : (
              filteredSubjects.map((subject) => {
                const IconComponent = ICON_MAP[subject.icon] || FileText
                const iconClass = ICON_BG[subject.icon] || 'bg-gray-100 text-gray-600'
                const progressColor = getProgressColor(subject.progress)

                return (
                  <div
                    key={subject.id}
                    className="flex items-center gap-4 py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconClass}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {subject.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {subject.category} &middot; {subject.read_time}
                      </p>
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
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0 w-32">
                      <Users className="w-3.5 h-3.5" />
                      <span>Required for {subject.required_for}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Showing count */}
          {filteredSubjects.length > 0 && (
            <div className="text-center text-xs text-gray-400 py-4">
              Showing 1-{filteredSubjects.length} of {filteredSubjects.length}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="w-72 flex-shrink-0 space-y-6">
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
                <p><span className="font-semibold text-gray-900">{completedSubjects > 0 ? Math.round((completedSubjects / totalSubjects) * 100) : avgProgress}%</span> completed</p>
                <p><span className="font-semibold">{subjectsRemaining}</span> subjects remaining</p>
                <p><span className="font-semibold">0</span> tests remaining</p>
                <p><span className="font-semibold">{readHours > 0 ? `${readHours} hrs ${readMins} min` : `${readMins} min`}</span> reading time remaining</p>
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

          {/* Favorite subjects */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Favorite subjects</h3>
            <div className="space-y-2.5">
              {subjects
                .filter((s) => s.progress >= 75)
                .slice(0, 3)
                .map((s) => (
                  <div key={s.id} className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center">
                      <Star className="w-3 h-3 text-pink-500" />
                    </div>
                    <span className="text-sm text-gray-700 truncate">{s.title}</span>
                  </div>
                ))}
              {subjects.filter((s) => s.progress >= 75).length === 0 && (
                <p className="text-xs text-gray-400">Complete trainings to see favorites here</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
