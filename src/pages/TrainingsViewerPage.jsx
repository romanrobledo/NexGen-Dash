import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  PlayCircle,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Lock,
  Lightbulb,
  StickyNote,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const CURRENT_STAFF_ID = '00000000-0000-0000-0000-000000000001'

export default function TrainingsViewerPage() {
  const { stepId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(null)
  const [topic, setTopic] = useState(null)
  const [subject, setSubject] = useState(null)
  const [siblingSteps, setSiblingSteps] = useState([])
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [completing, setCompleting] = useState(false)
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)

  useEffect(() => {
    async function fetchStep() {
      if (!supabase || !stepId) {
        setError('Step not found')
        setLoading(false)
        return
      }

      try {
        // Fetch the step
        const { data: stepData, error: stepError } = await supabase
          .from('training_steps')
          .select('*')
          .eq('id', stepId)
          .single()

        if (stepError) throw stepError
        setStep(stepData)

        // Fetch the topic
        const { data: topicData, error: topicError } = await supabase
          .from('training_topics')
          .select('*')
          .eq('id', stepData.topic_id)
          .single()

        if (topicError) throw topicError
        setTopic(topicData)

        // Fetch the subject
        const { data: subjectData, error: subjectError } = await supabase
          .from('training_subjects')
          .select('*')
          .eq('id', topicData.subject_id)
          .single()

        if (subjectError) throw subjectError
        setSubject(subjectData)

        // Fetch all steps in the same subject (across topics) for navigation
        const { data: allTopics } = await supabase
          .from('training_topics')
          .select('id, title, order_index')
          .eq('subject_id', subjectData.id)
          .order('order_index')

        const topicIds = allTopics.map((t) => t.id)
        const { data: allSteps } = await supabase
          .from('training_steps')
          .select('id, topic_id, title, order_index, estimated_minutes, is_required')
          .in('topic_id', topicIds)
          .order('order_index')

        // Sort steps by topic order then step order
        const topicOrder = {}
        allTopics.forEach((t, i) => (topicOrder[t.id] = i))
        const sorted = allSteps.sort(
          (a, b) =>
            topicOrder[a.topic_id] - topicOrder[b.topic_id] || a.order_index - b.order_index
        )
        setSiblingSteps(sorted.map((s) => ({
          ...s,
          topicTitle: allTopics.find((t) => t.id === s.topic_id)?.title || '',
        })))

        // Fetch progress
        const { data: progressData } = await supabase
          .from('staff_progress')
          .select('step_id')
          .eq('staff_id', CURRENT_STAFF_ID)

        setCompletedSteps(new Set((progressData || []).map((p) => p.step_id)))
      } catch (err) {
        console.error('Error fetching step:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    fetchStep()
  }, [stepId])

  const currentIndex = siblingSteps.findIndex((s) => s.id === stepId)
  const prevStep = currentIndex > 0 ? siblingSteps[currentIndex - 1] : null
  const nextStep = currentIndex < siblingSteps.length - 1 ? siblingSteps[currentIndex + 1] : null
  const isCompleted = completedSteps.has(stepId)

  const handleMarkComplete = async () => {
    if (!supabase) return
    setCompleting(true)
    try {
      const { error: insertError } = await supabase.from('staff_progress').upsert(
        {
          staff_id: CURRENT_STAFF_ID,
          step_id: stepId,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'staff_id,step_id' }
      )
      if (insertError) throw insertError
      setCompletedSteps((prev) => new Set([...prev, stepId]))

      // Auto-advance
      if (nextStep) {
        navigate(`/trainings/view/${nextStep.id}`)
      }
    } catch (err) {
      console.error('Error marking complete:', err)
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !step) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <h3 className="font-semibold mb-1">Step not found</h3>
        <p className="text-sm">{error || 'The requested training step could not be found.'}</p>
        <button
          onClick={() => navigate('/trainings')}
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          ← Back to Trainings
        </button>
      </div>
    )
  }

  const totalSteps = siblingSteps.length
  const completedCount = siblingSteps.filter((s) => completedSteps.has(s.id)).length
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0

  return (
    <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 100px)' }}>
      {/* Left sidebar — step list */}
      <div className="w-72 flex-shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => navigate('/trainings')}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Trainings
          </button>
          <h3 className="text-sm font-semibold text-gray-900 truncate">{subject?.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400">
              {completedCount}/{totalSteps}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {siblingSteps.map((s, idx) => {
            const isActive = s.id === stepId
            const isDone = completedSteps.has(s.id)

            // Show topic header if first step in topic or different topic from previous
            const showTopicHeader =
              idx === 0 || s.topic_id !== siblingSteps[idx - 1]?.topic_id

            return (
              <div key={s.id}>
                {showTopicHeader && (
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate">
                      {s.topicTitle}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => navigate(`/trainings/view/${s.id}`)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 border-r-2 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                  <span
                    className={`text-xs flex-1 truncate ${
                      isActive
                        ? 'text-blue-700 font-medium'
                        : isDone
                        ? 'text-gray-400'
                        : 'text-gray-600'
                    }`}
                  >
                    {s.title}
                  </span>
                  {s.estimated_minutes && (
                    <span className="text-[10px] text-gray-300 flex-shrink-0">
                      {s.estimated_minutes}m
                    </span>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <button
            onClick={() => navigate('/trainings')}
            className="hover:text-gray-600 transition-colors"
          >
            Trainings
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="truncate max-w-[200px]">{subject?.title}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="truncate max-w-[200px]">{topic?.title}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 font-medium truncate">{step.title}</span>
        </div>

        {/* Content card */}
        <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {step.estimated_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {step.estimated_minutes} min read
                </span>
              )}
              {step.is_required && (
                <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full font-medium">
                  Required
                </span>
              )}
              {isCompleted && (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </span>
              )}
              <span className="text-xs text-gray-400">
                Step {currentIndex + 1} of {totalSteps}
              </span>
            </div>
          </div>

          {/* Content body */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {/* Tip callout for required steps */}
            {step.is_required && !isCompleted && (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  This is a required step. Complete it to progress in your training.
                </p>
              </div>
            )}

            {/* Video embed */}
            {step.video_url && (
              <div className="mb-6 rounded-xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <PlayCircle className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Video: {step.video_url}</p>
                  <p className="text-xs mt-1 text-gray-500">Video playback coming in Phase 8</p>
                </div>
              </div>
            )}

            {/* PDF attachment */}
            {step.pdf_url && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-blue-700">Document Attached</p>
                  <p className="text-xs text-blue-500">{step.pdf_url}</p>
                </div>
              </div>
            )}

            {/* HTML content */}
            {step.content_html ? (
              <div
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: step.content_html }}
              />
            ) : (
              <div className="py-16 text-center text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Content for this step is coming soon.</p>
              </div>
            )}

            {/* Notes panel */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <StickyNote className="w-4 h-4" />
                {showNotes ? 'Hide Notes' : 'My Notes'}
              </button>
              {showNotes && (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your personal notes for this step..."
                  className="mt-3 w-full h-24 px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              )}
            </div>
          </div>

          {/* Bottom navigation bar */}
          <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <button
              onClick={() => prevStep && navigate(`/trainings/view/${prevStep.id}`)}
              disabled={!prevStep}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="max-w-[150px] truncate">
                {prevStep ? prevStep.title : 'Previous'}
              </span>
            </button>

            {!isCompleted ? (
              <button
                onClick={handleMarkComplete}
                disabled={completing}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {completing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Mark as Complete
              </button>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </span>
            )}

            <button
              onClick={() => nextStep && navigate(`/trainings/view/${nextStep.id}`)}
              disabled={!nextStep}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span className="max-w-[150px] truncate">
                {nextStep ? nextStep.title : 'Next'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
