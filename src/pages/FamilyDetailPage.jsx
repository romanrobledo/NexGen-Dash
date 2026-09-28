import { useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  Baby,
  FileText,
  MessageSquare,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  Send,
  Plus,
  Pencil,
  Star,
  Ban,
} from 'lucide-react'
import { useFamilies } from '../hooks/useFamilies'
import GuardianEditDrawer from '../components/GuardianEditDrawer'

/**
 * The "one big Families page" — a tabbed profile per household.
 *
 * Phase 1 (this file): Overview + Children tabs render real data.
 *   Guardians / Paperwork / Communications / Tours / Billing tabs
 *   render a "Coming next" placeholder so the shape is visible.
 *
 * Phase 2 will wire Guardians (CRUD) + Paperwork (Supabase Storage).
 * Phase 3 wires Communications (with SMS-send → GoHighLevel webhook),
 *   Tours, Billing (from bank_statements + plans).
 */
const TABS = [
  { key: 'overview',       label: 'Overview',       icon: Users },
  { key: 'children',       label: 'Children',       icon: Baby },
  { key: 'guardians',      label: 'Guardians',      icon: Users },
  { key: 'paperwork',      label: 'Paperwork',      icon: FileText,     placeholder: true },
  { key: 'communications', label: 'Communications', icon: MessageSquare, placeholder: true },
  { key: 'tours',          label: 'Tours',          icon: Calendar,     placeholder: true },
  { key: 'billing',        label: 'Billing',        icon: DollarSign,   placeholder: true },
]

export default function FamilyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { familiesById, loading, error, refetch } = useFamilies()
  const [activeTab, setActiveTab] = useState('overview')
  const [guardianDrawer, setGuardianDrawer] = useState(/** @type {{mode:'create'|'edit', guardian?:any}|null} */ (null))

  const family = familiesById.get(id) || null

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <span className="ml-3 text-sm text-gray-500">Loading family…</span>
      </div>
    )
  }
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Failed to load family</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }
  if (!family) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Family not found</h1>
        <p className="text-sm text-gray-500 mb-6">
          No family record exists at{' '}
          <code className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">/families/{id}</code>.
        </p>
        <Link
          to="/families"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to families
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <button
        onClick={() => navigate('/families')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 -mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        All families
      </button>

      <FamilyHeader family={family} />
      <Tabs active={activeTab} onSelect={setActiveTab} />
      {activeTab === 'overview'  && <OverviewTab  family={family} />}
      {activeTab === 'children'  && <ChildrenTab  family={family} />}
      {activeTab === 'guardians' && (
        <GuardiansTab
          family={family}
          onAdd={() => setGuardianDrawer({ mode: 'create' })}
          onEdit={(g) => setGuardianDrawer({ mode: 'edit', guardian: g })}
        />
      )}
      {activeTab === 'paperwork' && <PlaceholderTab title="Paperwork"      note="Phase 2 — checklist of required docs per child + PDF upload via Supabase Storage." />}
      {activeTab === 'communications' && <PlaceholderTab title="Communications" note="Phase 3 — check-in/out log, staff notes, and an SMS composer that fires a GoHighLevel / Bizsync webhook." />}
      {activeTab === 'tours'     && <PlaceholderTab title="Tours"          note="Phase 3 — post-enrollment tour + follow-up history (separate from the pre-enrollment leads tour table)." />}
      {activeTab === 'billing'   && <PlaceholderTab title="Billing"        note="Phase 3 — tuition status pulled from bank_statements + plans." />}

      <GuardianEditDrawer
        open={!!guardianDrawer}
        mode={guardianDrawer?.mode || 'create'}
        familyId={family.id}
        guardian={guardianDrawer?.guardian}
        onClose={() => setGuardianDrawer(null)}
        onSaved={async () => {
          setGuardianDrawer(null)
          await refetch()
        }}
      />
    </div>
  )
}

/**
 * Big header card — family name, room chips, primary guardian one-liner.
 */
function FamilyHeader({ family }) {
  const g = family.primaryGuardian
  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
          {family.familyName?.[0] || '·'}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {family.familyName}
          </h1>
          <div className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1">
              <Baby className="w-3.5 h-3.5" />
              {family.children.length} child{family.children.length === 1 ? '' : 'ren'}
            </span>
            {family.roomNumbers.length > 0 && (
              <span>
                {family.roomNumbers.map((r) => `Room ${r}`).join(' · ')}
              </span>
            )}
            {g && (
              <span>
                Primary: {g.firstName} {g.lastName}
                {g.relationship && ` (${g.relationship})`}
              </span>
            )}
          </div>
        </div>
        <button
          disabled
          title="SMS notification (Phase 3)"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-400 cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
          Send SMS
        </button>
      </div>
    </div>
  )
}

/**
 * Segmented tab strip. Placeholder tabs still selectable so Roman can
 * see the shape of each; they just render a "Coming next" panel.
 */
function Tabs({ active, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200">
      {TABS.map((t) => {
        const Icon = t.icon
        const isActive = t.key === active
        return (
          <button
            key={t.key}
            onClick={() => onSelect(t.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border-b-2 -mb-px transition ${
              isActive
                ? 'text-blue-700 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {t.label}
            {t.placeholder && (
              <span className="ml-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                soon
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function OverviewTab({ family }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <SummaryCard label="Children" value={family.children.length} icon={Baby} tone="blue" />
      <SummaryCard label="Guardians" value={family.guardians.length} icon={Users} tone="emerald" />
      <SummaryCard label="Rooms" value={family.roomNumbers.length || '—'} icon={Calendar} tone="amber" />
      <SummaryCard
        label="Primary contact"
        value={
          family.primaryGuardian
            ? `${family.primaryGuardian.firstName} ${family.primaryGuardian.lastName}`
            : 'Not set'
        }
        icon={Phone}
        tone="rose"
      />
      {family.notes && (
        <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-1">Notes</p>
          <p className="text-sm text-amber-900 whitespace-pre-line">{family.notes}</p>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, icon: Icon, tone }) {
  const tones = {
    blue:    'bg-blue-50 border-blue-200 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber:   'bg-amber-50 border-amber-200 text-amber-700',
    rose:    'bg-rose-50 border-rose-200 text-rose-700',
  }
  return (
    <div className={`rounded-xl border p-4 ${tones[tone] || tones.blue}`}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">{label}</p>
        <Icon className="w-4 h-4 opacity-70" />
      </div>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

function ChildrenTab({ family }) {
  const rows = useMemo(
    () =>
      [...family.children].sort((a, b) =>
        (a.fullName || '').localeCompare(b.fullName || '')
      ),
    [family.children]
  )
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
        <Baby className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No children linked to this family.</p>
      </div>
    )
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <Th>Name</Th>
            <Th>DOB</Th>
            <Th>Room</Th>
            <Th>Teacher</Th>
            <Th>CCMS</Th>
            <Th>Program / Class</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.fullName}</td>
              <td className="px-4 py-3 text-xs text-gray-600">{fmtDate(c.dateOfBirth)}</td>
              <td className="px-4 py-3 text-xs text-gray-600">{c.roomNumber ?? '—'}</td>
              <td className="px-4 py-3 text-xs text-gray-600">{c.teacherName ?? '—'}</td>
              <td className="px-4 py-3 text-xs">
                {c.onCcms === true
                  ? <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">Yes</span>
                  : c.onCcms === false
                    ? <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">No</span>
                    : <span className="text-gray-400">—</span>}
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">{c.programClass ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Guardians list — one row per person, sorted by is_primary first (star
 * card at the top), then emergency_priority ASC, then last name. Each
 * row surfaces relationship, phone, email, and two badges: PRIMARY (if
 * is_primary) and PICKUP (only shown if pickup_authorized is false — the
 * default state is authorized so we don't flood the UI with green
 * PICKUP badges).
 */
function GuardiansTab({ family, onAdd, onEdit }) {
  const guardians = useMemo(() => {
    return [...family.guardians].sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1
      const ap = a.emergencyPriority ?? 999
      const bp = b.emergencyPriority ?? 999
      if (ap !== bp) return ap - bp
      return (a.lastName || '').localeCompare(b.lastName || '')
    })
  }, [family.guardians])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {guardians.length} guardian{guardians.length === 1 ? '' : 's'} on file
        </p>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          Add guardian
        </button>
      </div>

      {guardians.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
          <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-semibold">No guardians on file yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Add at least one guardian so you know who to contact for this family.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {guardians.map((g) => (
            <GuardianRow key={g.id} guardian={g} onEdit={() => onEdit(g)} />
          ))}
        </div>
      )}
    </div>
  )
}

function GuardianRow({ guardian, onEdit }) {
  return (
    <div
      className={`rounded-xl border p-4 flex items-start gap-3 hover:border-gray-300 transition ${
        guardian.isPrimary ? 'border-blue-200 bg-blue-50/40' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-bold shrink-0">
        {(guardian.firstName?.[0] || '')}{(guardian.lastName?.[0] || '')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900">
            {guardian.firstName} {guardian.lastName}
          </p>
          {guardian.relationship && (
            <span className="text-xs text-gray-500">({guardian.relationship})</span>
          )}
          {guardian.isPrimary && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
              <Star className="w-3 h-3" />
              Primary
            </span>
          )}
          {!guardian.pickupAuthorized && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700">
              <Ban className="w-3 h-3" />
              No pickup
            </span>
          )}
          {guardian.emergencyPriority != null && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
              Emergency #{guardian.emergencyPriority}
            </span>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-3 flex-wrap text-xs text-gray-600">
          {guardian.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-gray-400" />
              <a href={`tel:${guardian.phone}`} className="hover:text-blue-700">{guardian.phone}</a>
            </span>
          )}
          {guardian.email && (
            <span className="flex items-center gap-1 truncate max-w-xs">
              <Mail className="w-3 h-3 text-gray-400 shrink-0" />
              <a href={`mailto:${guardian.email}`} className="hover:text-blue-700 truncate">{guardian.email}</a>
            </span>
          )}
        </div>
        {guardian.notes && (
          <p className="text-xs text-gray-500 mt-2 italic">{guardian.notes}</p>
        )}
      </div>
      <button
        onClick={onEdit}
        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition shrink-0"
        title="Edit guardian"
      >
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  )
}

function PlaceholderTab({ title, note }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
      <p className="text-sm font-semibold text-gray-700">{title} — coming next</p>
      <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto">{note}</p>
    </div>
  )
}

function Th({ children }) {
  return (
    <th className="text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}
