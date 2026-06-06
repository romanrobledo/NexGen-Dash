import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Target as TargetIcon,
  TrendingUp,
  Plus,
  Minus,
  Check,
  Edit3,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { useTargets } from '../hooks/useTargets'
import { useTargetTaskMutations } from '../hooks/useTargetTaskMutations'
import { useViewMode } from '../contexts/ViewModeContext'

/* ─────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────── */

/** Parse a number out of a label like "20 New Students" → 20 (fallback when goal_value is null) */
function inferGoalFromLabel(label) {
  if (!label) return null
  const match = String(label).match(/\d+/)
  return match ? parseInt(match[0], 10) : null
}

function clampPct(pct) {
  if (Number.isNaN(pct)) return 0
  return Math.max(0, Math.min(100, pct))
}

/* ─────────────────────────────────────────────
   PROGRESS CARD
   ───────────────────────────────────────────── */

function TargetCard({ target, onUpdate }) {
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalDraft, setGoalDraft] = useState('')
  const [editingCurrent, setEditingCurrent] = useState(false)
  const [currentDraft, setCurrentDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const goalFallback = inferGoalFromLabel(target.label)
  const goal = target.goal_value ?? goalFallback ?? 0
  const current = target.current_value ?? 0
  const pct = goal > 0 ? clampPct((current / goal) * 100) : 0
  const isComplete = goal > 0 && current >= goal

  async function save(updates) {
    setSaving(true)
    await onUpdate(target.id, updates)
    setSaving(false)
  }

  async function handleIncrement() {
    await save({ current_value: current + 1 })
  }

  async function handleDecrement() {
    if (current <= 0) return
    await save({ current_value: current - 1 })
  }

  async function commitGoal() {
    const n = parseInt(goalDraft, 10)
    if (!Number.isNaN(n) && n >= 0) {
      await save({ goal_value: n })
    }
    setEditingGoal(false)
  }

  async function commitCurrent() {
    const n = parseInt(currentDraft, 10)
    if (!Number.isNaN(n) && n >= 0) {
      await save({ current_value: n })
    }
    setEditingCurrent(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all">
      {/* Header: icon + label */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: `${target.color}15` }}
        >
          {target.icon || '🎯'}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-base font-extrabold leading-tight truncate"
            style={{ color: target.color || '#0F172A' }}
          >
            {target.label}
          </h3>
          {target.detail && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{target.detail}</p>
          )}
        </div>
        {isComplete && (
          <div className="shrink-0 flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wide">
            <CheckCircle2 className="w-3 h-3" /> Done
          </div>
        )}
      </div>

      {/* Current / Goal row */}
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-1">
          {editingCurrent ? (
            <input
              type="number"
              autoFocus
              min="0"
              value={currentDraft}
              onChange={(e) => setCurrentDraft(e.target.value)}
              onBlur={commitCurrent}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitCurrent()
                if (e.key === 'Escape') setEditingCurrent(false)
              }}
              className="w-16 text-2xl font-extrabold text-gray-900 border-b-2 border-blue-400 outline-none bg-transparent"
            />
          ) : (
            <button
              onClick={() => {
                setCurrentDraft(String(current))
                setEditingCurrent(true)
              }}
              className="text-2xl font-extrabold text-gray-900 hover:text-blue-600 transition-colors"
              title="Click to edit current value"
            >
              {current}
            </button>
          )}
          <span className="text-sm text-gray-400 font-medium">
            / {editingGoal ? (
              <input
                type="number"
                autoFocus
                min="0"
                value={goalDraft}
                onChange={(e) => setGoalDraft(e.target.value)}
                onBlur={commitGoal}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitGoal()
                  if (e.key === 'Escape') setEditingGoal(false)
                }}
                className="w-14 text-sm text-gray-600 border-b border-gray-300 outline-none bg-transparent"
              />
            ) : (
              <button
                onClick={() => {
                  setGoalDraft(String(goal))
                  setEditingGoal(true)
                }}
                className="text-gray-500 hover:text-blue-600 transition-colors"
                title="Click to edit goal"
              >
                {goal || '—'}
                <Edit3 className="w-3 h-3 inline ml-1 opacity-40" />
              </button>
            )}
          </span>
        </div>
        <span
          className="text-sm font-bold"
          style={{ color: isComplete ? '#10B981' : target.color || '#2563EB' }}
        >
          {Math.round(pct)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: isComplete
              ? 'linear-gradient(90deg, #10B981, #059669)'
              : `linear-gradient(90deg, ${target.color || '#2563EB'}, ${target.color || '#2563EB'}dd)`,
          }}
        />
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          disabled={saving || current <= 0}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Decrement"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleIncrement}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-white text-sm font-semibold transition-colors disabled:opacity-60"
          style={{ backgroundColor: target.color || '#2563EB' }}
          title="Increment"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>Add 1</span>
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────── */

export default function TargetsProgressPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { targets, loading, error, refetch } = useTargets()
  const { updateTarget } = useTargetTaskMutations()
  const { mobileMode } = useViewMode()

  async function handleUpdate(id, updates) {
    const { error: err } = await updateTarget(id, updates)
    if (!err) await refetch()
  }

  // Auto-scroll + highlight target when #target-<id> hash present
  useEffect(() => {
    if (!location.hash || loading) return
    const match = location.hash.match(/^#target-(.+)$/)
    if (!match) return
    const targetId = match[1]
    setTimeout(() => {
      const el = document.getElementById(`target-${targetId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const inner = el.firstElementChild
        if (inner) {
          inner.style.transition = 'box-shadow .4s ease'
          inner.style.boxShadow = '0 0 0 3px #BFDBFE'
          setTimeout(() => {
            inner.style.boxShadow = ''
          }, 1600)
        }
      }
    }, 150)
  }, [location.hash, loading, targets.length])

  // Aggregate stats
  const stats = useMemo(() => {
    if (!targets.length) return { total: 0, complete: 0, avg: 0 }
    let totalPct = 0
    let complete = 0
    targets.forEach((t) => {
      const goalFallback = inferGoalFromLabel(t.label)
      const goal = t.goal_value ?? goalFallback ?? 0
      const current = t.current_value ?? 0
      if (goal > 0) {
        const pct = clampPct((current / goal) * 100)
        totalPct += pct
        if (current >= goal) complete += 1
      }
    })
    return {
      total: targets.length,
      complete,
      avg: Math.round(totalPct / targets.length),
    }
  }, [targets])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-500 text-sm">Loading targets...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">Failed to load targets</p>
        <p className="text-red-400 text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className={`mb-6 ${mobileMode ? 'flex flex-col gap-3' : 'flex items-start justify-between'}`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <TargetIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Targets</h1>
            <p className="text-sm text-gray-500">
              Track progress toward each business goal
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/targets/submit')}
          className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${mobileMode ? 'w-full' : ''}`}
        >
          <Plus className="w-4 h-4" />
          New Target
        </button>
      </div>

      {/* Stat strip */}
      <div className={`grid ${mobileMode ? 'grid-cols-3 gap-3' : 'grid-cols-3 gap-4'} mb-6`}>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Total
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Completed
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {stats.complete}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Avg
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{stats.avg}%</div>
        </div>
      </div>

      {/* Target cards grid */}
      {targets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <TargetIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No targets yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Create your first target to start tracking progress.
          </p>
          <button
            onClick={() => navigate('/targets/submit')}
            className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> New Target
          </button>
        </div>
      ) : (
        <div
          className={`grid gap-4 ${
            mobileMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {targets.map((t) => (
            <div key={t.id} id={`target-${t.id}`}>
              <TargetCard target={t} onUpdate={handleUpdate} />
            </div>
          ))}
        </div>
      )}

      {/* Footer note about the migration */}
      <p className="text-xs text-gray-400 mt-6 text-center">
        Tip: click any number to edit it directly. Progress is saved automatically.
      </p>
    </div>
  )
}
