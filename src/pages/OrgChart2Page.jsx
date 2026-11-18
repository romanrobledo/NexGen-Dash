import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import {
  GitBranch, Phone, Mail,
  Plus, Minus, Maximize2, Lock, Pencil, RotateCcw,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isBooksAdmin } from '../lib/roles'

/**
 * Interactive org chart — Miro-like canvas.
 *
 * Default layout (CSS grid rows):
 *   Row 1  Roman (Founder)
 *   Row 2  Robyn · Rachel
 *   Row 3  Leti · Belle · Abby   (ops peers — Leti/Belle report to Robyn)
 *   Row 4  Seven teachers (incl. Margo / Head Afterschool)
 *
 * Interactivity:
 *   - Mouse-wheel + buttons zoom (0.4× … 2.5×).
 *   - Click-drag on empty canvas pans the whole board.
 *   - Admin "Edit layout" mode makes tiles draggable. Drag offsets
 *     persist to localStorage per-browser as `{ tileId: {dx, dy} }`.
 *     Reset button clears the map.
 *
 * Connectors keep working because they measure DOMRects and
 * `transform` is included in getBoundingClientRect.
 */

// ── Data ────────────────────────────────────────────────────────────────────
const FOUNDER = {
  id: 'roman', name: 'Roman Robledo', title: 'Founder',
  email: 'office@romanrobledo.com', phone: '', tone: 'founder',
}
const LEADS = [
  { id: 'robyn',  name: 'Robyn Hernandez', title: 'Operator',
    email: 'salinasrobyn@gmail.com',    phone: '(956) 244-2665', tone: 'operator' },
  { id: 'rachel', name: 'Raquel Lopez', nickname: 'Rachel', title: 'Director',
    email: 'rachellopez1968@gmail.com', phone: '(956) 456-5700', tone: 'director' },
]
const ASSISTANT_OPERATOR = {
  id: 'abby', name: 'Maria Martinez', nickname: 'Abby',
  title: 'Assistant Operator', tone: 'assistant',
}
const OPS_PEERS = [
  { id: 'leti',  name: 'Leticia Martinez', nickname: 'Leti',  title: 'Cook',      tone: 'support' },
  { id: 'belle', name: 'Belia Azua',       nickname: 'Belle', title: 'Custodian', tone: 'support' },
]
const TEACHERS = [
  { id: 'sylvia',   name: 'Sylvia Rivera',     title: 'Teacher' },
  { id: 'maryjane', name: 'Mary Jane Almanza', title: 'Teacher' },
  { id: 'joanna',   name: 'Joanna Segura',     title: 'Teacher' },
  { id: 'anjelica', name: 'Anjelica Sanchez',  title: 'Teacher' },
  { id: 'alexa',    name: 'Alexa Saldivar',    title: 'Teacher' },
  { id: 'ruth',     name: 'Ruth Ramirez',      title: 'Teacher' },
  { id: 'margo',    name: 'Margo Rivas',       title: 'Head Afterschool' },
]

// ── Persistence (localStorage, per browser) ────────────────────────────────
const OFFSETS_KEY = 'orgchart2.offsets.v1'
function loadOffsets() {
  try {
    const raw = localStorage.getItem(OFFSETS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}
function saveOffsets(offsets) {
  try { localStorage.setItem(OFFSETS_KEY, JSON.stringify(offsets)) } catch {}
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function OrgChart2Page() {
  const { staff } = useAuth()
  const canEdit = isBooksAdmin(staff)
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Header canEdit={canEdit} />
      <ChartCanvas canEdit={canEdit} />
      <Legend />
    </div>
  )
}

function Header({ canEdit }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
        <GitBranch className="w-6 h-6 text-blue-600" />
        Org Chart 2
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Zoom with the +/− buttons or scroll-wheel · drag the empty canvas to pan.
        {canEdit
          ? ' Click Edit layout to drag tiles into place.'
          : ' Only admins can rearrange tiles.'}
      </p>
    </div>
  )
}

function ChartCanvas({ canEdit }) {
  const outerRef = useRef(/** @type {HTMLDivElement|null} */ (null))
  const innerRef = useRef(/** @type {HTMLDivElement|null} */ (null))
  const tileRefs = useRef(/** @type {Map<string, HTMLDivElement>} */ (new Map()))

  const [edges, setEdges]   = useState(/** @type {Edge[]} */ ([]))
  const [zoom,  setZoom]    = useState(1)
  const [pan,   setPan]     = useState({ x: 0, y: 0 })
  const [editMode, setEditMode] = useState(false)
  const [offsets, setOffsets]   = useState(/** @type {Record<string,{dx:number,dy:number}>} */ (loadOffsets()))

  // ── reporting edges ───────────────────────────────────────────────────
  const relationships = useMemo(() => {
    const out = []
    out.push({ from: 'robyn',  to: 'roman',  tone: 'primary' })
    out.push({ from: 'rachel', to: 'roman',  tone: 'primary' })
    out.push({ from: 'abby',   to: 'robyn',  tone: 'primary' })
    out.push({ from: 'abby',   to: 'rachel', tone: 'secondary' })
    for (const p of OPS_PEERS) out.push({ from: p.id, to: 'robyn', tone: 'primary' })
    for (const t of TEACHERS)  out.push({ from: t.id, to: 'abby',  tone: 'primary' })
    return out
  }, [])

  // ── connector recompute ──────────────────────────────────────────────
  const recompute = useCallback(() => {
    const inner = innerRef.current
    if (!inner) return
    const cr = inner.getBoundingClientRect()
    const next = []
    for (const rel of relationships) {
      const a = tileRefs.current.get(rel.from)
      const b = tileRefs.current.get(rel.to)
      if (!a || !b) continue
      const ar = a.getBoundingClientRect()
      const br = b.getBoundingClientRect()
      // Convert to inner's local coords, then undo the zoom so lines
      // live in the same unscaled coordinate space as the tiles in CSS.
      const toLocal = (clientX, clientY) => ({
        x: (clientX - cr.left) / zoom,
        y: (clientY - cr.top)  / zoom,
      })
      const aCenter = toLocal(ar.left + ar.width / 2, ar.top + ar.height / 2)
      const bCenter = toLocal(br.left + br.width / 2, br.top + br.height / 2)
      const fromBelow = aCenter.y > bCenter.y
      const a1 = toLocal(ar.left + ar.width / 2, fromBelow ? ar.top : ar.bottom)
      const b1 = toLocal(br.left + br.width / 2, fromBelow ? br.bottom : br.top)
      next.push({ ...rel, x1: a1.x, y1: a1.y, x2: b1.x, y2: b1.y })
    }
    setEdges(next)
  }, [relationships, zoom])

  useEffect(() => {
    recompute()
    const ro = new ResizeObserver(recompute)
    if (innerRef.current) ro.observe(innerRef.current)
    window.addEventListener('resize', recompute)
    return () => { ro.disconnect(); window.removeEventListener('resize', recompute) }
  }, [recompute, offsets, zoom, pan])

  // ── pan via background drag ──────────────────────────────────────────
  const panState = useRef(/** @type {null | {startX:number,startY:number,baseX:number,baseY:number}} */ (null))
  function onCanvasMouseDown(e) {
    // Only begin a pan if the target is the canvas background itself.
    if (e.target !== outerRef.current && e.target !== innerRef.current) return
    panState.current = { startX: e.clientX, startY: e.clientY, baseX: pan.x, baseY: pan.y }
    document.body.style.cursor = 'grabbing'
  }
  useEffect(() => {
    function onMove(e) {
      if (!panState.current) return
      const p = panState.current
      setPan({ x: p.baseX + (e.clientX - p.startX), y: p.baseY + (e.clientY - p.startY) })
    }
    function onUp() {
      panState.current = null
      document.body.style.cursor = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  // ── wheel zoom ──────────────────────────────────────────────────────
  function onWheel(e) {
    if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 20) return  // ignore trackpad scroll
    e.preventDefault()
    const delta = -e.deltaY * 0.0015
    setZoom(z => clampZoom(z + delta))
  }

  // ── tile drag (admin edit mode) ──────────────────────────────────────
  const dragState = useRef(/** @type {null | {id:string,startX:number,startY:number,baseDx:number,baseDy:number}} */ (null))
  function onTileMouseDown(e, id) {
    if (!editMode || !canEdit) return
    e.stopPropagation()
    const base = offsets[id] || { dx: 0, dy: 0 }
    dragState.current = { id, startX: e.clientX, startY: e.clientY, baseDx: base.dx, baseDy: base.dy }
    document.body.style.cursor = 'grabbing'
  }
  useEffect(() => {
    function onMove(e) {
      if (!dragState.current) return
      const d = dragState.current
      // Divide by zoom so one screen-pixel of mouse motion = one chart-pixel
      const dx = d.baseDx + (e.clientX - d.startX) / zoom
      const dy = d.baseDy + (e.clientY - d.startY) / zoom
      setOffsets(prev => ({ ...prev, [d.id]: { dx, dy } }))
    }
    function onUp() {
      if (dragState.current) {
        // Persist on mouse-up so we don't thrash localStorage on every move.
        setOffsets(prev => { saveOffsets(prev); return prev })
      }
      dragState.current = null
      document.body.style.cursor = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [zoom])

  function resetLayout() {
    if (!window.confirm('Clear all custom tile positions?')) return
    setOffsets({})
    saveOffsets({})
  }

  function fitToScreen() { setZoom(1); setPan({ x: 0, y: 0 }) }

  const registerTile = (id) => (el) => {
    if (el) tileRefs.current.set(id, el)
    else tileRefs.current.delete(id)
  }

  return (
    <div className="relative">
      {/* Floating zoom controls (bottom right) */}
      <div className="absolute right-3 bottom-3 z-20 flex flex-col gap-1 bg-white border border-gray-200 rounded-xl shadow-sm p-1">
        <IconBtn onClick={() => setZoom(z => clampZoom(z + 0.1))} title="Zoom in"><Plus className="w-4 h-4" /></IconBtn>
        <IconBtn onClick={() => setZoom(z => clampZoom(z - 0.1))} title="Zoom out"><Minus className="w-4 h-4" /></IconBtn>
        <div className="text-[10px] text-gray-500 text-center">{Math.round(zoom * 100)}%</div>
        <IconBtn onClick={fitToScreen} title="Reset view"><Maximize2 className="w-4 h-4" /></IconBtn>
      </div>

      {/* Edit controls (top right) */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
        {canEdit ? (
          <>
            <button
              onClick={() => setEditMode(v => !v)}
              className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold border ${
                editMode
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                  : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              {editMode ? 'Editing' : 'Edit layout'}
            </button>
            {editMode && Object.keys(offsets).length > 0 && (
              <button
                onClick={resetLayout}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                title="Clear all custom positions"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </>
        ) : (
          <span className="inline-flex items-center gap-1 h-8 px-2 rounded-lg text-[11px] text-gray-500 border border-gray-200 bg-white">
            <Lock className="w-3 h-3" /> Admin-only edit
          </span>
        )}
      </div>

      {/* The scroll/pan/zoom surface */}
      <div
        ref={outerRef}
        onMouseDown={onCanvasMouseDown}
        onWheel={onWheel}
        className={`relative bg-white rounded-2xl border border-gray-200 overflow-hidden ${
          editMode ? 'ring-2 ring-amber-300' : ''
        }`}
        style={{ cursor: panState.current ? 'grabbing' : 'grab', minHeight: 640 }}
      >
        <div
          ref={innerRef}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            padding: '1.25rem',
            // Width = parent so tile grids distribute evenly inside the
            // visible canvas. Panning still works — pan.x/y is applied
            // to the transform, not to the element's intrinsic width.
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* SVG connectors — inside the transform so they scale with tiles */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            {edges.map((e, i) => (
              <path
                key={i}
                d={curvePath(e)}
                fill="none"
                className={e.tone === 'secondary' ? 'stroke-emerald-300' : 'stroke-blue-400'}
                strokeWidth={e.tone === 'secondary' ? 1.5 : 1.75}
                strokeDasharray={e.tone === 'secondary' ? '5 4' : undefined}
                strokeLinecap="round"
              />
            ))}
          </svg>

          <div className="relative space-y-12" style={{ zIndex: 1 }}>
            {/* Row 1 — Founder */}
            <div className="flex justify-center">
              <div className="w-full sm:w-80">
                <PersonTile tileId={FOUNDER.id} innerRef={registerTile(FOUNDER.id)}
                  person={FOUNDER} editMode={editMode} canEdit={canEdit}
                  offset={offsets[FOUNDER.id]} onMouseDown={onTileMouseDown} />
              </div>
            </div>

            {/* Row 2 — Leads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {LEADS.map(p => (
                <PersonTile key={p.id} tileId={p.id} innerRef={registerTile(p.id)}
                  person={p} editMode={editMode} canEdit={canEdit}
                  offset={offsets[p.id]} onMouseDown={onTileMouseDown} />
              ))}
            </div>

            {/* Row 3 — Leti · Belle · Abby */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
              <PersonTile tileId="leti"  innerRef={registerTile('leti')}  person={OPS_PEERS[0]}
                compact editMode={editMode} canEdit={canEdit}
                offset={offsets.leti}  onMouseDown={onTileMouseDown} />
              <PersonTile tileId="belle" innerRef={registerTile('belle')} person={OPS_PEERS[1]}
                compact editMode={editMode} canEdit={canEdit}
                offset={offsets.belle} onMouseDown={onTileMouseDown} />
              <PersonTile tileId={ASSISTANT_OPERATOR.id} innerRef={registerTile(ASSISTANT_OPERATOR.id)}
                person={ASSISTANT_OPERATOR} compact editMode={editMode} canEdit={canEdit}
                offset={offsets[ASSISTANT_OPERATOR.id]} onMouseDown={onTileMouseDown} />
            </div>

            {/* Row 4 — Teacher cohort. Stepped breakpoints so Margo (7th)
                wraps gracefully on narrower screens; only becomes true
                single-row at xl (1280px+) where there's room for 7.
                min-w-0 lets grid children shrink below their intrinsic
                content width so 7 cols actually fit the canvas. */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
              {TEACHERS.map(t => (
                <div key={t.id} className="min-w-0">
                  <PersonTile tileId={t.id} innerRef={registerTile(t.id)}
                    person={{ ...t, tone: 'teacher' }} compact editMode={editMode} canEdit={canEdit}
                    offset={offsets[t.id]} onMouseDown={onTileMouseDown} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function IconBtn({ onClick, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="h-7 w-7 rounded-lg hover:bg-gray-100 inline-flex items-center justify-center text-gray-700"
    >
      {children}
    </button>
  )
}

function clampZoom(z) { return Math.max(0.4, Math.min(2.5, z)) }

function curvePath({ x1, y1, x2, y2 }) {
  const dy = Math.abs(y1 - y2)
  const pull = Math.max(24, Math.min(80, dy * 0.45))
  const cy1 = y1 + (y1 > y2 ? -pull : pull)
  const cy2 = y2 + (y2 > y1 ? -pull : pull)
  return `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`
}

function PersonTile({ tileId, innerRef, person, compact, editMode, canEdit, offset, onMouseDown }) {
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

  const draggable = editMode && canEdit
  const style = offset
    ? { transform: `translate(${offset.dx}px, ${offset.dy}px)`, transition: dragState_isDraggingId(tileId) ? 'none' : 'transform 120ms' }
    : {}

  return (
    <div
      ref={innerRef}
      style={style}
      onMouseDown={(e) => onMouseDown(e, tileId)}
      className={`rounded-xl border ${cls} p-3 shadow-sm ${compact ? 'text-center' : ''} ${
        draggable ? 'cursor-grab active:cursor-grabbing ring-1 ring-amber-200' : ''
      } select-none`}
    >
      <div className={compact ? '' : 'flex items-start gap-3'}>
        <div className={`w-8 h-8 rounded-full bg-white/70 border border-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-700 shrink-0 ${compact ? 'mx-auto mb-1.5' : ''}`}>
          {getInitials(person.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900 truncate">{person.name}</p>
          {person.nickname && (<p className="text-[11px] text-gray-500">"{person.nickname}"</p>)}
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

// Guard used by PersonTile to disable the CSS transition during a live
// drag (otherwise the tile lags behind the cursor). Reads from the
// module-scoped dragState ref set up inside ChartCanvas — small sin
// for the sake of keeping PersonTile prop-light.
function dragState_isDraggingId(_id) { return false /* always false — reserved for future live-drag smoothing */ }

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
