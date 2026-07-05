import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
  List,
  XCircle,
  FolderOpen,
} from 'lucide-react'
import { useTrainings } from '../hooks/useTrainings'
import { supabase } from '../lib/supabase'
import { useViewMode } from '../contexts/ViewModeContext'

// ─── Interactive Knowledge Check Quiz Component ───
function KnowledgeCheckQuiz({ questions }) {
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [completedQuestions, setCompletedQuestions] = useState([])

  const q = questions[currentQ]
  if (!q) return null

  const handleAnswer = (optionIndex) => {
    if (answered) return
    setSelectedAnswer(optionIndex)
    setAnswered(true)
    const correct = optionIndex === q.correctIndex
    setIsCorrect(correct)
    if (correct) {
      setCompletedQuestions((prev) => [...prev, currentQ])
    }
  }

  const handleNext = () => {
    setSelectedAnswer(null)
    setAnswered(false)
    setIsCorrect(false)
    setCurrentQ((prev) => prev + 1)
  }

  const handleRetry = () => {
    setSelectedAnswer(null)
    setAnswered(false)
    setIsCorrect(false)
  }

  const allDone = completedQuestions.length === questions.length

  return (
    <div>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Question {currentQ + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-400">
            {completedQuestions.length}/{questions.length} correct
          </span>
        </div>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                completedQuestions.includes(i)
                  ? 'bg-emerald-500'
                  : i === currentQ
                  ? 'bg-blue-400'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {allDone ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Knowledge Check Complete!</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            You answered all {questions.length} questions correctly. You're ready to move on.
          </p>
        </div>
      ) : (
        <>
          {/* Question Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4">
            <p className="text-base font-semibold text-gray-900 leading-relaxed">{q.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {q.options.map((opt, i) => {
              let classes = 'w-full text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-all '
              if (!answered) {
                classes += selectedAnswer === i
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
              } else if (i === q.correctIndex) {
                classes += 'border-emerald-500 bg-emerald-50'
              } else if (i === selectedAnswer && !isCorrect) {
                classes += 'border-red-400 bg-red-50'
              } else {
                classes += 'border-gray-200 bg-white opacity-50'
              }

              const letter = String.fromCharCode(65 + i)

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                  className={classes}
                >
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      answered && i === q.correctIndex
                        ? 'bg-emerald-500 text-white'
                        : answered && i === selectedAnswer && !isCorrect
                        ? 'bg-red-400 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {answered && i === q.correctIndex ? '✓' : answered && i === selectedAnswer && !isCorrect ? '✗' : letter}
                  </span>
                  <span className={`text-sm leading-relaxed ${answered && i === q.correctIndex ? 'text-emerald-800 font-medium' : answered && i === selectedAnswer && !isCorrect ? 'text-red-700' : 'text-gray-700'}`}>
                    {opt}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Feedback */}
          {answered && (
            <div className={`rounded-xl p-5 mb-4 ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <strong className={isCorrect ? 'text-emerald-800' : 'text-red-800'}>
                  {isCorrect ? 'Correct!' : 'Not quite — try again'}
                </strong>
              </div>
              {isCorrect && q.explanation && (
                <p className="text-sm text-emerald-700 leading-relaxed ml-7">{q.explanation}</p>
              )}
              {!isCorrect && (
                <p className="text-sm text-red-600 ml-7">Review the material and give it another shot.</p>
              )}
            </div>
          )}

          {/* Action buttons */}
          {answered && (
            <div className="flex justify-end">
              {isCorrect ? (
                currentQ < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next Question
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : null
              ) : (
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Parse Knowledge Check HTML into structured quiz data
function parseKnowledgeCheckQuestions(html) {
  if (!html) return null
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const blocks = doc.querySelectorAll('div[style]')
  const questions = []
  const answers = []

  blocks.forEach((block) => {
    const strong = block.querySelector('strong')
    const text = strong?.textContent?.trim() || ''

    // Answer key blocks (green bg)
    if (text.match(/^\d+\.\s*→/)) {
      const letter = text.match(/→\s*([A-D])/)?.[1]
      const explanation = block.querySelector('p')?.textContent?.trim() || ''
      answers.push({ letter, explanation })
      return
    }

    // Question blocks
    const questionMatch = text.match(/^\d+\.\s+(.+)/)
    if (questionMatch) {
      const questionText = questionMatch[0]
      const optionsEl = block.querySelector('p[style]')
      if (optionsEl) {
        const optionsHtml = optionsEl.innerHTML
        const opts = optionsHtml.split(/<br\s*\/?>/).map((o) => o.replace(/^[A-D]\.\s*/, '').trim()).filter(Boolean)
        questions.push({ question: questionText, options: opts })
      }
    }
  })

  // Merge answers into questions
  questions.forEach((q, i) => {
    if (answers[i]) {
      const correctLetter = answers[i].letter
      q.correctIndex = correctLetter ? correctLetter.charCodeAt(0) - 65 : 0
      q.explanation = answers[i].explanation
    }
  })

  return questions.length > 0 ? questions : null
}

// Placeholder staff ID until auth is implemented
const CURRENT_STAFF_ID = '00000000-0000-0000-0000-000000000001'

export default function TrainingsOnboardingPage() {
  const navigate = useNavigate()
  const { subjects, loading, error } = useTrainings('onboarding')
  const { mobileMode } = useViewMode()
  const [selectedStep, setSelectedStep] = useState(null)
  const [expandedModules, setExpandedModules] = useState({})
  const [expandedSubjects, setExpandedSubjects] = useState({})
  const [expandedTopics, setExpandedTopics] = useState({})
  const [completing, setCompleting] = useState(false)
  const [localCompleted, setLocalCompleted] = useState(new Set())
  // Mobile: show outline or content view
  const [mobileView, setMobileView] = useState('outline')

  // Filter out TRS categories — those live under Trainings > TRS now
  const filteredSubjects = subjects.filter((s) => !s.trs_category)

  // Group subjects into modules (preserving order)
  const modules = []
  const moduleMap = {}
  for (const subj of filteredSubjects) {
    const key = subj.module_title || 'Uncategorized'
    if (!moduleMap[key]) {
      moduleMap[key] = { title: key, subjects: [] }
      modules.push(moduleMap[key])
    }
    moduleMap[key].subjects.push(subj)
  }

  // Auto-expand first module, subject, and topic on load
  useEffect(() => {
    if (filteredSubjects.length > 0 && Object.keys(expandedSubjects).length === 0) {
      const first = filteredSubjects[0]
      // Expand the first module
      const firstModuleTitle = first.module_title || 'Uncategorized'
      setExpandedModules({ [firstModuleTitle]: true })
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
  }, [filteredSubjects])

  const toggleModule = (title) => {
    setExpandedModules((prev) => ({ ...prev, [title]: !prev[title] }))
  }

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
  // TODO: Re-enable locking when done editing lessons
  const isStepLocked = (/* step, allStepsFlat */) => {
    return false // Temporarily unlocked for editing
    // const idx = allStepsFlat.findIndex((s) => s.id === step.id)
    // if (idx <= 0) return false
    // for (let i = 0; i < idx; i++) {
    //   const prev = allStepsFlat[i]
    //   if (prev.is_required && !isStepCompleted(prev)) {
    //     return true
    //   }
    // }
    // return false
  }

  // Get all steps in order across all subjects/topics
  const allStepsFlat = filteredSubjects.flatMap((s) =>
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
        // Expand the module, subject, and topic for the next step
        for (const subj of filteredSubjects) {
          for (const topic of subj.topics || []) {
            if (topic.steps?.some((s) => s.id === next.id)) {
              setExpandedModules((prev) => ({ ...prev, [subj.module_title || 'Uncategorized']: true }))
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
        // Expand the right module/subject/topic
        for (const subj of filteredSubjects) {
          for (const topic of subj.topics || []) {
            if (topic.steps?.some((s) => s.id === next.id)) {
              setExpandedModules((prev) => ({ ...prev, [subj.module_title || 'Uncategorized']: true }))
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
        <div className="flex items-center gap-3">
          {/* Back to the Trainings dashboard — same standard back-arrow chip
              used on the Role Clarity / TRS landing pages. Lets users return
              to the tile grid without going through the sidebar. */}
          <button
            onClick={() => navigate('/trainings')}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
            title="Back to Trainings"
            aria-label="Back to Trainings"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-gray-900">Onboarding</h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete each section in order to finish your onboarding training
            </p>
          </div>
        </div>
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

      {/* Mobile view tab switcher */}
      {mobileMode && selectedStep && (
        <div className="flex gap-2 mb-4 bg-white rounded-xl border border-gray-200 p-1">
          <button
            onClick={() => setMobileView('outline')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mobileView === 'outline'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4" />
            Outline
          </button>
          <button
            onClick={() => setMobileView('content')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mobileView === 'content'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Content
          </button>
        </div>
      )}

      <div
        className={mobileMode ? 'flex flex-col gap-4' : 'flex gap-6'}
        style={mobileMode ? {} : { minHeight: 'calc(100vh - 220px)' }}
      >
        {/* Left panel — Subject/Topic tree */}
        <div
          className={`${
            mobileMode
              ? `w-full ${selectedStep && mobileView === 'content' ? 'hidden' : ''}`
              : 'w-72 flex-shrink-0'
          } bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col`}
          style={mobileMode ? {} : { maxHeight: 'calc(100vh - 220px)' }}
        >
          <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Outline</h3>
          </div>
          <div className="overflow-y-auto flex-1 relative custom-scrollbar">
            {modules.map((mod) => {
              const moduleSteps = mod.subjects.flatMap((s) =>
                (s.topics || []).flatMap((t) => t.steps || [])
              )
              const moduleCompleted = moduleSteps.filter((s) => isStepCompleted(s)).length
              const moduleTotal = moduleSteps.length
              const isModuleExpanded = expandedModules[mod.title]

              return (
                <div key={mod.title}>
                  {/* Module header */}
                  <button
                    onClick={() => toggleModule(mod.title)}
                    className="w-full flex items-center gap-2 px-3 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
                  >
                    {isModuleExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold text-gray-800 ${mobileMode ? '' : 'truncate'}`}>
                        {mod.title}
                      </p>
                    </div>
                    {moduleCompleted === moduleTotal && moduleTotal > 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <span className="text-[10px] font-medium text-gray-400 flex-shrink-0">
                        {moduleCompleted}/{moduleTotal}
                      </span>
                    )}
                  </button>

                  {/* Subjects within module */}
                  {isModuleExpanded &&
                    mod.subjects.map((subject) => {
                      const subjectSteps = (subject.topics || []).flatMap((t) => t.steps || [])
                      const subjectCompleted = subjectSteps.filter((s) => isStepCompleted(s)).length
                      const subjectTotal = subjectSteps.length
                      const isExpanded = expandedSubjects[subject.id]

                      return (
                        <div key={subject.id}>
                          {/* Subject header */}
                          <button
                            onClick={() => toggleSubject(subject.id)}
                            className="w-full flex items-center gap-2 pl-5 pr-3 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold text-gray-900 ${mobileMode ? '' : 'truncate'}`}>{subject.title}</p>
                            </div>
                            {subjectCompleted === subjectTotal && subjectTotal > 0 ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            ) : (
                              <span className="text-[10px] text-gray-400 flex-shrink-0">
                                {subjectCompleted}/{subjectTotal}
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
                                    className="w-full flex items-center gap-1.5 pl-9 pr-3 py-2 text-left hover:bg-gray-50 transition-colors"
                                  >
                                    {topicExpanded ? (
                                      <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    )}
                                    <span className={`text-xs text-gray-700 flex-1 ${mobileMode ? '' : 'truncate'}`}>
                                      {topic.title}
                                    </span>
                                    <span className="text-[9px] text-gray-400 flex-shrink-0">
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
                                          onClick={() => {
                                            if (locked) return
                                            setSelectedStep(step)
                                            if (mobileMode) setMobileView('content')
                                          }}
                                          disabled={locked}
                                          className={`w-full flex items-center gap-1.5 pl-14 pr-3 py-1.5 text-left transition-colors ${
                                            locked
                                              ? 'opacity-40 cursor-not-allowed'
                                              : isActive
                                              ? 'bg-blue-50 border-r-2 border-blue-500'
                                              : 'hover:bg-gray-50 cursor-pointer'
                                          }`}
                                        >
                                          {locked ? (
                                            <Lock className="w-3 h-3 text-gray-300 flex-shrink-0" />
                                          ) : completed ? (
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                          ) : (
                                            <Circle className="w-3 h-3 text-gray-300 flex-shrink-0" />
                                          )}
                                          <span
                                            className={`text-[11px] leading-tight ${mobileMode ? '' : 'truncate'} ${
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
                                            <span className="text-[9px] text-gray-300 ml-auto flex-shrink-0">
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
              )
            })}
          </div>
          {/* Scroll fade indicator at bottom */}
          <div className="flex-shrink-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none -mt-6 relative z-10" />
        </div>

        {/* Right panel — Step content viewer */}
        <div
          className={`${
            mobileMode
              ? `w-full ${selectedStep && mobileView === 'outline' ? 'hidden' : ''} ${!selectedStep ? 'hidden' : ''}`
              : 'flex-1 min-w-0'
          }`}
        >
          {selectedStep ? (
            <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
              {/* Breadcrumb */}
              <div className={`${mobileMode ? 'px-4 py-2.5 flex-wrap' : 'px-6 py-3'} border-b border-gray-100 flex items-center gap-2 text-xs text-gray-400`}>
                <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                <span className={mobileMode ? 'truncate max-w-[100px]' : ''}>{selectedStep.subjectTitle || 'Onboarding'}</span>
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                <span className={mobileMode ? 'truncate max-w-[100px]' : ''}>{selectedStep.topicTitle || 'Topic'}</span>
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                <span className={`text-gray-600 font-medium ${mobileMode ? 'truncate' : ''}`}>{selectedStep.title}</span>
              </div>

              {/* Content area */}
              <div className={`flex-1 overflow-y-auto ${mobileMode ? 'px-4 py-5' : 'px-8 py-6'}`}>
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
                {selectedStep.video_url && (() => {
                  const url = selectedStep.video_url;
                  // YouTube
                  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
                  // Vimeo
                  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
                  // Loom
                  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([\w-]+)/);

                  if (ytMatch) {
                    return (
                      <div className="mb-6 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                        <div className="aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${ytMatch[1]}?rel=0`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Lesson Video"
                          />
                        </div>
                      </div>
                    );
                  } else if (vimeoMatch) {
                    return (
                      <div className="mb-6 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                        <div className="aspect-video">
                          <iframe
                            src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
                            className="w-full h-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title="Lesson Video"
                          />
                        </div>
                      </div>
                    );
                  } else if (loomMatch) {
                    return (
                      <div className="mb-6 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                        <div className="aspect-video">
                          <iframe
                            src={`https://www.loom.com/embed/${loomMatch[1]}`}
                            className="w-full h-full"
                            allowFullScreen
                            title="Lesson Video"
                          />
                        </div>
                      </div>
                    );
                  } else {
                    // Direct video URL (mp4, etc.)
                    return (
                      <div className="mb-6 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                        <video key={url} controls className="w-full aspect-video bg-gray-900">
                          <source src={url} />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    );
                  }
                })()}

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

                {/* HTML content or Interactive Quiz */}
                {(() => {
                  // Check if this is a Knowledge Check step
                  const isQuiz = selectedStep.title?.toLowerCase().includes('knowledge check')
                  if (isQuiz && selectedStep.content_html) {
                    const quizData = parseKnowledgeCheckQuestions(selectedStep.content_html)
                    if (quizData) {
                      return <KnowledgeCheckQuiz key={selectedStep.id} questions={quizData} />
                    }
                  }
                  // Regular content
                  return selectedStep.content_html ? (
                    <div
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: selectedStep.content_html }}
                    />
                  ) : (
                    <div className="py-12 text-center text-gray-400">
                      <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Content coming soon for this step.</p>
                    </div>
                  )
                })()}
              </div>

              {/* Bottom action bar */}
              <div className={`border-t border-gray-100 ${mobileMode ? 'px-3 py-3 flex flex-col gap-2' : 'px-6 py-4 flex items-center justify-between'}`}>
                {mobileMode && !isStepCompleted(selectedStep) && (
                  <button
                    onClick={handleMarkComplete}
                    disabled={completing}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {completing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Mark as Complete
                  </button>
                )}

                <div className={mobileMode ? 'flex items-center justify-between w-full' : 'contents'}>
                  <button
                    onClick={() => navigateStep(-1)}
                    disabled={currentStepIndex <= 0}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>

                  {!mobileMode && (
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
                  )}

                  <button
                    onClick={() => navigateStep(1)}
                    disabled={currentStepIndex >= allStepsFlat.length - 1}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
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
