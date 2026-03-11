import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronRight,
  Clock,
  User2,
  ExternalLink,
  CheckCircle2,
  Circle,
  ArrowRight,
  Target,
  Pencil,
  Loader2,
  Plus,
} from 'lucide-react'
import { useTargets } from '../hooks/useTargets'
import { usePriorities } from '../hooks/usePriorities'
import { useTasks } from '../hooks/useTasks'
import { useTargetTaskMutations } from '../hooks/useTargetTaskMutations'

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

  // Supabase data
  const { targets, loading: targetsLoading } = useTargets()
  const { priorities, loading: prioritiesLoading } = usePriorities()
  const { tasks, loading: tasksLoading, refetch: refetchTasks } = useTasks()
  const { toggleTaskCompletion, saving } = useTargetTaskMutations()

  const [expandedTasks, setExpandedTasks] = useState(new Set())

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

  const toggleExpand = (id) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
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
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <Target size={28} color="#2563EB" />
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Target & Task Dashboard
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
            NexGen Priorities — Execution Task List
          </p>
          <button
            onClick={() => navigate('/targets/submit')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#2563EB', color: '#fff', border: 'none',
              borderRadius: 8, padding: '6px 14px', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Plus size={14} /> Add New
          </button>
        </div>
      </div>

      {/* ── BIG TARGETS + PROGRESS ──────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: targets.length > 0 ? `repeat(${Math.min(targets.length + 1, 4)}, 1fr)` : '1fr', gap: 16, marginBottom: 32 }}>
        {targets.map((t) => (
          <div
            key={t.id}
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: '20px 24px',
              border: `2px solid ${t.color}20`,
              boxShadow: '0 1px 3px rgba(0,0,0,.04)',
            }}
          >
            <span style={{ fontSize: 28 }}>{t.icon}</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: t.color, marginTop: 6 }}>{t.label}</div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{t.detail}</div>
          </div>
        ))}

        {/* Progress card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            padding: '20px 24px',
            border: '2px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Overall Progress</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>
              {completedCount}/{totalTasks}
            </span>
          </div>
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
                width: `${pct}%`,
                borderRadius: 5,
                background: completedCount === totalTasks && totalTasks > 0 ? '#16A34A' : '#2563EB',
                transition: 'width .4s ease',
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>
            {completedCount === totalTasks && totalTasks > 0 ? 'All tasks complete!' : `${pct}% complete · ${totalTasks - completedCount} remaining`}
          </div>
        </div>
      </div>

      {/* ── PRIORITY SECTIONS ───────────────── */}
      {prioritiesWithTasks.map((priority) => {
        const priTasks = priority.tasks
        if (priTasks.length === 0) return null
        const priDone = priTasks.filter((t) => t.is_completed).length

        return (
          <div key={priority.id} style={{ marginBottom: 28 }}>
            {/* Priority header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12,
              }}
            >
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
                    <div style={{ padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      {/* Completion toggle */}
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
                        {/* Task name + badges */}
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

                          {/* Timeline pill */}
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

                        {/* Objective */}
                        <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                          {task.objective}
                        </p>

                        {/* Meta row */}
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

                        {/* Owner note */}
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

                        {/* Cross-links */}
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

                        {/* Expand / collapse action steps */}
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

                    {/* Expanded section */}
                    {expanded && (
                      <div
                        style={{
                          borderTop: '1px solid #F1F5F9',
                          padding: '14px 20px 16px 56px',
                          background: '#FAFBFC',
                        }}
                      >
                        {/* Notes */}
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

                        {/* Steps */}
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

      {/* ── STRATEGIC THEMES ────────────────── */}
      <div
        style={{
          marginTop: 40,
          background: '#0F172A',
          borderRadius: 16,
          padding: '28px 28px 24px',
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
          Strategic Themes
        </h2>
        <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 20px 0' }}>
          Everything in this plan feeds into one outcome
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {STRATEGIC_THEMES.map((t) => (
            <div
              key={t.name}
              style={{
                background: '#1E293B',
                borderRadius: 10,
                padding: '14px 16px',
              }}
            >
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9', marginTop: 6 }}>
                {t.name}
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2, lineHeight: 1.4 }}>
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
                  background: '#2563EB',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 8,
                }}
              >
                {step}
              </span>
              {i < FLOW_STEPS.length - 1 && <ArrowRight size={16} color="#475569" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────── */}
      <div style={{ textAlign: 'center', padding: '28px 0 12px', fontSize: 12, color: '#CBD5E1' }}>
        NexGen Priorities · Brandwave Holdings · Prepared Feb 2026
      </div>
    </div>
  )
}
