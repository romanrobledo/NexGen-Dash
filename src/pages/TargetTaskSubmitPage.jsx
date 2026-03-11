import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Target,
  ListChecks,
  Plus,
  X,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { usePriorities } from '../hooks/usePriorities'
import { useTargetTaskMutations } from '../hooks/useTargetTaskMutations'

/* ─────────────────────────────────────────────
   CONSTANTS
   ───────────────────────────────────────────── */
const TIMELINE_OPTIONS = [
  'Immediate',
  'Week 1-2',
  'Week 2-3',
  'Week 2-4',
  'Before Break',
  'After 30 Days',
  'Ongoing',
]

const COLOR_PRESETS = [
  '#2563EB', '#7C3AED', '#059669', '#D97706',
  '#10B981', '#EC4899', '#6366F1', '#EAB308',
  '#DC2626', '#0EA5E9',
]

const ICON_PRESETS = ['🎯', '⭐', '📈', '🏆', '💡', '🔥', '🚀', '💰', '🎓', '🏗️']

const AVAILABLE_PAGES = [
  { label: 'Who Are We', path: '/dashboard/who-are-we' },
  { label: 'What Do I Do', path: '/dashboard/what-do-i-do' },
  { label: 'How Do I Do It', path: '/dashboard/how-do-i-do-it' },
  { label: 'When Do I Do It', path: '/dashboard/when-do-i-do-it' },
  { label: 'Why Is It Important', path: '/dashboard/why-is-it-important' },
  { label: 'How Do I Know', path: '/dashboard/how-do-i-know' },
  { label: 'When Do We Meet', path: '/dashboard/when-do-we-meet' },
  { label: 'What Do We Talk About', path: '/dashboard/what-do-we-talk-about' },
  { label: 'Where Do We Go', path: '/dashboard/where-to-go' },
  { label: 'Important Metrics', path: '/dashboard/important-metrics' },
  { label: 'Library', path: '/trainings' },
  { label: 'Onboarding', path: '/trainings/onboarding' },
  { label: 'Tools Library', path: '/trainings/tools' },
  { label: "How To's", path: '/trainings/howtos' },
  { label: 'Content Calendar', path: '/calendars/content' },
]

/* ─────────────────────────────────────────────
   SHARED STYLES
   ───────────────────────────────────────────── */
const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  fontSize: 14,
  border: '1.5px solid #E2E8F0',
  borderRadius: 10,
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color .15s',
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#334155',
  marginBottom: 6,
}

/* ─────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────── */
export default function TargetTaskSubmitPage() {
  const navigate = useNavigate()
  const { priorities, loading: priLoading } = usePriorities()
  const { createTarget, createPriority, createTask, saving } = useTargetTaskMutations()

  const [activeTab, setActiveTab] = useState('target') // 'target' | 'task'
  const [success, setSuccess] = useState(false)

  // ── Target form state ──
  const [targetLabel, setTargetLabel] = useState('')
  const [targetDetail, setTargetDetail] = useState('')
  const [targetIcon, setTargetIcon] = useState('🎯')
  const [targetColor, setTargetColor] = useState('#2563EB')

  // ── Task form state ──
  const [taskPriorityId, setTaskPriorityId] = useState('')
  const [newPriMode, setNewPriMode] = useState(false)
  const [newPriName, setNewPriName] = useState('')
  const [newPriColor, setNewPriColor] = useState('#2563EB')
  const [taskName, setTaskName] = useState('')
  const [taskObjective, setTaskObjective] = useState('')
  const [taskTime, setTaskTime] = useState('')
  const [taskTimeline, setTaskTimeline] = useState('Ongoing')
  const [taskOwner, setTaskOwner] = useState('')
  const [taskOwnerNote, setTaskOwnerNote] = useState('')
  const [taskTools, setTaskTools] = useState([])
  const [toolInput, setToolInput] = useState('')
  const [taskNotes, setTaskNotes] = useState([])
  const [noteInput, setNoteInput] = useState('')
  const [taskSteps, setTaskSteps] = useState([])
  const [stepInput, setStepInput] = useState('')
  const [taskCrossLinks, setTaskCrossLinks] = useState([])

  // ── Handlers ──
  const addTool = () => {
    if (toolInput.trim()) {
      setTaskTools([...taskTools, toolInput.trim()])
      setToolInput('')
    }
  }

  const addNote = () => {
    if (noteInput.trim()) {
      setTaskNotes([...taskNotes, noteInput.trim()])
      setNoteInput('')
    }
  }

  const addStep = () => {
    if (stepInput.trim()) {
      setTaskSteps([...taskSteps, stepInput.trim()])
      setStepInput('')
    }
  }

  const toggleCrossLink = (page) => {
    setTaskCrossLinks((prev) => {
      const exists = prev.find((l) => l.path === page.path)
      if (exists) return prev.filter((l) => l.path !== page.path)
      return [...prev, { label: page.label, path: page.path }]
    })
  }

  // ── Submit Target ──
  const handleSubmitTarget = async () => {
    if (!targetLabel.trim()) return
    const { error } = await createTarget({
      label: targetLabel.trim(),
      detail: targetDetail.trim(),
      icon: targetIcon,
      color: targetColor,
      sort_order: 99,
    })
    if (!error) {
      setSuccess(true)
      setTimeout(() => navigate('/targets'), 1200)
    }
  }

  // ── Submit Task ──
  const handleSubmitTask = async () => {
    if (!taskName.trim()) return

    let priorityId = taskPriorityId

    // Create new priority if needed
    if (newPriMode && newPriName.trim()) {
      const code = `P${priorities.length + 1}`
      const { data: newPri, error: priError } = await createPriority({
        code,
        name: newPriName.trim(),
        color: newPriColor,
        sort_order: priorities.length + 1,
      })
      if (priError) return
      priorityId = newPri.id
    }

    if (!priorityId) return

    const { error } = await createTask({
      priority_id: priorityId,
      task_number: 0, // auto-assign
      name: taskName.trim(),
      objective: taskObjective.trim(),
      time_estimate: taskTime.trim(),
      timeline: taskTimeline,
      owner: taskOwner.trim(),
      owner_note: taskOwnerNote.trim(),
      tools: taskTools,
      notes: taskNotes,
      steps: taskSteps,
      cross_links: taskCrossLinks,
      sort_order: 99,
    })
    if (!error) {
      setSuccess(true)
      setTimeout(() => navigate('/targets'), 1200)
    }
  }

  // ── Success overlay ──
  if (success) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
        <CheckCircle2 size={56} color="#16A34A" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A' }}>
          {activeTab === 'target' ? 'Target' : 'Task'} Created!
        </h2>
        <p style={{ color: '#64748B', marginTop: 8 }}>Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button
          onClick={() => navigate('/targets')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 10, border: '1.5px solid #E2E8F0',
            background: '#fff', cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} color="#64748B" />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Submit New
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
            Add a new target or task to the NexGen Priorities
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#F1F5F9', borderRadius: 12, padding: 4 }}>
        {[
          { key: 'target', label: 'New Target', icon: Target },
          { key: 'task', label: 'New Task', icon: ListChecks },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 0',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'inherit',
              background: activeTab === tab.key ? '#fff' : 'transparent',
              color: activeTab === tab.key ? '#0F172A' : '#94A3B8',
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
              transition: 'all .15s',
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TARGET FORM ────────────────────── */}
      {activeTab === 'target' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E2E8F0', padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Target Label *</label>
            <input
              style={inputStyle}
              placeholder="e.g. 20 New Students"
              value={targetLabel}
              onChange={(e) => setTargetLabel(e.target.value)}
              onFocus={(e) => { e.target.style.borderColor = '#2563EB' }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8F0' }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Detail / Description</label>
            <input
              style={inputStyle}
              placeholder="e.g. Robyn + Robyne + Ed"
              value={targetDetail}
              onChange={(e) => setTargetDetail(e.target.value)}
              onFocus={(e) => { e.target.style.borderColor = '#2563EB' }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8F0' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ICON_PRESETS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setTargetIcon(icon)}
                    style={{
                      width: 40, height: 40, borderRadius: 10, fontSize: 20,
                      border: targetIcon === icon ? '2px solid #2563EB' : '1.5px solid #E2E8F0',
                      background: targetIcon === icon ? '#EFF6FF' : '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Color</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setTargetColor(c)}
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: c,
                      border: targetColor === c ? '3px solid #0F172A' : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 24, border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px' }}>Preview</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{targetIcon}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: targetColor }}>{targetLabel || 'Target Label'}</div>
                <div style={{ fontSize: 13, color: '#64748B' }}>{targetDetail || 'Detail text'}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmitTarget}
            disabled={saving || !targetLabel.trim()}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 12,
              border: 'none', cursor: saving || !targetLabel.trim() ? 'not-allowed' : 'pointer',
              background: saving || !targetLabel.trim() ? '#CBD5E1' : '#2563EB',
              color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {saving ? 'Creating...' : 'Create Target'}
          </button>
        </div>
      )}

      {/* ── TASK FORM ──────────────────────── */}
      {activeTab === 'task' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E2E8F0', padding: 28 }}>

          {/* Priority selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Priority Group *</label>
            {!newPriMode ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  style={{ ...inputStyle, flex: 1, cursor: 'pointer' }}
                  value={taskPriorityId}
                  onChange={(e) => setTaskPriorityId(e.target.value)}
                >
                  <option value="">Select a priority...</option>
                  {priorities.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setNewPriMode(true)}
                  style={{
                    padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0',
                    background: '#F8FAFC', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    color: '#2563EB', whiteSpace: 'nowrap', fontFamily: 'inherit',
                  }}
                >
                  + New Priority
                </button>
              </div>
            ) : (
              <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 16, border: '1px solid #BFDBFE' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>New Priority</span>
                  <button onClick={() => setNewPriMode(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={16} color="#94A3B8" />
                  </button>
                </div>
                <input
                  style={{ ...inputStyle, marginBottom: 10 }}
                  placeholder="Priority name (e.g. Content Strategy)"
                  value={newPriName}
                  onChange={(e) => setNewPriName(e.target.value)}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewPriColor(c)}
                      style={{
                        width: 28, height: 28, borderRadius: 7, background: c,
                        border: newPriColor === c ? '3px solid #0F172A' : '2px solid transparent',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Name + Objective */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Task Name *</label>
            <input
              style={inputStyle}
              placeholder="e.g. Build Customer Referral Program"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onFocus={(e) => { e.target.style.borderColor = '#2563EB' }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8F0' }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Objective</label>
            <textarea
              style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
              placeholder="One-line goal for this task..."
              value={taskObjective}
              onChange={(e) => setTaskObjective(e.target.value)}
              onFocus={(e) => { e.target.style.borderColor = '#2563EB' }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8F0' }}
            />
          </div>

          {/* Time + Timeline + Owner row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Est. Time</label>
              <input
                style={inputStyle}
                placeholder="e.g. 4-6 hours"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Timeline</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={taskTimeline}
                onChange={(e) => setTaskTimeline(e.target.value)}
              >
                {TIMELINE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Owner</label>
              <input
                style={inputStyle}
                placeholder="e.g. Andrea"
                value={taskOwner}
                onChange={(e) => setTaskOwner(e.target.value)}
              />
            </div>
          </div>

          {/* Owner note */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Owner Note <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional)</span></label>
            <input
              style={inputStyle}
              placeholder="e.g. Target = 5 Booked Tours / week"
              value={taskOwnerNote}
              onChange={(e) => setTaskOwnerNote(e.target.value)}
            />
          </div>

          {/* Tools multi-tag */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Tools</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Type a tool name and press Enter..."
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTool() } }}
              />
              <button onClick={addTool} style={{ padding: '0 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer' }}>
                <Plus size={16} color="#64748B" />
              </button>
            </div>
            {taskTools.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {taskTools.map((tool, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: '#F1F5F9', padding: '4px 10px', borderRadius: 8,
                      fontSize: 12, fontWeight: 500, color: '#334155',
                    }}
                  >
                    {tool}
                    <button onClick={() => setTaskTools(taskTools.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <X size={12} color="#94A3B8" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes list builder */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Founder's Notes</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Add a note..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNote() } }}
              />
              <button onClick={addNote} style={{ padding: '0 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer' }}>
                <Plus size={16} color="#64748B" />
              </button>
            </div>
            {taskNotes.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                {taskNotes.map((note, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: '#FFF7ED', border: '1px solid #FED7AA',
                      borderRadius: 8, padding: '6px 12px', fontSize: 13, color: '#78350F',
                    }}
                  >
                    <span style={{ flex: 1 }}>{note}</span>
                    <button onClick={() => setTaskNotes(taskNotes.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <X size={14} color="#9A3412" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Steps list builder */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Action Steps</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Add an action step..."
                value={stepInput}
                onChange={(e) => setStepInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStep() } }}
              />
              <button onClick={addStep} style={{ padding: '0 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer' }}>
                <Plus size={16} color="#64748B" />
              </button>
            </div>
            {taskSteps.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                {taskSteps.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: '#F8FAFC', border: '1px solid #E2E8F0',
                      borderRadius: 8, padding: '6px 12px', fontSize: 13, color: '#334155',
                    }}
                  >
                    <span style={{
                      flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                      background: '#EFF6FF', color: '#2563EB', fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ flex: 1 }}>{step}</span>
                    <button onClick={() => setTaskSteps(taskSteps.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <X size={14} color="#94A3B8" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cross-links page selector */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Cross-Links to NexGen OS Pages</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {AVAILABLE_PAGES.map((page) => {
                const selected = taskCrossLinks.some((l) => l.path === page.path)
                return (
                  <button
                    key={page.path}
                    onClick={() => toggleCrossLink(page)}
                    style={{
                      padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                      border: `1.5px solid ${selected ? '#2563EB' : '#E2E8F0'}`,
                      background: selected ? '#EFF6FF' : '#fff',
                      color: selected ? '#2563EB' : '#64748B',
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all .15s',
                    }}
                  >
                    {selected ? '✓ ' : ''}{page.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmitTask}
            disabled={saving || !taskName.trim() || (!taskPriorityId && !(newPriMode && newPriName.trim()))}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 12,
              border: 'none',
              cursor: saving || !taskName.trim() ? 'not-allowed' : 'pointer',
              background: saving || !taskName.trim() ? '#CBD5E1' : '#2563EB',
              color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {saving ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      )}
    </div>
  )
}
