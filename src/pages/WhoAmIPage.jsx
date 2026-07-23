import { useState } from 'react'
import { Network, Info } from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import {
  ROLE_CONTACTS,
  ROLE_META,
  TONE_CLASSES,
} from '../lib/roleContent'
import OrgRoleDrawer from '../components/OrgRoleDrawer'

/**
 * Org Chart landing — `/whoami` (route unchanged for backwards compat).
 *
 * Replaces the previous "Who Am I?" role selector. Now a spatial tree
 * matching the physical org chart: Roman (Visionary) → Ryan (Integrator)
 * → three branches (Operator · Executive Assistant · Sales Manager) →
 * their reports and focus areas.
 *
 * Every tile is clickable and opens OrgRoleDrawer with the role's
 * contact info + all five Compass sections (What / How / When / Why /
 * How Do I Know) in a single scrollable view — matching the user ask
 * of "one page per role, not a click-through flow."
 *
 * Legacy 7 roles that don't appear on the visual tree (Front Desk,
 * Hiring Manager, Tour Manager, Lesson Plans Manager, Kitchen Manager,
 * Asst. Kitchen Manager, Bus Driver) render below the tree in an "Other
 * Roles" strip so their content stays reachable.
 */

// Tiles on the visual tree that have Compass content OR placeholder
// scaffolding in the roleContent module. Keep this list in sync with the
// tree hierarchy below.
const TREE_ROLES = [
  'visionary',
  'integrator',
  'operator',
  'executive-assistant',
  'sales-manager',
  'director',
  'facility-manager',
  'teacher',
  'teacher-assistant',
  'scheduling',
  'documentation',
  'internal-communication',
  'tours',
  'follow-up',
  'enrollment',
  'community-outreach',
  'classroom-operations',
  'student-experience',
]

// Roles NOT in the visual tree — keep them reachable at the bottom.
const OTHER_ROLES = [
  'front-desk',
  'hiring-manager',
  'tour-manager',
  'lesson-plans',
  'kitchen-manager',
  'asst-kitchen',
  'bus-driver',
]

export default function WhoAmIPage() {
  const { mobileMode } = useViewMode()
  const [openRoleId, setOpenRoleId] = useState(null)

  return (
    <div className={mobileMode ? '' : 'max-w-7xl mx-auto'}>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
          <Network className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h1
            className={`font-bold text-gray-900 ${
              mobileMode ? 'text-xl' : 'text-2xl'
            }`}
          >
            Org Chart
          </h1>
          <p className="text-sm text-gray-500">
            Tap any tile to open the person's contact info and full role
            clarity — one page per role.
          </p>
        </div>
      </div>

      {/* Instruction strip */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-800 leading-relaxed">
          <strong className="font-semibold">Recommended hierarchy:</strong>{' '}
          Visionary at the top, Integrator directly beneath, all day-to-day
          functions flow through the Integrator.
        </p>
      </div>

      {/* Tree — horizontal scroll on narrow screens preserves the spatial
          layout instead of stacking into an unreadable vertical column. */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 overflow-x-auto">
        <div className="min-w-[900px] flex flex-col items-center gap-3">
          {/* Level 1 — Visionary */}
          <TileRow>
            <RoleTile roleId="visionary" size="lg" onClick={setOpenRoleId} />
          </TileRow>
          <Connector />

          {/* Level 2 — Integrator */}
          <TileRow>
            <RoleTile roleId="integrator" size="lg" onClick={setOpenRoleId} />
          </TileRow>
          <Connector />

          {/* Level 3 — 3 top-level branches */}
          <div className="grid grid-cols-3 gap-6 w-full">
            {/* Branch A — Operator → Director/Facility Manager */}
            <Branch>
              <RoleTile roleId="operator" onClick={setOpenRoleId} />
              <Connector />
              <div className="grid grid-cols-2 gap-3 w-full">
                <SubBranch>
                  <RoleTile
                    roleId="director"
                    size="sm"
                    onClick={setOpenRoleId}
                  />
                  <Connector short />
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <RoleTile
                      roleId="teacher"
                      size="xs"
                      onClick={setOpenRoleId}
                    />
                    <RoleTile
                      roleId="teacher-assistant"
                      size="xs"
                      onClick={setOpenRoleId}
                    />
                  </div>
                </SubBranch>
                <SubBranch>
                  <RoleTile
                    roleId="facility-manager"
                    size="sm"
                    onClick={setOpenRoleId}
                  />
                  <Connector short />
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <RoleTile
                      roleId="classroom-operations"
                      size="xs"
                      onClick={setOpenRoleId}
                    />
                    <RoleTile
                      roleId="student-experience"
                      size="xs"
                      onClick={setOpenRoleId}
                    />
                  </div>
                </SubBranch>
              </div>
            </Branch>

            {/* Branch B — Executive Assistant → focus areas */}
            <Branch>
              <RoleTile roleId="executive-assistant" onClick={setOpenRoleId} />
              <Connector />
              <div className="grid grid-cols-3 gap-2 w-full">
                <RoleTile roleId="scheduling" size="xs" onClick={setOpenRoleId} />
                <RoleTile
                  roleId="documentation"
                  size="xs"
                  onClick={setOpenRoleId}
                />
                <RoleTile
                  roleId="internal-communication"
                  size="xs"
                  onClick={setOpenRoleId}
                />
              </div>
            </Branch>

            {/* Branch C — Sales Manager → focus areas */}
            <Branch>
              <RoleTile roleId="sales-manager" onClick={setOpenRoleId} />
              <Connector />
              <div className="grid grid-cols-4 gap-2 w-full">
                <RoleTile roleId="tours" size="xs" onClick={setOpenRoleId} />
                <RoleTile roleId="follow-up" size="xs" onClick={setOpenRoleId} />
                <RoleTile roleId="enrollment" size="xs" onClick={setOpenRoleId} />
                <RoleTile
                  roleId="community-outreach"
                  size="xs"
                  onClick={setOpenRoleId}
                />
              </div>
            </Branch>
          </div>
        </div>
      </div>

      {/* Other roles — legacy tiles not on the tree */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-3">
          Other Roles
        </p>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Roles that exist in the business but aren't on the primary org
          tree — kitchen, transportation, and functional managers whose
          role clarity content still lives in the Compass pages.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {OTHER_ROLES.map((id) => (
            <RoleTile
              key={id}
              roleId={id}
              size="sm"
              onClick={setOpenRoleId}
            />
          ))}
        </div>
      </div>

      {/* Drawer */}
      <OrgRoleDrawer roleId={openRoleId} onClose={() => setOpenRoleId(null)} />
    </div>
  )
}

// ─── Layout primitives ───────────────────────────────────────────────────

function TileRow({ children }) {
  return <div className="flex items-center justify-center">{children}</div>
}

function Connector({ short = false }) {
  return (
    <div
      className={`w-px bg-gray-300 ${short ? 'h-3' : 'h-5'}`}
      aria-hidden="true"
    />
  )
}

function Branch({ children }) {
  return (
    <div className="flex flex-col items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
      {children}
    </div>
  )
}

function SubBranch({ children }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-white border border-gray-200 rounded-lg p-2">
      {children}
    </div>
  )
}

// ─── Tile ───────────────────────────────────────────────────────────────

/**
 * A single clickable role tile. Sizes:
 *   - lg: top-of-tree tiles (Visionary, Integrator) — large, prominent
 *   - md (default): mid-tree roles (Operator, Exec Asst, Sales)
 *   - sm: leaf-ish roles (Director, Facility Manager, other roles)
 *   - xs: focus-area / class tiles (Teachers, Scheduling, etc.)
 *
 * Uses the ROLE_META tone to color the left border and icon background —
 * matches the visual's blue/green split (Roman blue = Visionary indigo,
 * Ryan green = Integrator emerald).
 */
function RoleTile({ roleId, size = 'md', onClick }) {
  const contact = ROLE_CONTACTS[roleId] || {
    name: roleId,
    title: '',
  }
  const meta = ROLE_META[roleId] || { emoji: '🧭', tagline: '', tone: 'indigo' }
  const tone = TONE_CLASSES[meta.tone] || TONE_CLASSES.indigo

  // `xs` uses a stacked (emoji-on-top) layout so the tile's full width is
  // available for the label to wrap onto 2 lines. The larger sizes keep
  // the horizontal (emoji-beside-label) layout — they've got room.
  const isStacked = size === 'xs'

  const sizeClasses = {
    lg: 'p-4 min-w-[220px]',
    md: 'p-3 w-full',
    sm: 'p-2.5 w-full',
    xs: 'p-2 w-full min-h-[68px]',
  }
  const emojiSizes = {
    lg: 'text-2xl w-10 h-10',
    md: 'text-lg w-8 h-8',
    sm: 'text-base w-7 h-7',
    xs: 'text-sm w-6 h-6',
  }
  const titleSizes = {
    lg: 'text-base',
    md: 'text-sm',
    sm: 'text-xs',
    xs: 'text-[10px]',
  }
  const captionSizes = {
    lg: 'text-xs',
    md: 'text-[11px]',
    sm: 'text-[10px]',
    xs: 'text-[9px]',
  }

  return (
    <button
      onClick={() => onClick(roleId)}
      className={`text-left bg-white border-l-4 ${tone.border} border-y border-r border-gray-200 rounded-lg ${sizeClasses[size]} ${tone.ring} hover:shadow-sm transition-all group min-w-0 ${
        contact.vacant ? 'ring-1 ring-amber-200' : ''
      }`}
    >
      {isStacked ? (
        // Stacked layout for xs tiles — emoji on top, full-width label
        // wraps to 2 lines. Fits "Documentation", "Internal Communication",
        // "Community Outreach", etc. without truncating.
        <div className="flex flex-col items-start gap-1">
          <div
            className={`${emojiSizes[size]} rounded-md flex items-center justify-center flex-shrink-0 ${tone.iconBg}`}
          >
            {meta.emoji}
          </div>
          <p
            className={`${titleSizes[size]} font-bold text-gray-900 leading-tight line-clamp-2 w-full`}
          >
            {contact.name}
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <div
            className={`${emojiSizes[size]} rounded-md flex items-center justify-center flex-shrink-0 ${tone.iconBg}`}
          >
            {meta.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`${titleSizes[size]} font-bold text-gray-900 leading-tight truncate`}
            >
              {contact.name}
              {contact.vacant && (
                <span className="ml-1 text-[8px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 align-middle whitespace-nowrap">
                  Vacant
                </span>
              )}
            </p>
            {(size === 'lg' || size === 'md') && contact.title && (
              <p className={`${captionSizes[size]} text-gray-500 truncate`}>
                {contact.title}
              </p>
            )}
            {size === 'lg' && meta.tagline && (
              <p className="text-[10px] text-gray-400 italic mt-0.5 truncate">
                {meta.tagline}
              </p>
            )}
          </div>
        </div>
      )}
    </button>
  )
}
