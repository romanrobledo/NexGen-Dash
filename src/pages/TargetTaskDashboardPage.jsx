import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  CheckCircle2,
  Circle,
  ArrowRight,
  Target,
  Loader2,
  Plus,
} from 'lucide-react'
import { useTargets } from '../hooks/useTargets'
import { usePriorities } from '../hooks/usePriorities'
import { useTasks } from '../hooks/useTasks'
import { useTargetTaskMutations } from '../hooks/useTargetTaskMutations'
import { useViewMode } from '../contexts/ViewModeContext'

/* ─────────────────────────────────────────────
   DISPLAY-ONLY CONSTANTS (not operational data)
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

const STRATEGIC_THEMES = [
  { name: 'Bottleneck Removal', detail: 'Eliminate decision delays and role confusion', icon: '⚡' },
  { name: 'Feedback Loops', detail: 'Systems that collect data and generate insights automatically', icon: '🔄' },
  { name: 'Role Clarity', detail: 'Every person knows exactly what they own and what they don\'t', icon: '🎯' },
  { name: 'Facility Distractions', detail: 'Physical upgrades handled during downtime windows', icon: '🏗️' },
  { name: 'Messaging Accuracy', detail: 'Real customer feedback drives marketing and communication', icon: '📣' },
  { name: 'Operational Scaling', detail: 'Every system built once, used everywhere', icon: '📈' },
]

const FLOW_STEPS = ['Faster Feedback', 'Better Decisions', 'Cleaner Systems', 'Scalable Model']

/* ─────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────── */
export default function TargetTaskDashboardPage() {
  const navigate = useNavigate()
  const { mobileMode } = useViewMode()

  // Supabase data
  const { targets, loading: targetsLoading } = useTargets()
  const { priorities, loading: prioritiesLoading } = usePriorities()
  const { tasks, loading: tasksLoading, refetch: refetchTasks } = useTasks()
  const { toggleTaskCompletion, saving } = useTargetTaskMutations()

  const isLoading = targetsLoading || prioritiesLoading || tasksLoading

  // Group tasks by priority
  const prioritiesWithTasks = priorities.map((p) => ({
    ...p,
    tasks: tasks
      .filter((t) => t.priority_id === p.id)
      .sort((a, b) => a.sort_order - b.sort_order),
  }))

  // Progress
  const totalTasks = tasks.length
  const completedCount = tasks.filter((t) => t.is_completed).length
  const pct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  const handleToggleComplete = async (task) => {
    if (saving) return
    await toggleTaskCompletion(task.id, task.is_completed)
    refetchTasks()
  }

  // ── Loading state ──
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12 }}>
        <Loader2 size={32} color="#2563EB" className="animate-spin" />
        <span style={{ color: '#64748B', fontSize: 14 }}>Loading targets & tasks...</span>
      </div>
    )
  }

  /* ── render ─────────────────────────────── */
  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* ── HEADER ──────────────────────────── */}
      <div style={{ marginBottom: mobileMode ? 20 : 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Target size={mobileMode ? 22 : 28} color="#2563EB" />
          <h1 style={{ fontSize: mobileMode ? 20 : 28, fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
            Target & Task Dashboard
          </h1>
        </div>
        <div style={{
          display: 'flex',
          alignItems: mobileMode ? 'stretch' : 'center',
          flexDirection: mobileMode ? 'column' : 'row',
          gap: mobileMode ? 10 : 12,
          marginTop: mobileMode ? 8 : 0,
        }}>
          <p style={{ color: '#64748B', fontSize: mobileMode ? 13 : 14, margin: 0 }}>
            NexGen Priorities — Execution Task List
          </p>
          <button
            onClick={() => navigate('/targets/submit')}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: '#2563EB', color: '#fff', border: 'none',
              borderRadius: 8,
              padding: mobileMode ? '10px 14px' : '6px 14px',
              fontSize: mobileMode ? 13 : 12,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              width: mobileMode ? '100%' : 'auto',
            }}
          >
            <Plus size={mobileMode ? 16 : 14} /> Add New
          </button>
        </div>
      </div>

      {/* ── BIG TARGETS (single column, elongated) ── */}
      {targets.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <h2 style={{ fontSize: mobileMode ? 15 : 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Targets
          </h2>
          <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto' }}>
            {targets.length} total
          </span>
        </div>
      )}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: mobileMode ? 10 : 14,
        marginBottom: mobileMode ? 20 : 24,
      }}>
        {targets.map((t) => {
          // Parse a number out of the label as a fallback (e.g. "20 New Students" → 20)
          const labelMatch = String(t.label || '').match(/\d+/)
          const labelGoal = labelMatch ? parseInt(labelMatch[0], 10) : null
          const goal = t.goal_value ?? labelGoal ?? 0
          const current = t.current_value ?? 0
          const rawPct = goal > 0 ? (current / goal) * 100 : 0
          const targetPct = Math.max(0, Math.min(100, rawPct))
          const isComplete = goal > 0 && current >= goal

          return (
            <div
              key={t.id}
              style={{
                background: '#fff',
                borderRadius: 14,
                border: `2px solid ${t.color}20`,
                boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                display: 'flex',
                alignItems: 'stretch',
                overflow: 'hidden',
              }}
            >
              <div style={{
                flex: 1,
                minWidth: 0,
                padding: mobileMode ? '14px 16px' : '18px 24px',
              }}>
              {/* Header row: icon + label + current/goal + pct */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: mobileMode ? 22 : 26, lineHeight: 1 }}>{t.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: mobileMode ? 15 : 17,
                      fontWeight: 800,
                      color: t.color,
                      lineHeight: 1.2,
                    }}
                  >
                    {t.label}
                  </div>
                  {t.detail && (
                    <div
                      style={{
                        fontSize: mobileMode ? 11 : 12,
                        color: '#64748B',
                        marginTop: 2,
                        lineHeight: 1.3,
                      }}
                    >
                      {t.detail}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span
                    style={{
                      fontSize: mobileMode ? 18 : 22,
                      fontWeight: 800,
                      color: '#0F172A',
                      lineHeight: 1,
                    }}
                  >
                    {current}
                  </span>
                  <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>
                    / {goal || '—'}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: mobileMode ? 13 : 14,
                    fontWeight: 800,
                    color: isComplete ? '#10B981' : t.color,
                    whiteSpace: 'nowrap',
                    minWidth: 44,
                    textAlign: 'right',
                  }}
                >
                  {Math.round(targetPct)}%
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: 10,
                  borderRadius: 5,
                  background: '#F1F5F9',
                  marginTop: 12,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${targetPct}%`,
                    borderRadius: 5,
                    background: isComplete
                      ? 'linear-gradient(90deg, #10B981, #059669)'
                      : `linear-gradient(90deg, ${t.color}, ${t.color}cc)`,
                    transition: 'width .4s ease',
                  }}
                />
              </div>

              {/* Footer caption */}
              <div
                style={{
                  fontSize: 11,
                  color: '#94A3B8',
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                {isComplete
                  ? 'Target reached!'
                  : goal > 0
                    ? `${Math.max(goal - current, 0)} to go`
                    : 'Set a goal to track'}
              </div>
              </div>

              {/* Right-side click-through tab */}
              <button
                onClick={() => navigate(`/targets/progress#target-${t.id}`)}
                style={{
                  background: `${t.color}10`,
                  border: 'none',
                  borderLeft: `1px solid ${t.color}25`,
                  color: t.color,
                  cursor: 'pointer',
                  padding: mobileMode ? '0 12px' : '0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'inherit',
                  transition: 'background .15s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${t.color}25`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${t.color}10`
                }}
                title="Open target details"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )
        })}

      </div>

      {/* ── PER-TASK ELONGATED PROGRESS TILES ── */}
      {tasks.length > 0 && (
        <div style={{ marginBottom: mobileMode ? 28 : 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <h2 style={{ fontSize: mobileMode ? 15 : 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Tasks
            </h2>
            <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto' }}>
              {completedCount}/{totalTasks} done
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: mobileMode ? 8 : 10 }}>
            {prioritiesWithTasks.flatMap((priority) =>
              priority.tasks.map((task) => {
                const done = task.is_completed
                const taskPct = done ? 100 : 0
                const tc = TIMELINE_COLORS[task.timeline] || TIMELINE_COLORS.Ongoing

                return (
                  <div
                    key={task.id}
                    style={{
                      background: done ? '#F8FAFC' : '#fff',
                      borderRadius: 12,
                      border: `1.5px solid ${done ? '#E2E8F0' : priority.color + '30'}`,
                      boxShadow: done ? 'none' : '0 1px 3px rgba(0,0,0,.04)',
                      display: 'flex',
                      alignItems: 'stretch',
                      overflow: 'hidden',
                      transition: 'all .2s ease',
                    }}
                  >
                    {/* Main content */}
                    <div
                      style={{
                        flex: 1,
                        padding: mobileMode ? '12px 14px' : '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: mobileMode ? 10 : 14,
                        minWidth: 0,
                      }}
                    >
                      {/* Completion toggle */}
                      <button
                        onClick={() => handleToggleComplete(task)}
                        disabled={saving}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: saving ? 'wait' : 'pointer',
                          padding: 0,
                          flexShrink: 0,
                          display: 'flex',
                        }}
                        title={done ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {done ? (
                          <CheckCircle2 size={20} color="#16A34A" />
                        ) : (
                          <Circle size={20} color="#CBD5E1" />
                        )}
                      </button>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Title row */}
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              background: priority.color,
                              color: '#fff',
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 4,
                              letterSpacing: '.3px',
                              flexShrink: 0,
                            }}
                          >
                            {priority.code}
                          </span>
                          <span
                            style={{
                              fontSize: mobileMode ? 13 : 14,
                              fontWeight: 700,
                              color: done ? '#94A3B8' : '#0F172A',
                              textDecoration: done ? 'line-through' : 'none',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: mobileMode ? 'normal' : 'nowrap',
                              flex: mobileMode ? '1 1 100%' : '1 1 auto',
                              minWidth: 0,
                            }}
                          >
                            {task.task_number}. {task.name}
                          </span>
                          {!mobileMode && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: tc.text,
                                background: tc.bg,
                                border: `1px solid ${tc.border}`,
                                padding: '1px 7px',
                                borderRadius: 4,
                                flexShrink: 0,
                              }}
                            >
                              {task.timeline}
                            </span>
                          )}
                        </div>

                        {/* Progress bar */}
                        <div
                          style={{
                            height: 6,
                            borderRadius: 3,
                            background: '#F1F5F9',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${taskPct}%`,
                              borderRadius: 3,
                              background: done
                                ? 'linear-gradient(90deg, #10B981, #059669)'
                                : `linear-gradient(90deg, ${priority.color}, ${priority.color}cc)`,
                              transition: 'width .4s ease',
                            }}
                          />
                        </div>
                      </div>

                      {/* Percent */}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: done ? '#10B981' : priority.color,
                          flexShrink: 0,
                          minWidth: 36,
                          textAlign: 'right',
                        }}
                      >
                        {taskPct}%
                      </span>
                    </div>

                    {/* Right-side click-through tab */}
                    <button
                      onClick={() => navigate(`/targets/tasks#task-${task.id}`)}
                      style={{
                        background: done ? '#F1F5F9' : priority.color + '10',
                        border: 'none',
                        borderLeft: `1px solid ${done ? '#E2E8F0' : priority.color + '20'}`,
                        color: done ? '#64748B' : priority.color,
                        cursor: 'pointer',
                        padding: mobileMode ? '0 12px' : '0 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'inherit',
                        transition: 'background .15s',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = done ? '#E2E8F0' : priority.color + '25'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = done ? '#F1F5F9' : priority.color + '10'
                      }}
                      title="Open task details"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ── WHY ARE WE TRACKING EVERYTHING? ── */}
      <div
        style={{
          marginTop: mobileMode ? 28 : 40,
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: mobileMode ? '20px 18px' : '28px 28px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,.04)',
        }}
      >
        <h2 style={{ fontSize: mobileMode ? 16 : 18, fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
          Why Are We Tracking Everything?
        </h2>
        <p style={{ fontSize: mobileMode ? 12 : 13, color: '#64748B', margin: '0 0 16px 0' }}>
          Everything in this plan feeds into one outcome
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: mobileMode ? '1fr' : 'repeat(3, 1fr)', gap: mobileMode ? 10 : 12, marginBottom: mobileMode ? 20 : 24 }}>
          {STRATEGIC_THEMES.map((t) => (
            <div
              key={t.name}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                padding: '14px 16px',
              }}
            >
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginTop: 6 }}>
                {t.name}
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 1.4 }}>
                {t.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Flow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {FLOW_STEPS.map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  background: '#EFF6FF',
                  color: '#2563EB',
                  border: '1px solid #BFDBFE',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 8,
                }}
              >
                {step}
              </span>
              {i < FLOW_STEPS.length - 1 && <ArrowRight size={16} color="#CBD5E1" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────── */}
      <div style={{ textAlign: 'center', padding: '28px 0 12px', fontSize: 12, color: '#94A3B8' }}>
        NexGen Priorities · Brandwave Holdings · Prepared Feb 2026
      </div>
    </div>
  )
}
