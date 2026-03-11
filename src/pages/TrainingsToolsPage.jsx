import { useState } from 'react'
import {
  Loader2,
  Search,
  BookOpen,
  FileText,
  PlayCircle,
  Clock,
  ChevronRight,
  Star,
  X,
  CheckCircle2,
  Filter,
  Grid3X3,
  List,
  Heart,
  HandMetal,
  ShieldCheck,
  Users,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react'
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
  book: BookOpen,
}

const CARD_COLORS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-emerald-500 to-emerald-600',
  'from-orange-500 to-orange-600',
  'from-pink-500 to-pink-600',
  'from-indigo-500 to-indigo-600',
  'from-teal-500 to-teal-600',
  'from-rose-500 to-rose-600',
  'from-amber-500 to-amber-600',
  'from-cyan-500 to-cyan-600',
]

const TRS_FILTERS = [
  { key: 'all', label: 'All Tools' },
  { key: 'cat-2', label: 'Interactions' },
  { key: 'cat-4', label: 'Environments' },
  { key: 'cat-3', label: 'Admin' },
]

const STATIC_TOOLS = [
  {
    id: 'static-bizsync',
    title: 'Bizsync',
    description: 'How to use Bizsync for business operations and team coordination',
    trs_category: 'all',
    icon: 'star',
    section: 'tools',
    required_for: 'Leadership',
    order_index: 11,
    topic_count: 0,
    step_count: 0,
    completed_steps: 0,
    progress: 0,
    total_minutes: 0,
    remaining_minutes: 0,
    read_time: 'Coming soon',
    topics: [],
  },
  {
    id: 'static-slack',
    title: 'Slack',
    description: 'How to use Slack for internal team communication and collaboration',
    trs_category: 'all',
    icon: 'message',
    section: 'tools',
    required_for: 'Everyone',
    order_index: 12,
    topic_count: 0,
    step_count: 0,
    completed_steps: 0,
    progress: 0,
    total_minutes: 0,
    remaining_minutes: 0,
    read_time: 'Coming soon',
    topics: [],
  },
]

export default function TrainingsToolsPage() {
  const { loading, error } = useTrainings('tools')
  // All original DB tools moved to How To's — Tools now only shows these static items
  const subjects = [...STATIC_TOOLS]
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedTool, setSelectedTool] = useState(null)
  const [favorites, setFavorites] = useState(new Set())

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

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
        <h3 className="font-semibold mb-1">Error loading tools</h3>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  // Filter subjects
  let filteredTools = subjects
  if (activeFilter !== 'all') {
    filteredTools = filteredTools.filter((s) => s.trs_category === activeFilter)
  }
  if (searchQuery) {
    filteredTools = filteredTools.filter(
      (s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }

  const totalSteps = subjects.reduce((sum, s) => sum + s.step_count, 0)
  const completedSteps = subjects.reduce((sum, s) => sum + s.completed_steps, 0)

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tools</h2>
        <p className="text-sm text-gray-500 mt-1">
          Resource library — reference guides, templates, and best practices
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span>
            <span className="font-semibold">{subjects.length}</span> tools available
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="w-4 h-4 text-emerald-500" />
          <span>
            <span className="font-semibold">{totalSteps}</span> resources
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle2 className="w-4 h-4 text-teal-500" />
          <span>
            <span className="font-semibold">{completedSteps}</span> completed
          </span>
        </div>
      </div>

      {/* Search + filters bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          />
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {TRS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeFilter === f.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tools grid/list */}
      {filteredTools.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            {searchQuery ? 'No tools match your search.' : 'No tools available in this category.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-3 gap-5">
          {filteredTools.map((tool, idx) => {
            const IconComponent = ICON_MAP[tool.icon] || BookOpen
            const colorClass = CARD_COLORS[idx % CARD_COLORS.length]
            const isFav = favorites.has(tool.id)

            return (
              <div
                key={tool.id}
                onClick={() => setSelectedTool(tool)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Color header */}
                <div className={`bg-gradient-to-r ${colorClass} px-5 py-6 relative`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(tool.id)
                    }}
                    className="absolute top-3 right-3 p-1 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFav ? 'fill-white text-white' : 'text-white/70'
                      }`}
                    />
                  </button>
                  <IconComponent className="w-8 h-8 text-white/90 mb-3" />
                  <h3 className="text-white font-semibold text-sm leading-tight">{tool.title}</h3>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 min-h-[2rem]">
                    {tool.description || 'Training resource'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {tool.step_count} steps
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tool.read_time.replace('~', '')}
                      </span>
                    </div>
                    {tool.progress > 0 && (
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          tool.progress === 100
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {tool.progress}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List view */
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filteredTools.map((tool, idx) => {
            const IconComponent = ICON_MAP[tool.icon] || BookOpen
            const colorClass = CARD_COLORS[idx % CARD_COLORS.length]

            return (
              <div
                key={tool.id}
                onClick={() => setSelectedTool(tool)}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colorClass} flex items-center justify-center flex-shrink-0`}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900">{tool.title}</h4>
                  <p className="text-xs text-gray-400 truncate">
                    {tool.description || 'Training resource'}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{tool.step_count} steps</span>
                  <span>{tool.read_time.replace('~', '')}</span>
                  {tool.progress > 0 && (
                    <span className="font-medium text-blue-600">{tool.progress}%</span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            )
          })}
        </div>
      )}

      {/* Tool detail modal (slide-over) */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedTool(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-full max-w-xl bg-white shadow-xl overflow-y-auto animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900">{selectedTool.title}</h3>
              <button
                onClick={() => setSelectedTool(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-6">
              <p className="text-sm text-gray-600 mb-6">
                {selectedTool.description || 'Training resource'}
              </p>

              <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {selectedTool.step_count} steps
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedTool.read_time}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Required for {selectedTool.required_for}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">
                    {selectedTool.completed_steps}/{selectedTool.step_count} steps
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${selectedTool.progress}%` }}
                  />
                </div>
              </div>

              {/* Topics and steps */}
              <div className="space-y-4">
                {(selectedTool.topics || []).map((topic) => (
                  <div key={topic.id} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">{topic.title}</h4>
                    <div className="space-y-2">
                      {(topic.steps || []).map((step) => (
                        <div
                          key={step.id}
                          className="flex items-center gap-3 bg-white rounded-lg px-3 py-2.5 border border-gray-100"
                        >
                          {step.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${
                                step.completed
                                  ? 'text-gray-400 line-through'
                                  : 'text-gray-700'
                              }`}
                            >
                              {step.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
                            {step.video_url && <PlayCircle className="w-3.5 h-3.5 text-blue-400" />}
                            {step.pdf_url && <FileText className="w-3.5 h-3.5 text-red-400" />}
                            {step.estimated_minutes && <span>{step.estimated_minutes}m</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.25s ease-out;
        }
      `}</style>
    </div>
  )
}
