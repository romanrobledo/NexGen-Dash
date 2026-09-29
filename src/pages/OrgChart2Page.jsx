import { useMemo, useRef, useState, useEffect } from 'react'
import { GitBranch, Phone, Mail } from 'lucide-react'

/**
 * Greenfield org chart — mirrors Roman's Miro diagram exactly.
 *
 * Structure (top to bottom):
 *   Row 1: Role-title tags   (Cook, Custodian, Assistant Operator,
 *                             Head Afterschool)
 *   Row 2: Support layer     (Leti, Belle, Abby, Margo) — each pinned
 *                             under their role-title tag.
 *   Row 3: Leadership row    (Roman, Robyn, Rachel)
 *   Row 4: Teachers          (six teachers, all reporting to both
 *                             Robyn and Rachel)
 *
 * SVG connectors are drawn AFTER the layout mounts by measuring tile
 * bounding boxes — no hardcoded pixel positions, so the diagram
 * reflows correctly on window resize and on mobile stacking.
 *
 * The old /org-chart page + roleContent lib stay put — Roman will
 * merge them into this page once the visual anchor exists.
 */

// ── Data ─────────────────────────────────────────────────────────────────────
const FOUNDER = {
  id: 'roman',
  name: 'Roman Robledo',
  title: 'Founder',
  email: 'office@romanrobledo.com',
  phone: '',
  tone: 'founder',
}

const LEADERSHIP = [
  {
    id: 'robyn',
    name: 'Robyn Hernandez',
    title: 'Operator',
    email: 'salinasrobyn@gmail.com',
    phone: '(956) 244-2665',
    tone: 'operator',
  },
  {
    id: 'rachel',
    name: 'Raquel Lopez',
    nickname: 'Rachel',
    title: 'Director',
    email: 'rachellopez1968@gmail.com',
    phone: '(956) 456-5700',
    tone: 'director',
  },
]

const SUPPORT = [
  {
    id: 'leti',
    name: 'Leticia Martinez',
    nickname: 'Leti',
    role: 'Cook',
    reportsTo: ['robyn'],
    tone: 'support',
  },
  {
    id: 'belle',
    name: 'Belia Azua',
    nickname: 'Belle',
    role: 'Custodian',
    reportsTo: ['robyn'],
    tone: 'support',
  },
  {
    id: 'abby',
    name: 'Maria Martinez',
    nickname: 'Abby',
    role: 'Assistant Operator',
    reportsTo: ['robyn', 'rachel'],
    tone: 'support',
  },
  {
    id: 'margo',
    name: 'Margo Rivas',
    role: 'Head Afterschool',
    reportsTo: ['rachel'],
    tone: 'support',
  },
]

const TEACHERS = [
  { id: 'sylvia',   name: 'Sylvia Rivera' },
  { id: 'maryjane', name: 'Mary Jane Almanza' },
  { id: 'joanna',   name: 'Joanna Segura' },
  { id: 'anjelica', name: 'Anjelica Sanchez' },
  { id: 'alexa',    name: 'Alexa Saldivar' },
  { id: 'ruth',     name: 'Ruth Ramirez' },
]

// Every teacher reports to both Robyn and Rachel.
const TEACHER_MANAGERS = ['robyn', 'rachel']

// ── Page ─────────────────────────────────────────────────────────────────────
export default function OrgChart2Page() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Header />
      <ChartCanvas />
      <Legend />
    </div>
  )
}

function Header() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-blue-600" />
          Org Chart 2
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Working visual tree — matches Roman's Miro diagram. The original
          role-based Org Chart stays at <code className="px-1 py-0.5 rounded bg-gray-100 text-xs">/org-chart</code> until we merge the two.
        </p>
      </div>
    </div>
  )
}

/**
 * The tree. Uses a plain CSS layout for tile positions and an SVG
 * overlay that measures every tile's DOMRect to draw connectors on top.
 * Connectors reposition automatically on window resize.
 */
function ChartCanvas() {
  const canvasRef = useRef(/** @type {HTMLDivElement|null} */ (null))
  const tileRefs = useRef(/** @type {Map<string, HTMLDivElement>} */ (new Map()))
  const [edges, setEdges] = useState(/** @type {Edge[]} */ ([]))

  // Reporting relationships → edges. From/To are tile ids.
  const relationships = useMemo(() => {
    /** @type {{from: string, to: string, tone: 'primary'|'secondary'}[]} */
    const out = []
    // Roman ↑ Robyn ↑ Rachel
    out.push({ from: 'robyn',  to: 'roman', tone: 'primary' })
    out.push({ from: 'rachel', to: 'robyn', tone: 'primary' })
    // Support → managers (also draw a small hop up to the role tag).
    for (const s of SUPPORT) {
      out.push({ from: s.id, to: `role-${s.id}`, tone: 'role' })
      for (const mgr of s.reportsTo) {
        out.push({ from: s.id, to: mgr, tone: 'primary' })
      }
    }
    // Teachers → both managers.
    for (const t of TEACHERS) {
      for (const mgr of TEACHER_MANAGERS) {
        out.push({ from: t.id, to: mgr, tone: 'secondary' })
      }
    }
    return out
  }, [])

  // Layout effect: after every render, remeasure tiles and rebuild the
  // edge geometry. Also re-run on window resize.
  useEffect(() => {
    function recompute() {
      const canvas = canvasRef.current
      if (!canvas) return
      const canvasRect = canvas.getBoundingClientRect()
      const next = []
      for (const rel of relationships) {
        const a = tileRefs.current.get(rel.from)
        const b = tileRefs.current.get(rel.to)
        if (!a || !b) continue
        const ar = a.getBoundingClientRect()
        const br = b.getBoundingClientRect()
        // Anchor points: bottom-center of `from`, top-center of `to`.
        // Or top-center / bottom-center depending on relative position.
        const aCenterX = ar.left + ar.width / 2 - canvasRect.left
        const bCenterX = br.left + br.width / 2 - canvasRect.left
        const aY = (ar.top + ar.height / 2 < br.top + br.height / 2 ? ar.bottom : ar.top) - canvasRect.top
        const bY = (ar.top + ar.height / 2 < br.top + br.height / 2 ? br.top : br.bottom) - canvasRect.top
        next.push({
          from: rel.from,
          to: rel.to,
          tone: rel.tone,
          x1: aCenterX,
          y1: aY,
          x2: bCenterX,
          y2: bY,
        })
      }
      setEdges(next)
    }
    recompute()
    const ro = new ResizeObserver(recompute)
    if (canvasRef.current) ro.observe(canvasRef.current)
    window.addEventListener('resize', recompute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', recompute)
    }
  }, [relationships])

  const registerTile = (id) => (el) => {
    if (el) tileRefs.current.set(id, el)
    else tileRefs.current.delete(id)
  }

  return (
    <div
      ref={canvasRef}
      className="relative bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 overflow-x-auto"
    >
      {/* SVG connector overlay — sits above the tiles but pointer-events
          none so tile clicks still work. */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {edges.map((e, i) => (
          <line
            key={i}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            className={
              e.tone === 'role'
                ? 'stroke-gray-300'
                : e.tone === 'secondary'
                  ? 'stroke-blue-200'
                  : 'stroke-blue-400'
            }
            strokeWidth={e.tone === 'primary' ? 2 : 1.5}
            strokeDasharray={e.tone === 'role' ? '4 3' : undefined}
          />
        ))}
      </svg>

      <div className="relative space-y-10" style={{ zIndex: 2 }}>
        {/* Row 1 — role tags for the four support people (Cook, Custodian, etc.) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUPPORT.map((s) => (
            <RoleTag key={s.id} innerRef={registerTile(`role-${s.id}`)} label={s.role} />
          ))}
        </div>

        {/* Row 2 — Support layer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUPPORT.map((s) => (
            <PersonTile key={s.id} innerRef={registerTile(s.id)} person={s} />
          ))}
        </div>

        {/* Row 3 — Leadership. Roman on the left, Robyn center, Rachel right. */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start pt-2">
          <PersonTile innerRef={registerTile(FOUNDER.id)} person={FOUNDER} />
          <PersonTile innerRef={registerTile('robyn')} person={LEADERSHIP[0]} />
          <PersonTile innerRef={registerTile('rachel')} person={LEADERSHIP[1]} />
        </div>

        {/* Row 4 — Teachers */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {TEACHERS.map((t) => (
            <PersonTile key={t.id} innerRef={registerTile(t.id)} person={{ ...t, tone: 'teacher' }} compact />
          ))}
        </div>
      </div>
    </div>
  )
}

function RoleTag({ innerRef, label }) {
  return (
    <div
      ref={innerRef}
      className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-center"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
        Role
      </p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5">{label}</p>
    </div>
  )
}

function PersonTile({ innerRef, person, compact }) {
  const tones = {
    founder:  'border-purple-300 bg-purple-50',
    operator: 'border-blue-300 bg-blue-50',
    director: 'border-emerald-300 bg-emerald-50',
    support:  'border-amber-200 bg-amber-50',
    teacher:  'border-gray-200 bg-white',
  }
  const cls = tones[person.tone] || tones.teacher
  const displayName = person.name
  const displayTitle = person.title || person.role

  return (
    <div
      ref={innerRef}
      className={`rounded-xl border ${cls} p-3 shadow-sm ${compact ? 'text-center' : ''}`}
    >
      <div className={compact ? '' : 'flex items-start gap-3'}>
        <div className={`w-8 h-8 rounded-full bg-white/70 border border-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-700 shrink-0 ${compact ? 'mx-auto mb-1.5' : ''}`}>
          {getInitials(displayName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-bold text-gray-900 truncate`}>
            {displayName}
          </p>
          {person.nickname && (
            <p className="text-[11px] text-gray-500">"{person.nickname}"</p>
          )}
          {displayTitle && (
            <p className={`text-[11px] text-gray-600 ${compact ? '' : 'mt-0.5'}`}>{displayTitle}</p>
          )}
          {!compact && (person.phone || person.email) && (
            <div className="mt-1.5 text-[11px] text-gray-500 space-y-0.5">
              {person.phone && (
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-gray-400" />
                  {person.phone}
                </p>
              )}
              {person.email && (
                <p className="flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="truncate">{person.email}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500 px-2">
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-4 h-0.5 bg-blue-400" />
        Reports to
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-4 h-0.5 bg-blue-200" />
        Secondary reporting (teachers → both leads)
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-4 h-0.5 border-t border-dashed border-gray-400" />
        Role title
      </span>
    </div>
  )
}

function getInitials(name) {
  if (!name) return '·'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

// ─── Types ──────────────────────────────────────────────────────────────────
/**
 * @typedef {Object} Edge
 * @property {string} from
 * @property {string} to
 * @property {'primary'|'secondary'|'role'} tone
 * @property {number} x1
 * @property {number} y1
 * @property {number} x2
 * @property {number} y2
 */
