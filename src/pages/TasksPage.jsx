import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronDown,
  ChevronRight,
  Clock,
  User2,
  ExternalLink,
  CheckCircle2,
  Circle,
  ClipboardList,
  Pencil,
  Loader2,
} from 'lucide-react'
import { usePriorities } from '../hooks/usePriorities'
import { useTasks } from '../hooks/useTasks'
import { useTargetTaskMutations } from '../hooks/useTargetTaskMutations'
import { useViewMode } from '../contexts/ViewModeContext'

/* ─────────────────────────────────────────────
   DISPLAY-ONLY CONSTANTS
   ───────────────────────────────────────────── */
const TIMELINE_COLORS = {
  Immediate:      { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  'Week 1-2':     { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  'Week 2-3':     { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
  'Week 2-4':     { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
  'Before Break': { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  'After 30 Days':{ bg: '#F9FAFB', text: '#6B7280', border: '#E5E7EB' },
  Ongoing:        { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
}

export default function TasksPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { mobileMode } = useViewMode()

  const { priorities, loading: prioritiesLoading } = usePriorities()
  const { tasks, loading: tasksLoading, refetch: refetchTasks } = useTasks()
  const { toggleTaskCompletion, saving } = useTargetTaskMutations()

  const [expandedTasks, setExpandedTasks] = useState(new Set())

  const isLoading = prioritiesLoading || tasksLoading

  // Auto-scroll + expand a task if #task-{id} is present in URL hash
  useEffect(() => {
    if (!location.hash || isLoading) return
    const match = location.hash.match(/^#task-(.+)$/)
    if (!match) return
    const taskId = match[1]
    setExpandedTasks((prev) => new Set(prev).add(taskId))
    // Scroll into view
    setTimeout(() => {
      const el = document.getElementById(`task-${taskId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.style.transition = 'box-shadow .4s ease'
        el.style.boxShadow = '0 0 0 3px #BFDBFE'
        setTimeout(() => {
          el.style.boxShadow = ''
        }, 1600)
      }
    }, 150)
  }, [location.hash, isLoading])

  // Group tasks by priority
  const prioritiesWithTasks = priorities.map((p) => ({
    ...p,
    tasks: tasks
      .filter((t) => t.priority_id === p.id)
      .sort((a, b) => a.sort_order - b.sort_order),
  }))

  const handleToggleComplete = async (task) => {
    if (saving) return
    await toggleTaskCompletion(task.id, task.is_completed)
    refetchTasks()
  }

  const toggleExpand = (id) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12 }}>
        <Loader2 size={32} color="#2563EB" className="animate-spin" />
        <span style={{ color: '#64748B', fontSize: 14 }}>Loading tasks...</span>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: mobileMode ? 20 : 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <ClipboardList size={mobileMode ? 22 : 28} color="#2563EB" />
          <h1 style={{ fontSize: mobileMode ? 20 : 28, fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
            Tasks
          </h1>
        </div>
        <p style={{ color: '#64748B', fontSize: mobileMode ? 13 : 14, margin: 0 }}>
          Execution task list grouped by priority
        </p>
      </div>

      {/* Priority sections */}
      {prioritiesWithTasks.map((priority) => {
        const priTasks = priority.tasks
        if (priTasks.length === 0) return null
        const priDone = priTasks.filter((t) => t.is_completed).length

        return (
          <div key={priority.id} style={{ marginBottom: 28 }}>
            {/* Priority header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: priority.color,
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 6,
                  letterSpacing: '.3px',
                }}
              >
                {priority.code}
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                {priority.name}
              </span>
              <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto' }}>
                {priDone}/{priTasks.length} done
              </span>
            </div>

            {/* Task cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {priTasks.map((task) => {
                const done = task.is_completed
                const expanded = expandedTasks.has(task.id)
                const tc = TIMELINE_COLORS[task.timeline] || TIMELINE_COLORS.Ongoing
                const taskTools = Array.isArray(task.tools) ? task.tools : []
                const taskNotes = Array.isArray(task.notes) ? task.notes : []
                const taskSteps = Array.isArray(task.steps) ? task.steps : []
                const taskCrossLinks = Array.isArray(task.cross_links) ? task.cross_links : []

                return (
                  <div
                    key={task.id}
                    id={`task-${task.id}`}
                    style={{
                      background: done ? '#F8FAFC' : '#fff',
                      borderRadius: 14,
                      border: `1.5px solid ${done ? '#E2E8F0' : priority.color + '30'}`,
                      boxShadow: done ? 'none' : '0 1px 4px rgba(0,0,0,.04)',
                      overflow: 'hidden',
                      transition: 'all .2s ease',
                    }}
                  >
                    {/* Top row */}
                    <div style={{ padding: mobileMode ? '14px 14px' : '16px 20px', display: 'flex', gap: mobileMode ? 10 : 14, alignItems: 'flex-start' }}>
                      <button
                        onClick={() => handleToggleComplete(task)}
                        disabled={saving}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: saving ? 'wait' : 'pointer',
                          padding: 0,
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                        title={done ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {done ? (
                          <CheckCircle2 size={22} color="#16A34A" />
                        ) : (
                          <Circle size={22} color="#CBD5E1" />
                        )}
                      </button>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                          <span
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: done ? '#94A3B8' : '#0F172A',
                              textDecoration: done ? 'line-through' : 'none',
                            }}
                          >
                            {task.task_number}. {task.name}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: tc.text,
                              background: tc.bg,
                              border: `1px solid ${tc.border}`,
                              padding: '2px 8px',
                              borderRadius: 6,
                            }}
                          >
                            {task.timeline}
                          </span>
                        </div>

                        <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                          {task.objective}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 12, color: '#94A3B8' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <User2 size={13} /> {task.owner}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={13} /> {task.time_estimate}
                          </span>
                          {taskTools.length > 0 && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                              {taskTools.map((tool) => (
                                <span
                                  key={tool}
                                  style={{
                                    background: tool === 'Slack' ? '#4A154B15' : '#F1F5F9',
                                    color: tool === 'Slack' ? '#4A154B' : '#475569',
                                    padding: '1px 7px',
                                    borderRadius: 4,
                                    fontSize: 11,
                                    fontWeight: 500,
                                  }}
                                >
                                  {tool}
                                </span>
                              ))}
                            </span>
                          )}
                        </div>

                        {task.owner_note && (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              marginTop: 8,
                              background: '#FFFBEB',
                              border: '1px solid #FDE68A',
                              borderRadius: 6,
                              padding: '3px 10px',
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#92400E',
                            }}
                          >
                            <Pencil size={11} /> {task.owner_note}
                          </div>
                        )}

                        {taskCrossLinks.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                            {taskCrossLinks.map((link) => (
                              <button
                                key={link.path}
                                onClick={() => navigate(link.path)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  background: '#EFF6FF',
                                  color: '#2563EB',
                                  border: '1px solid #BFDBFE',
                                  borderRadius: 6,
                                  padding: '3px 10px',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  fontFamily: 'inherit',
                                  transition: 'background .15s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#DBEAFE' }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#EFF6FF' }}
                              >
                                <ExternalLink size={11} /> {link.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {taskSteps.length > 0 && (
                          <button
                            onClick={() => toggleExpand(task.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              marginTop: 10,
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#64748B',
                              padding: 0,
                              fontFamily: 'inherit',
                            }}
                          >
                            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            {expanded ? 'Hide' : 'Show'} Action Steps ({taskSteps.length})
                          </button>
                        )}
                      </div>
                    </div>

                    {expanded && (
                      <div
                        style={{
                          borderTop: '1px solid #F1F5F9',
                          padding: mobileMode ? '12px 14px 14px 14px' : '14px 20px 16px 56px',
                          background: '#FAFBFC',
                        }}
                      >
                        {taskNotes.length > 0 && (
                          <div
                            style={{
                              background: '#FFF7ED',
                              border: '1px solid #FED7AA',
                              borderRadius: 8,
                              padding: '10px 14px',
                              marginBottom: 14,
                            }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#9A3412', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Pencil size={11} /> Founder's Notes
                            </div>
                            {taskNotes.map((note, i) => (
                              <div
                                key={i}
                                style={{
                                  fontSize: 12,
                                  color: '#78350F',
                                  lineHeight: 1.5,
                                  marginTop: i > 0 ? 4 : 0,
                                }}
                              >
                                • {note}
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {taskSteps.map((step, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                                fontSize: 13,
                                color: '#334155',
                                lineHeight: 1.5,
                              }}
                            >
                              <span
                                style={{
                                  flexShrink: 0,
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  background: priority.color + '15',
                                  color: priority.color,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginTop: 1,
                                }}
                              >
                                {i + 1}
                              </span>
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {tasks.length === 0 && (
        <div
          style={{
            background: '#fff',
            border: '2px dashed #E2E8F0',
            borderRadius: 16,
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <ClipboardList size={40} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#64748B', fontWeight: 600, margin: 0 }}>No tasks yet</p>
          <p style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>
            Tasks created from the dashboard will show up here.
          </p>
        </div>
      )}
    </div>
  )
}
