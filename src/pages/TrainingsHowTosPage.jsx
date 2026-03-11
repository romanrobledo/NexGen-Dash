import { useState } from 'react'
import {
  Loader2,
  Search,
  ChevronDown,
  ChevronRight,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  PlayCircle,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Star,
  ShieldCheck,
  Users,
  MessageSquare,
  AlertTriangle,
  HandMetal,
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

const CATEGORY_COLORS = {
  'cat-1': 'border-l-blue-500',
  'cat-2': 'border-l-green-500',
  'cat-3': 'border-l-purple-500',
  'cat-4': 'border-l-orange-500',
  default: 'border-l-gray-300',
}

const STATIC_HOWTOS = [
  {
    id: 'static-facebook-ads',
    title: 'Facebook Ads',
    description: 'How to create, manage, and optimize Facebook ad campaigns for enrollment and brand awareness',
    trs_category: 'all',
    icon: 'star',
    section: 'howtos',
    required_for: 'Marketing',
    order_index: 6,
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
    id: 'static-google-ads',
    title: 'Google Ads',
    description: 'How to set up and run Google ad campaigns to drive enrollment leads and local visibility',
    trs_category: 'all',
    icon: 'star',
    section: 'howtos',
    required_for: 'Marketing',
    order_index: 7,
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

export default function TrainingsHowTosPage() {
  const { subjects: dbHowtos, loading: loadingHowtos, error: errorHowtos } = useTrainings('howtos')
  const { subjects: dbTools, loading: loadingTools, error: errorTools } = useTrainings('tools')
  const loading = loadingHowtos || loadingTools
  const error = errorHowtos || errorTools
  // DB tools moved here from Tools page + static howtos
  const subjects = [...dbHowtos, ...dbTools, ...STATIC_HOWTOS]
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSubjects, setExpandedSubjects] = useState({})
  const [expandedSteps, setExpandedSteps] = useState({})
  const [feedback, setFeedback] = useState({}) // { stepId: 'up' | 'down' }

  const toggleSubject = (id) => {
    setExpandedSubjects((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleStep = (id) => {
    setExpandedSteps((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleFeedback = (stepId, type) => {
    setFeedback((prev) => ({ ...prev, [stepId]: type }))
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
        <h3 className="font-semibold mb-1">Error loading how-to guides</h3>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  // If no howtos subjects exist yet, show all subjects as knowledge base
  const allSubjects = subjects.length > 0 ? subjects : []

  // Search across subjects, topics, and steps
  let filteredSubjects = allSubjects
  if (searchQuery) {
    filteredSubjects = allSubjects
      .map((subject) => {
        const matchesSubject = subject.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchingTopics = (subject.topics || [])
          .map((topic) => {
            const matchesTopic = topic.title.toLowerCase().includes(searchQuery.toLowerCase())
            const matchingSteps = (topic.steps || []).filter(
              (step) =>
                step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (step.content_html &&
                  step.content_html.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            if (matchesTopic || matchingSteps.length > 0) {
              return { ...topic, steps: matchesTopic ? topic.steps : matchingSteps }
            }
            return null
          })
          .filter(Boolean)

        if (matchesSubject || matchingTopics.length > 0) {
          return {
            ...subject,
            topics: matchesSubject ? subject.topics : matchingTopics,
          }
        }
        return null
      })
      .filter(Boolean)
  }

  // Count all how-to articles
  const totalArticles = allSubjects.reduce(
    (sum, s) => sum + (s.topics || []).reduce((tSum, t) => tSum + (t.steps || []).length, 0),
    0
  )

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">How To's</h2>
        <p className="text-sm text-gray-500 mt-1">
          Searchable knowledge base — find procedures, instructions, and guidelines
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6 max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search how-to guides, procedures, policies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-6 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-blue-500" />
          {filteredSubjects.length} categories
        </span>
        <span className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-emerald-500" />
          {totalArticles} articles
        </span>
      </div>

      {/* Empty state */}
      {filteredSubjects.length === 0 ? (
        <div className="py-16 text-center">
          <HelpCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          {searchQuery ? (
            <>
              <p className="text-sm text-gray-500 font-medium">No results found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try different keywords or browse all categories
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 font-medium">No how-to guides yet</p>
              <p className="text-xs text-gray-400 mt-1">
                How-to guides will appear here as they are added
              </p>
            </>
          )}
        </div>
      ) : (
        /* Accordion knowledge base */
        <div className="space-y-4 max-w-4xl">
          {filteredSubjects.map((subject) => {
            const isExpanded = expandedSubjects[subject.id]
            const IconComponent = ICON_MAP[subject.icon] || BookOpen
            const borderColor =
              CATEGORY_COLORS[subject.trs_category] || CATEGORY_COLORS.default

            return (
              <div
                key={subject.id}
                className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderColor} overflow-hidden`}
              >
                {/* Subject header (accordion toggle) */}
                <button
                  onClick={() => toggleSubject(subject.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">{subject.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {subject.description ||
                        `${subject.topic_count} topics · ${subject.step_count} articles`}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 mr-2">
                    {subject.step_count} articles
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {/* Expanded content: topics → steps as accordion articles */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {(subject.topics || []).map((topic) => (
                      <div key={topic.id}>
                        {/* Topic header */}
                        <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {topic.title}
                          </h4>
                        </div>

                        {/* Steps as expandable articles */}
                        {(topic.steps || []).map((step) => {
                          const stepExpanded = expandedSteps[step.id]
                          const stepFeedback = feedback[step.id]

                          return (
                            <div key={step.id} className="border-b border-gray-50 last:border-0">
                              <button
                                onClick={() => toggleStep(step.id)}
                                className="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 transition-colors"
                              >
                                {step.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                )}
                                <span className="text-sm text-gray-700 flex-1">
                                  {step.title}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
                                  {step.estimated_minutes && (
                                    <span className="flex items-center gap-0.5">
                                      <Clock className="w-3 h-3" />
                                      {step.estimated_minutes}m
                                    </span>
                                  )}
                                  {step.video_url && (
                                    <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
                                  )}
                                </div>
                                {stepExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                              </button>

                              {/* Expanded article content */}
                              {stepExpanded && (
                                <div className="px-6 pb-5 pt-1 ml-7">
                                  {/* Tip callout */}
                                  {step.is_required && (
                                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
                                      <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                      <p className="text-xs text-amber-700">
                                        This is a required procedure. Make sure you complete it as
                                        part of your training.
                                      </p>
                                    </div>
                                  )}

                                  {/* HTML content */}
                                  {step.content_html ? (
                                    <div
                                      className="prose prose-sm max-w-none text-gray-700 mb-4"
                                      dangerouslySetInnerHTML={{ __html: step.content_html }}
                                    />
                                  ) : (
                                    <p className="text-sm text-gray-400 italic mb-4">
                                      Detailed instructions coming soon.
                                    </p>
                                  )}

                                  {/* Video link */}
                                  {step.video_url && (
                                    <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-4 py-2.5 mb-4">
                                      <PlayCircle className="w-4 h-4 text-blue-500" />
                                      <span className="text-xs text-blue-600">
                                        Video guide available
                                      </span>
                                    </div>
                                  )}

                                  {/* PDF link */}
                                  {step.pdf_url && (
                                    <div className="flex items-center gap-2 bg-red-50 rounded-lg px-4 py-2.5 mb-4">
                                      <FileText className="w-4 h-4 text-red-500" />
                                      <span className="text-xs text-red-600">
                                        PDF document attached
                                      </span>
                                    </div>
                                  )}

                                  {/* Feedback buttons */}
                                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                                    <span className="text-xs text-gray-400">Was this helpful?</span>
                                    <button
                                      onClick={() => handleFeedback(step.id, 'up')}
                                      className={`p-1.5 rounded-lg transition-colors ${
                                        stepFeedback === 'up'
                                          ? 'bg-emerald-100 text-emerald-600'
                                          : 'hover:bg-gray-100 text-gray-400'
                                      }`}
                                    >
                                      <ThumbsUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleFeedback(step.id, 'down')}
                                      className={`p-1.5 rounded-lg transition-colors ${
                                        stepFeedback === 'down'
                                          ? 'bg-red-100 text-red-600'
                                          : 'hover:bg-gray-100 text-gray-400'
                                      }`}
                                    >
                                      <ThumbsDown className="w-3.5 h-3.5" />
                                    </button>
                                    {stepFeedback && (
                                      <span className="text-xs text-gray-400">
                                        Thanks for your feedback!
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {(topic.steps || []).length === 0 && (
                          <div className="px-6 py-4 text-xs text-gray-400 italic">
                            No articles yet in this topic.
                          </div>
                        )}
                      </div>
                    ))}

                    {(subject.topics || []).length === 0 && (
                      <div className="px-5 py-6 text-center text-gray-400 text-sm">
                        No how-to articles yet in this category.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
