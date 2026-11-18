import { useMemo, useRef, useState, useEffect } from 'react'
import { GitBranch, Phone, Mail } from 'lucide-react'

/**
 * Greenfield org chart — mirrors Roman's Miro diagram.
 *
 * Structure (top → bottom):
 *   Row 1: Founder                 (Roman)
 *   Row 2: Leads                   (Robyn · Rachel)
 *   Row 3: Assistant Operator      (Abby) — the middle-manager layer
 *   Row 4: Support staff           (Leti · Belle · Margo)
 *   Row 5: Teachers                (6 classroom teachers)
 *
 * Reporting:
 *   robyn, rachel → roman                    (primary)
 *   abby → robyn                             (primary)
 *   abby → rachel                            (secondary / dotted)
 *   every support + teacher → abby           (primary)
 *
 * Everything flows UP through Abby → Robyn → Roman, which keeps the
 * connector lines from crossing. Rachel remains visible as a parallel
 * authority via the dotted line to Abby.
 *
 * Connectors are curved SVG paths drawn after mount by measuring tile
 * DOMRects — no hardcoded pixel positions, so the diagram reflows on
 * resize and on mobile stacking.
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

const LEADS = [
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

// Assistant Operator — the single middle-manager tier between leads and
// operational staff. Reports to Robyn primarily; dotted to Rachel.
const ASSISTANT_OPERATOR = {
  id: 'abby',
  name: 'Maria Martinez',
  nickname: 'Abby',
  title: 'Assistant Operator',
  tone: 'assistant',
}

// All operational staff (support + teachers) report to Abby.
const SUPPORT = [
  { id: 'leti',  name: 'Leticia Martinez', nickname: 'Leti',  title: 'Cook',             tone: 'support' },
  { id: 'belle', name: 'Belia Azua',       nickname: 'Belle', title: 'Custodian',        tone: 'support' },
  { id: 'margo', name: 'Margo Rivas',                         title: 'Head Afterschool', tone: 'support' },
]

const TEACHERS = [
  { id: 'sylvia',   name: 'Sylvia Rivera',       title: 'Teacher' },
  { id: 'maryjane', name: 'Mary Jane Almanza',   title: 'Teacher' },
  { id: 'joanna',   name: 'Joanna Segura',       title: 'Teacher' },
  { id: 'anjelica', name: 'Anjelica Sanchez',    title: 'Teacher' },
  { id: 'alexa',    name: 'Alexa Saldivar',      title: 'Teacher' },
  { id: 'ruth',     name: 'Ruth Ramirez',        title: 'Teacher' },
]

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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
        <GitBranch className="w-6 h-6 text-blue-600" />
        Org Chart 2
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Working visual tree. Reporting flows up through Abby (Assistant Operator) to the leads, then to Roman.
      </p>
    </div>
  )
}

/**
 * The tree. CSS grid for tile positions; SVG overlay with curved
 * cubic-bezier paths for the connectors. Connectors reposition on
 * resize via ResizeObserver.
 */
function ChartCanvas() {
  const canvasRef = useRef(/** @type {HTMLDivElement|null} */ (null))
  const tileRefs = useRef(/** @type {Map<string, HTMLDivElement>} */ (new Map()))
  const [edges, setEdges] = useState(/** @type {Edge[]} */ ([]))

  const relationships = useMemo(() => {
    const out = []
    // Leads report up to Roman.
    out.push({ from: 'robyn',  to: 'roman', tone: 'primary' })
    out.push({ from: 'rachel', to: 'roman', tone: 'primary' })
    // Assistant Operator sits below both leads.
    out.push({ from: 'abby', to: 'robyn',  tone: 'primary' })
    out.push({ from: 'abby', to: 'rachel', tone: 'secondary' })
    // All operational staff report to Abby.
    for (const s of SUPPORT)  out.push({ from: s.id, to: 'abby', tone: 'primary' })
    for (const t of TEACHERS) out.push({ from: t.id, to: 'abby', tone: 'primary' })
    return out
  }, [])

  useEffect(() => {
    function recompute() {
      const canvas = canvasRef.current
      if (!canvas) return
      const cr = canvas.getBoundingClientRect()
      const next = []
      for (const rel of relationships) {
        const a = tileRefs.current.get(rel.from)
        const b = tileRefs.current.get(rel.to)
        if (!a || !b) continue
        const ar = a.getBoundingClientRect()
        const br = b.getBoundingClientRect()
        const aCx = ar.left + ar.width / 2 - cr.left
        const bCx = br.left + br.width / 2 - cr.left
        // `from` is always LOWER in the tree (child → parent), so from's
        // top anchors to the parent's bottom.
        const aY = ar.top - cr.top
        const bY = br.bottom - cr.top
        next.push({ ...rel, x1: aCx, y1: aY, x2: bCx, y2: bY })
      }
      setEdges(next)
    }
    recompute()
    const ro = new ResizeObserver(recompute)
    if (canvasRef.current) ro.observe(canvasRef.current)
    window.addEventListener('resize', recompute)
    return () => { ro.disconnect(); window.removeEventListener('resize', recompute) }
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
      {/* Connector overlay — behind the tiles so hover/click works. */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {edges.map((e, i) => (
          <path
            key={i}
            d={curvePath(e)}
            fill="none"
            className={
              e.tone === 'secondary'
                ? 'stroke-emerald-300'
                : 'stroke-blue-400'
            }
            strokeWidth={e.tone === 'secondary' ? 1.5 : 1.75}
            strokeDasharray={e.tone === 'secondary' ? '5 4' : undefined}
            strokeLinecap="round"
          />
        ))}
      </svg>

      <div className="relative space-y-12" style={{ zIndex: 1 }}>
        {/* Row 1 — Founder, centered */}
        <div className="flex justify-center">
          <div className="w-full sm:w-80">
            <PersonTile innerRef={registerTile(FOUNDER.id)} person={FOUNDER} />
          </div>
        </div>

        {/* Row 2 — Leads */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <PersonTile innerRef={registerTile('robyn')}  person={LEADS[0]} />
          <PersonTile innerRef={registerTile('rachel')} person={LEADS[1]} />
        </div>

        {/* Row 3 — Assistant Operator, centered */}
        <div className="flex justify-center">
          <div className="w-full sm:w-80">
            <PersonTile innerRef={registerTile(ASSISTANT_OPERATOR.id)} person={ASSISTANT_OPERATOR} />
          </div>
        </div>

        {/* Row 4 — Support staff */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {SUPPORT.map((s) => (
            <PersonTile key={s.id} innerRef={registerTile(s.id)} person={s} compact />
          ))}
        </div>

        {/* Row 5 — Teachers */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {TEACHERS.map((t) => (
            <PersonTile key={t.id} innerRef={registerTile(t.id)} person={{ ...t, tone: 'teacher' }} compact />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Cubic-bezier path for a connector. Control points pulled vertically
 * so the curve slopes gently in and out of each tile — gives the tree
 * a clean "branches" look instead of straight diagonal spaghetti.
 */
function curvePath({ x1, y1, x2, y2 }) {
  const dy = Math.abs(y1 - y2)
  // Larger pull on wider spans so the curve doesn't over-arc on short hops.
  const pull = Math.max(24, Math.min(80, dy * 0.45))
  const cy1 = y1 - pull   // from's handle lifts UP (we're drawing child→parent)
  const cy2 = y2 + pull   // to's handle drops DOWN
  return `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`
}

function PersonTile({ innerRef, person, compact }) {
  const tones = {
    founder:   'border-purple-300 bg-purple-50',
    operator:  'border-blue-300 bg-blue-50',
    director:  'border-emerald-300 bg-emerald-50',
    assistant: 'border-indigo-300 bg-indigo-50',
    support:   'border-amber-200 bg-amber-50',
    teacher:   'border-gray-200 bg-white',
  }
  const cls = tones[person.tone] || tones.teacher
  const displayTitle = person.title

  return (
    <div
      ref={innerRef}
      className={`rounded-xl border ${cls} p-3 shadow-sm ${compact ? 'text-center' : ''}`}
    >
      <div className={compact ? '' : 'flex items-start gap-3'}>
        <div className={`w-8 h-8 rounded-full bg-white/70 border border-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-700 shrink-0 ${compact ? 'mx-auto mb-1.5' : ''}`}>
          {getInitials(person.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900 truncate">{person.name}</p>
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
        <span className="inline-block w-5 h-0.5 bg-blue-400" />
        Direct reporting
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-5 h-0.5 border-t border-dashed border-emerald-400" />
        Secondary (Abby → Rachel)
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
 * @property {'primary'|'secondary'} tone
 * @property {number} x1
 * @property {number} y1
 * @property {number} x2
 * @property {number} y2
 */
