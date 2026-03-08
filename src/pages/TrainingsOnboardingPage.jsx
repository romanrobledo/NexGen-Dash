import { useState, useEffect } from 'react'
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Lock,
  PlayCircle,
  FileText,
  Clock,
  BookOpen,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { useTrainings } from '../hooks/useTrainings'
import { supabase } from '../lib/supabase'

// Placeholder staff ID until auth is implemented
const CURRENT_STAFF_ID = '00000000-0000-0000-0000-000000000001'

export default function TrainingsOnboardingPage() {
  const { subjects, loading, error } = useTrainings('onboarding')
  const [selectedStep, setSelectedStep] = useState(null)
  const [expandedSubjects, setExpandedSubjects] = useState({})
  const [expandedTopics, setExpandedTopics] = useState({})
  const [completing, setCompleting] = useState(false)
  const [localCompleted, setLocalCompleted] = useState(new Set())

  // Auto-expand first subject and topic on load
  useEffect(() => {
    if (subjects.length > 0 && Object.keys(expandedSubjects).length === 0) {
      const first = subjects[0]
      setExpandedSubjects({ [first.id]: true })
      if (first.topics && first.topics.length > 0) {
        setExpandedTopics({ [first.topics[0].id]: true })
        // Select first incomplete step, or first step
        const firstTopic = first.topics[0]
        if (firstTopic.steps && firstTopic.steps.length > 0) {
          const firstIncomplete = firstTopic.steps.find((s) => !s.completed)
          setSelectedStep(firstIncomplete || firstTopic.steps[0])
        }
      }
    }
  }, [subjects])

  const toggleSubject = (id) => {
    setExpandedSubjects((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleTopic = (id) => {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const isStepCompleted = (step) => {
    return step.completed || localCompleted.has(step.id)
  }

  // Check if a step is locked (previous required steps not done)
  const isStepLocked = (step, allStepsFlat) => {
    const idx = allStepsFlat.findIndex((s) => s.id === step.id)
    if (idx <= 0) return false
    // All previous required steps must be completed
    for (let i = 0; i < idx; i++) {
      const prev = allStepsFlat[i]
      if (prev.is_required && !isStepCompleted(prev)) {
        return true
      }
    }
    return false
  }

  // Get all steps in order across all subjects/topics
  const allStepsFlat = subjects.flatMap((s) =>
    (s.topics || []).flatMap((t) => (t.steps || []).map((step) => ({ ...step, subjectTitle: s.title, topicTitle: t.title })))
  )

  const currentStepIndex = selectedStep
    ? allStepsFlat.findIndex((s) => s.id === selectedStep.id)
    : -1

  const handleMarkComplete = async () => {
    if (!selectedStep || !supabase) return
    setCompleting(true)
    try {
      const { error: insertError } = await supabase.from('staff_progress').upsert(
        {
          staff_id: CURRENT_STAFF_ID,
          step_id: selectedStep.id,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'staff_id,step_id' }
      )
      if (insertError) throw insertError

      setLocalCompleted((prev) => new Set([...prev, selectedStep.id]))

      // Auto-advance to next step
      if (currentStepIndex < allStepsFlat.length - 1) {
        const next = allStepsFlat[currentStepIndex + 1]
        setSelectedStep(next)
        // Expand the subject and topic for the next step
        for (const subj of subjects) {
          for (const topic of subj.topics || []) {
            if (topic.steps?.some((s) => s.id === next.id)) {
              setExpandedSubjects((prev) => ({ ...prev, [subj.id]: true }))
              setExpandedTopics((prev) => ({ ...prev, [topic.id]: true }))
            }
          }
        }
      }
    } catch (err) {
      console.error('Error marking step complete:', err)
    } finally {
      setCompleting(false)
    }
  }

  const navigateStep = (direction) => {
    const newIndex = currentStepIndex + direction
    if (newIndex >= 0 && newIndex < allStepsFlat.length) {
      const next = allStepsFlat[newIndex]
      if (!isStepLocked(next, allStepsFlat)) {
        setSelectedStep(next)
        // Expand the right subject/topic
        for (const subj of subjects) {
          for (const topic of subj.topics || []) {
            if (topic.steps?.some((s) => s.id === next.id)) {
              setExpandedSubjects((prev) => ({ ...prev, [subj.id]: true }))
              setExpandedTopics((prev) => ({ ...prev, [topic.id]: true }))
            }
          }
        }
      }
    }
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
        <h3 className="font-semibold mb-1">Error loading onboarding</h3>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  // Calculate overall onboarding progress
  const totalSteps = allStepsFlat.length
  const completedSteps = allStepsFlat.filter((s) => isStepCompleted(s)).length
  const overallProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Onboarding</h2>
        <p className="text-sm text-gray-500 mt-1">
          Complete each section in order to finish your onboarding training
        </p>
        {/* Overall progress bar */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 bg-gray-100 rounded-full h-2.5 max-w-md">
            <div
              className="h-2.5 rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600">
            {completedSteps}/{totalSteps} steps &middot; {overallProgress}%
          </span>
        </div>
      </div>

      <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 220px)' }}>
        {/* Left panel — Subject/Topic tree */}
        <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Course Outline</h3>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {subjects.map((subject) => {
              const subjectSteps = (subject.topics || []).flatMap((t) => t.steps || [])
              const subjectCompleted = subjectSteps.filter((s) => isStepCompleted(s)).length
              const subjectTotal = subjectSteps.length
              const isExpanded = expandedSubjects[subject.id]

              return (
                <div key={subject.id}>
                  {/* Subject header */}
                  <button
                    onClick={() => toggleSubject(subject.id)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{subject.title}</p>
                      <p className="text-xs text-gray-400">
                        {subjectCompleted}/{subjectTotal} completed
                      </p>
                    </div>
                    {subjectCompleted === subjectTotal && subjectTotal > 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {subjectTotal > 0 ? Math.round((subjectCompleted / subjectTotal) * 100) : 0}%
                      </span>
                    )}
                  </button>

                  {/* Topics */}
                  {isExpanded &&
                    (subject.topics || []).map((topic) => {
                      const topicExpanded = expandedTopics[topic.id]
                      const topicSteps = topic.steps || []
                      const topicCompleted = topicSteps.filter((s) => isStepCompleted(s)).length

                      return (
                        <div key={topic.id}>
                          <button
                            onClick={() => toggleTopic(topic.id)}
                            className="w-full flex items-center gap-2 pl-8 pr-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                          >
                            {topicExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            )}
                            <span className="text-sm text-gray-700 truncate flex-1">
                              {topic.title}
                            </span>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">
                              {topicCompleted}/{topicSteps.length}
                            </span>
                          </button>

                          {/* Steps */}
                          {topicExpanded &&
                            topicSteps.map((step) => {
                              const completed = isStepCompleted(step)
                              const locked = isStepLocked(step, allStepsFlat)
                              const isActive = selectedStep?.id === step.id

                              return (
                                <button
                                  key={step.id}
                                  onClick={() => !locked && setSelectedStep(step)}
                                  disabled={locked}
                                  className={`w-full flex items-center gap-2 pl-14 pr-4 py-2 text-left transition-colors ${
                                    locked
                                      ? 'opacity-40 cursor-not-allowed'
                                      : isActive
                                      ? 'bg-blue-50 border-r-2 border-blue-500'
                                      : 'hover:bg-gray-50 cursor-pointer'
                                  }`}
                                >
                                  {locked ? (
                                    <Lock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                  ) : completed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                  )}
                                  <span
                                    className={`text-xs truncate ${
                                      isActive
                                        ? 'text-blue-700 font-medium'
                                        : completed
                                        ? 'text-gray-400 line-through'
                                        : 'text-gray-600'
                                    }`}
                                  >
                                    {step.title}
                                  </span>
                                  {step.estimated_minutes && (
                                    <span className="text-[10px] text-gray-300 ml-auto flex-shrink-0">
                                      {step.estimated_minutes}m
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                        </div>
                      )
                    })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel — Step content viewer */}
        <div className="flex-1 min-w-0">
          {selectedStep ? (
            <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
              {/* Breadcrumb */}
              <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{selectedStep.subjectTitle || 'Onboarding'}</span>
                <ChevronRight className="w-3 h-3" />
                <span>{selectedStep.topicTitle || 'Topic'}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-600 font-medium">{selectedStep.title}</span>
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedStep.title}</h2>

                <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                  {selectedStep.estimated_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{selectedStep.estimated_minutes} min read</span>
                    </div>
                  )}
                  {selectedStep.is_required && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full font-medium">
                      Required
                    </span>
                  )}
                  {isStepCompleted(selectedStep) && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </span>
                  )}
                </div>

                {/* Video embed */}
                {selectedStep.video_url && (
                  <div className="mb-6 rounded-lg overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <PlayCircle className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Video: {selectedStep.video_url}</p>
                    </div>
                  </div>
                )}

                {/* PDF link */}
                {selectedStep.pdf_url && (
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-blue-700">Attached Document</p>
                      <p className="text-xs text-blue-500">{selectedStep.pdf_url}</p>
                    </div>
                  </div>
                )}

                {/* HTML content */}
                {selectedStep.content_html ? (
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: selectedStep.content_html }}
                  />
                ) : (
                  <div className="py-12 text-center text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Content coming soon for this step.</p>
                  </div>
                )}
              </div>

              {/* Bottom action bar */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => navigateStep(-1)}
                  disabled={currentStepIndex <= 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-3">
                  {!isStepCompleted(selectedStep) && (
                    <button
                      onClick={handleMarkComplete}
                      disabled={completing}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {completing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Mark as Complete
                    </button>
                  )}
                </div>

                <button
                  onClick={() => navigateStep(1)}
                  disabled={currentStepIndex >= allStepsFlat.length - 1}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Select a step to begin</p>
                <p className="text-xs mt-1">Choose from the course outline on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
