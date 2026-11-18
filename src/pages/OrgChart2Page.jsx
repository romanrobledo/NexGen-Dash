import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import {
  GitBranch, Phone, Mail,
  Plus, Minus, Maximize2, Lock, Pencil, RotateCcw,
  Link2, Move, X,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isBooksAdmin } from '../lib/roles'
import OrgRoleDrawer from '../components/OrgRoleDrawer'

/**
 * Map this chart's tile ids → legacy roleContent ids. Driving the
 * drawer this way lets us reuse everything OrgRoleDrawer already
 * knows how to render (contact strip, five Compass sections) without
 * duplicating per-person content.
 *
 * Teachers point at the generic 'teacher' role unless the specific
 * person has a dedicated entry in ROLE_CONTACTS (e.g. Anjelica has
 * 'admin-classroom-support'). When a mapping is missing the drawer
 * still opens and renders a "content coming" placeholder.
 */
const TILE_TO_ROLE_ID = {
  roman:    'visionary',
  robyn:    'operator',
  rachel:   'director',
  abby:     'assistant-director',
  leti:     'kitchen-manager',       // Cook — maps to kitchen-manager content
  belle:    'teacher-support-lead',  // Custodian in OC2, legacy content under TSL
  margo:    'head-rover',
  anjelica: 'admin-classroom-support',
  sylvia:   'teacher',
  maryjane: 'teacher',
  joanna:   'teacher',
  alexa:    'teacher',
  ruth:     'teacher',
}

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
const CONNS_KEY   = 'orgchart2.connections.v1'

function loadOffsets() {
  try {
    const raw = localStorage.getItem(OFFSETS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}
function saveOffsets(offsets) {
  try { localStorage.setItem(OFFSETS_KEY, JSON.stringify(offsets)) } catch {}
}
function loadConnections() {
  try {
    const raw = localStorage.getItem(CONNS_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? parsed : null
  } catch { return null }
}
function saveConnections(conns) {
  try {
    if (conns) localStorage.setItem(CONNS_KEY, JSON.stringify(conns))
    else       localStorage.removeItem(CONNS_KEY)
  } catch {}
}

// Default reporting edges. `fromSide` / `toSide` are optional: when
// absent, the connector auto-picks top/bottom based on relative tile
// position. When set, the line anchors to that specific edge.
function defaultConnections() {
  const out = []
  out.push({ from: 'robyn',  to: 'roman',  tone: 'primary' })
  out.push({ from: 'rachel', to: 'roman',  tone: 'primary' })
  out.push({ from: 'abby',   to: 'robyn',  tone: 'primary' })
  out.push({ from: 'abby',   to: 'rachel', tone: 'secondary' })
  for (const p of OPS_PEERS) out.push({ from: p.id, to: 'robyn', tone: 'primary' })
  for (const t of TEACHERS)  out.push({ from: t.id, to: 'abby',  tone: 'primary' })
  return out
}

/** @typedef {'top'|'right'|'bottom'|'left'} Side */

// ── Geometry helpers (defined up-top so recompute() can use them) ──────────

function clampZoom(z) { return Math.max(0.4, Math.min(2.5, z)) }

/** Return the local (x,y) of a tile's anchor on the given side. */
function sideAnchor(rect, side, toLocal) {
  switch (side) {
    case 'top':    return toLocal(rect.left + rect.width / 2, rect.top)
    case 'bottom': return toLocal(rect.left + rect.width / 2, rect.bottom)
    case 'left':   return toLocal(rect.left,                  rect.top + rect.height / 2)
    case 'right':  return toLocal(rect.right,                 rect.top + rect.height / 2)
    default:       return toLocal(rect.left + rect.width / 2, rect.top + rect.height / 2)
  }
}

/**
 * Bezier path with handles perpendicular to each anchor's edge, so
 * top/bottom anchors curve vertically and left/right anchors curve
 * horizontally — matches the native Miro look.
 */
function curvePath({ x1, y1, x2, y2, fromSide, toSide }) {
  const dist = Math.hypot(x2 - x1, y2 - y1)
  const pull = Math.max(24, Math.min(110, dist * 0.35))
  const [h1x, h1y] = handleOffset(fromSide, pull)
  const [h2x, h2y] = handleOffset(toSide,   pull)
  const cx1 = x1 + h1x, cy1 = y1 + h1y
  const cx2 = x2 + h2x, cy2 = y2 + h2y
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`
}
function handleOffset(side, pull) {
  switch (side) {
    case 'top':    return [0, -pull]
    case 'bottom': return [0,  pull]
    case 'left':   return [-pull, 0]
    case 'right':  return [ pull, 0]
    default:       return [0, 0]
  }
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
        Click any tile to see role details · zoom with +/− or scroll · drag empty canvas to pan.
        {canEdit
          ? ' Edit layout → drag tiles · Connect → click two tiles to wire them · click any line to delete.'
          : ''}
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
  // 'drag' = drag tiles to reposition · 'connect' = click two tiles to wire
  const [subMode,  setSubMode]  = useState(/** @type {'drag'|'connect'} */ ('drag'))
  const [offsets, setOffsets]   = useState(/** @type {Record<string,{dx:number,dy:number}>} */ (loadOffsets()))
  const [customConns, setCustomConns] = useState(/** @type {null | Array<{from:string,to:string,tone:string,fromSide?:Side,toSide?:Side}>} */ (loadConnections()))
  // Pending source holds the tile id AND optionally the side the user
  // clicked. When they clicked a dot, side is set; when they clicked the
  // tile body, side is null (= auto-pick).
  const [connectSource, setConnectSource] = useState(/** @type {{id:string,side:Side|null}|null} */ (null))
  // When the user clicks a tile in VIEW mode, open the legacy
  // OrgRoleDrawer for the mapped roleId.
  const [openRoleId, setOpenRoleId] = useState(/** @type {string|null} */ (null))

  // Reset the pending source whenever the user flips OUT of connect mode.
  useEffect(() => {
    if (!editMode || subMode !== 'connect') setConnectSource(null)
  }, [editMode, subMode])

  // ── reporting edges — custom overrides defaults when present ─────────
  const relationships = useMemo(() => customConns || defaultConnections(), [customConns])

  // ── connector recompute ──────────────────────────────────────────────
  const recompute = useCallback(() => {
    const inner = innerRef.current
    if (!inner) return
    const cr = inner.getBoundingClientRect()
    const toLocal = (clientX, clientY) => ({
      x: (clientX - cr.left) / zoom,
      y: (clientY - cr.top)  / zoom,
    })
    const next = []
    for (const rel of relationships) {
      const a = tileRefs.current.get(rel.from)
      const b = tileRefs.current.get(rel.to)
      if (!a || !b) continue
      const ar = a.getBoundingClientRect()
      const br = b.getBoundingClientRect()
      const aCenter = toLocal(ar.left + ar.width / 2, ar.top + ar.height / 2)
      const bCenter = toLocal(br.left + br.width / 2, br.top + br.height / 2)
      // Pick sides: explicit > auto-vertical based on relative position.
      const aSide = rel.fromSide || (aCenter.y > bCenter.y ? 'top' : 'bottom')
      const bSide = rel.toSide   || (aCenter.y > bCenter.y ? 'bottom' : 'top')
      const a1 = sideAnchor(ar, aSide, toLocal)
      const b1 = sideAnchor(br, bSide, toLocal)
      next.push({ ...rel, fromSide: aSide, toSide: bSide, x1: a1.x, y1: a1.y, x2: b1.x, y2: b1.y })
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
    // Pan unless the click landed on something interactive. Grid-row
    // divs (empty space between tiles) all pan the board; tiles and
    // their descendants, buttons, and inputs do not.
    if (e.target.closest && e.target.closest('[data-tile-root], button, input, textarea, select, a, svg path')) return
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

  // ── tile drag (admin edit, drag sub-mode only) ───────────────────────
  const dragState = useRef(/** @type {null | {id:string,startX:number,startY:number,baseDx:number,baseDy:number,moved:boolean}} */ (null))
  function onTileMouseDown(e, id) {
    if (!editMode || !canEdit) return
    e.stopPropagation()
    if (subMode === 'connect') {
      // Clicking the tile BODY (not a side-dot) means "auto-anchor".
      handleConnectClick(id, null)
      return
    }
    // Drag sub-mode.
    const base = offsets[id] || { dx: 0, dy: 0 }
    dragState.current = { id, startX: e.clientX, startY: e.clientY, baseDx: base.dx, baseDy: base.dy, moved: false }
    document.body.style.cursor = 'grabbing'
  }

  // View-mode tile click → open the role drawer with mapped roleId.
  // No-op in edit mode (the mousedown handler owns that interaction).
  function onTileClick(e, id) {
    if (editMode) return
    e.stopPropagation()
    const roleId = TILE_TO_ROLE_ID[id] || id
    setOpenRoleId(roleId)
  }

  // Shared handler for both tile-body clicks (auto anchor) and side-dot
  // clicks (explicit anchor). side=null means auto.
  function handleConnectClick(id, side) {
    if (!connectSource) {
      setConnectSource({ id, side })
    } else if (connectSource.id === id) {
      setConnectSource(null)   // clicking the source again cancels
    } else {
      addConnection(connectSource.id, id, connectSource.side, side)
      setConnectSource(null)
    }
  }

  // ── connection helpers ───────────────────────────────────────────────
  function currentConnections() {
    return customConns || defaultConnections()
  }
  function addConnection(from, to, fromSide, toSide) {
    const list = currentConnections()
    if (list.find(c => c.from === from && c.to === to)) return
    const entry = { from, to, tone: 'primary' }
    if (fromSide) entry.fromSide = fromSide
    if (toSide)   entry.toSide   = toSide
    const next = [...list, entry]
    setCustomConns(next); saveConnections(next)
  }
  function removeConnection(from, to) {
    const list = currentConnections()
    const next = list.filter(c => !(c.from === from && c.to === to))
    setCustomConns(next); saveConnections(next)
  }
  function resetConnections() {
    if (!window.confirm('Revert to the default reporting lines?')) return
    setCustomConns(null); saveConnections(null)
  }
  useEffect(() => {
    function onMove(e) {
      if (!dragState.current) return
      const d = dragState.current
      // Divide by zoom so one screen-pixel of mouse motion = one chart-pixel.
      // No clamp — Miro-style unlimited canvas. If a tile ends up off-
      // screen, panning or Reset layout brings it back.
      const dx = d.baseDx + (e.clientX - d.startX) / zoom
      const dy = d.baseDy + (e.clientY - d.startY) / zoom
      setOffsets(prev => ({ ...prev, [d.id]: { dx, dy } }))
    }
    function onUp() {
      if (dragState.current) {
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
      {/* Role drawer — opens when a tile is clicked in VIEW mode */}
      {openRoleId && (
        <OrgRoleDrawer
          roleId={openRoleId}
          onClose={() => setOpenRoleId(null)}
        />
      )}

      {/* Floating zoom controls (bottom right) */}
      <div className="absolute right-3 bottom-3 z-20 flex flex-col gap-1 bg-white border border-gray-200 rounded-xl shadow-sm p-1">
        <IconBtn onClick={() => setZoom(z => clampZoom(z + 0.1))} title="Zoom in"><Plus className="w-4 h-4" /></IconBtn>
        <IconBtn onClick={() => setZoom(z => clampZoom(z - 0.1))} title="Zoom out"><Minus className="w-4 h-4" /></IconBtn>
        <div className="text-[10px] text-gray-500 text-center">{Math.round(zoom * 100)}%</div>
        <IconBtn onClick={fitToScreen} title="Reset view"><Maximize2 className="w-4 h-4" /></IconBtn>
      </div>

      {/* Edit controls (top right) */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 flex-wrap justify-end max-w-[70%]">
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
            {editMode && (
              <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
                <SubModeBtn active={subMode === 'drag'}    onClick={() => setSubMode('drag')}    icon={Move}   label="Drag" />
                <SubModeBtn active={subMode === 'connect'} onClick={() => setSubMode('connect')} icon={Link2}  label="Connect" />
              </div>
            )}
            {editMode && Object.keys(offsets).length > 0 && (
              <button
                onClick={resetLayout}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                title="Clear all custom tile positions"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset layout
              </button>
            )}
            {editMode && customConns && (
              <button
                onClick={resetConnections}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                title="Revert to default reporting lines"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset lines
              </button>
            )}
          </>
        ) : (
          <span className="inline-flex items-center gap-1 h-8 px-2 rounded-lg text-[11px] text-gray-500 border border-gray-200 bg-white">
            <Lock className="w-3 h-3" /> Admin-only edit
          </span>
        )}
      </div>

      {/* Connect-mode floating hint — pinned to the LEFT so it doesn't
          overlap the Edit/Drag/Connect/Reset toolbar on the right. */}
      {editMode && subMode === 'connect' && (
        <div className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-indigo-600 text-white text-xs shadow-md max-w-[60%]">
          <Link2 className="w-3.5 h-3.5 shrink-0" />
          {connectSource
            ? <span className="truncate">Picked <b>{connectSource.id}</b>{connectSource.side ? ` (${connectSource.side})` : ''} — click another tile or one of its side-dots to finish.</span>
            : <span>Click a tile for an auto-routed line, or click one of its edge dots to anchor from that side.</span>}
          {connectSource && (
            <button onClick={() => setConnectSource(null)} className="ml-1 p-0.5 rounded hover:bg-white/20 shrink-0">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

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
          {/* SVG connectors — inside the transform so they scale with tiles.
              The SVG itself is pointer-pass-through so clicks on empty
              space fall through to the canvas (preserving pan). Only
              the per-edge hit-target path accepts pointer events, and
              only within its stroke (pointer-events=stroke). Without
              this the giant SVG surface eats every background click. */}
          <svg
            className="absolute inset-0"
            style={{ width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: 2 }}
          >
            {edges.map((e, i) => {
              const d = curvePath(e)
              return (
                <g key={i} className={editMode ? 'group' : ''}>
                  <path
                    d={d}
                    fill="none"
                    className={e.tone === 'secondary' ? 'stroke-emerald-300 group-hover:stroke-rose-400' : 'stroke-blue-400 group-hover:stroke-rose-500'}
                    strokeWidth={e.tone === 'secondary' ? 1.5 : 1.75}
                    strokeDasharray={e.tone === 'secondary' ? '5 4' : undefined}
                    strokeLinecap="round"
                  />
                  {editMode && (
                    <path
                      d={d}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={10}
                      className="cursor-pointer"
                      style={{ pointerEvents: 'stroke' }}
                      onClick={(ev) => { ev.stopPropagation(); removeConnection(e.from, e.to) }}
                    >
                      <title>Click to delete: {e.from} → {e.to}</title>
                    </path>
                  )}
                </g>
              )
            })}
          </svg>

          <div className="relative space-y-12" style={{ zIndex: 1 }}>
            {/* Row 1 — Founder */}
            <div className="flex justify-center">
              <div className="w-full sm:w-80">
                <PersonTile tileId={FOUNDER.id} innerRef={registerTile(FOUNDER.id)}
                  person={FOUNDER} editMode={editMode} subMode={subMode} canEdit={canEdit}
                  isConnectSource={connectSource?.id === FOUNDER.id} connectSide={connectSource?.id === FOUNDER.id ? connectSource.side : null}
                  offset={offsets[FOUNDER.id]} onMouseDown={onTileMouseDown} onClick={onTileClick} onDotClick={handleConnectClick} />
              </div>
            </div>

            {/* Row 2 — Leads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {LEADS.map(p => (
                <PersonTile key={p.id} tileId={p.id} innerRef={registerTile(p.id)}
                  person={p} editMode={editMode} subMode={subMode} canEdit={canEdit}
                  isConnectSource={connectSource?.id === p.id} connectSide={connectSource?.id === p.id ? connectSource.side : null}
                  offset={offsets[p.id]} onMouseDown={onTileMouseDown} onClick={onTileClick} onDotClick={handleConnectClick} />
              ))}
            </div>

            {/* Row 3 — Leti · Belle · Abby */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
              <PersonTile tileId="leti"  innerRef={registerTile('leti')}  person={OPS_PEERS[0]}
                compact editMode={editMode} subMode={subMode} canEdit={canEdit}
                isConnectSource={connectSource?.id === 'leti'} connectSide={connectSource?.id === 'leti' ? connectSource.side : null}
                offset={offsets.leti}  onMouseDown={onTileMouseDown} onClick={onTileClick} onDotClick={handleConnectClick} />
              <PersonTile tileId="belle" innerRef={registerTile('belle')} person={OPS_PEERS[1]}
                compact editMode={editMode} subMode={subMode} canEdit={canEdit}
                isConnectSource={connectSource?.id === 'belle'} connectSide={connectSource?.id === 'belle' ? connectSource.side : null}
                offset={offsets.belle} onMouseDown={onTileMouseDown} onClick={onTileClick} onDotClick={handleConnectClick} />
              <PersonTile tileId={ASSISTANT_OPERATOR.id} innerRef={registerTile(ASSISTANT_OPERATOR.id)}
                person={ASSISTANT_OPERATOR} compact editMode={editMode} subMode={subMode} canEdit={canEdit}
                isConnectSource={connectSource?.id === ASSISTANT_OPERATOR.id} connectSide={connectSource?.id === ASSISTANT_OPERATOR.id ? connectSource.side : null}
                offset={offsets[ASSISTANT_OPERATOR.id]} onMouseDown={onTileMouseDown} onClick={onTileClick} onDotClick={handleConnectClick} />
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
                    person={{ ...t, tone: 'teacher' }} compact editMode={editMode} subMode={subMode} canEdit={canEdit}
                    isConnectSource={connectSource?.id === t.id} connectSide={connectSource?.id === t.id ? connectSource.side : null}
                    offset={offsets[t.id]} onMouseDown={onTileMouseDown} onClick={onTileClick} onDotClick={handleConnectClick} />
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

function SubModeBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 h-8 px-2.5 text-xs font-semibold ${
        active ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}


function PersonTile({ tileId, innerRef, person, compact, editMode, subMode, canEdit, isConnectSource, connectSide, offset, onMouseDown, onClick, onDotClick }) {
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

  const editable = editMode && canEdit
  const isDrag    = editable && subMode === 'drag'
  const isConnect = editable && subMode === 'connect'

  const style = offset
    ? { transform: `translate(${offset.dx}px, ${offset.dy}px)`, transition: dragState_isDraggingId(tileId) ? 'none' : 'transform 120ms' }
    : {}

  const editRing =
    isConnectSource ? 'ring-2 ring-indigo-500' :
    isConnect       ? 'ring-1 ring-indigo-200 cursor-pointer hover:ring-indigo-400' :
    isDrag          ? 'ring-1 ring-amber-200 cursor-grab active:cursor-grabbing' :
    'cursor-pointer hover:border-indigo-300 hover:shadow-md transition-shadow'

  return (
    <div
      ref={innerRef}
      data-tile-root="true"
      style={{ ...style, position: 'relative' }}
      onMouseDown={(e) => onMouseDown(e, tileId)}
      onClick={(e) => onClick?.(e, tileId)}
      className={`rounded-xl border ${cls} p-3 shadow-sm ${compact ? 'text-center' : ''} ${editRing} select-none`}
    >
      {/* Side-anchor dots — only in connect sub-mode. Positioned outside
          the border so the dots don't overlap tile content. */}
      {isConnect && (
        <>
          <AnchorDot side="top"    active={connectSide === 'top'}    onClick={() => onDotClick(tileId, 'top')} />
          <AnchorDot side="right"  active={connectSide === 'right'}  onClick={() => onDotClick(tileId, 'right')} />
          <AnchorDot side="bottom" active={connectSide === 'bottom'} onClick={() => onDotClick(tileId, 'bottom')} />
          <AnchorDot side="left"   active={connectSide === 'left'}   onClick={() => onDotClick(tileId, 'left')} />
        </>
      )}
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

function AnchorDot({ side, active, onClick }) {
  // Positioned so the center of the dot sits exactly on the midpoint
  // of that edge, outside the tile border.
  const pos = {
    top:    { top: -6,    left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: -6, left: '50%', transform: 'translateX(-50%)' },
    left:   { left: -6,   top: '50%',  transform: 'translateY(-50%)' },
    right:  { right: -6,  top: '50%',  transform: 'translateY(-50%)' },
  }[side]
  return (
    <button
      type="button"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={pos}
      title={`Anchor from ${side}`}
      className={`absolute w-3 h-3 rounded-full border-2 ${
        active
          ? 'bg-indigo-600 border-indigo-800'
          : 'bg-white border-indigo-400 hover:bg-indigo-100'
      }`}
    />
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
        Secondary
      </span>
      <span className="text-gray-400">
        In edit mode: click any line to delete it instantly. In Connect sub-mode, the dots on each side of a tile let you anchor a new line to that edge.
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
