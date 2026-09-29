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
import { useFamilyDocuments } from '../hooks/useFamilyDocuments'
import { useFamilyCommunications } from '../hooks/useFamilyCommunications'
import { useFamilyTours } from '../hooks/useFamilyTours'
import {
  FAMILY_SCOPED_TYPES,
  CHILD_SCOPED_TYPES,
  docStatus,
} from '../lib/familyDocumentTypes'
import GuardianEditDrawer from '../components/GuardianEditDrawer'
import PaperworkUploadDrawer from '../components/PaperworkUploadDrawer'
import CommunicationLogDrawer from '../components/CommunicationLogDrawer'
import TourLogDrawer from '../components/TourLogDrawer'

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
  { key: 'paperwork',      label: 'Paperwork',      icon: FileText },
  { key: 'communications', label: 'Communications', icon: MessageSquare },
  { key: 'tours',          label: 'Tours',          icon: Calendar },
  { key: 'billing',        label: 'Billing',        icon: DollarSign },
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
      {activeTab === 'paperwork'      && <PaperworkTab      family={family} />}
      {activeTab === 'communications' && <CommunicationsTab family={family} />}
      {activeTab === 'tours'          && <ToursTab          family={family} />}
      {activeTab === 'billing'        && <BillingTab        family={family} />}

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

/**
 * Compliance grid. Rows = doc types (family-scoped first, then child-
 * scoped). Columns for family-scoped rows show ONE cell ("Family").
 * Columns for child-scoped rows show one cell per enrolled child.
 * Cells are click-to-upload / click-to-view: click any cell (with or
 * without an existing doc) to open the PaperworkUploadDrawer.
 *
 * Uses useFamilyDocuments locally so uploads/deletes refetch just this
 * tab without touching the parent useFamilies query.
 */
function PaperworkTab({ family }) {
  const uploader = useFamilyDocuments(family.id)
  const [drawer, setDrawer] = useState(/** @type {{docType:string, childId?:string|null, childLabel?:string}|null} */ (null))

  // Index docs by lookup key so cell renderers can find their existing
  // doc in O(1). Key format: docType|scope, where scope = childId or 'family'.
  const docsByKey = useMemo(() => {
    const m = new Map()
    for (const d of uploader.docs) {
      const scope = d.childId || 'family'
      m.set(`${d.docType}|${scope}`, d)
    }
    return m
  }, [uploader.docs])

  const children = useMemo(
    () => [...family.children].sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '')),
    [family.children]
  )

  const drawerExisting = drawer
    ? docsByKey.get(`${drawer.docType}|${drawer.childId || 'family'}`)
    : null

  return (
    <div className="space-y-4">
      {uploader.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{uploader.error}</p>
        </div>
      )}

      {/* Family-scoped block */}
      <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <header className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Family-scoped</h3>
        </header>
        <ul className="divide-y divide-gray-100">
          {FAMILY_SCOPED_TYPES.map((t) => {
            const doc = docsByKey.get(`${t.key}|family`)
            return (
              <li key={t.key} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{t.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{t.description}</p>
                </div>
                <PaperworkCell
                  doc={doc}
                  onClick={() => setDrawer({ docType: t.key, childId: null })}
                />
              </li>
            )
          })}
        </ul>
      </section>

      {/* Child-scoped grid */}
      {children.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <header className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Child-scoped</h3>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50/50 z-10">
                    Document
                  </th>
                  {children.map((c) => (
                    <th key={c.id} className="text-left px-3 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      {(c.fullName || '').split(',').pop().trim() || c.fullName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CHILD_SCOPED_TYPES.map((t) => (
                  <tr key={t.key} className="border-b border-gray-100 last:border-b-0">
                    <th className="text-left px-4 py-3 sticky left-0 bg-white z-10 align-top">
                      <p className="text-sm font-medium text-gray-900">{t.label}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 font-normal">{t.description}</p>
                    </th>
                    {children.map((c) => {
                      const doc = docsByKey.get(`${t.key}|${c.id}`)
                      return (
                        <td key={c.id} className="px-3 py-3 align-top">
                          <PaperworkCell
                            doc={doc}
                            compact
                            onClick={() => setDrawer({
                              docType: t.key,
                              childId: c.id,
                              childLabel: c.fullName,
                            })}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <PaperworkUploadDrawer
        open={!!drawer}
        docType={drawer?.docType}
        childId={drawer?.childId}
        childLabel={drawer?.childLabel}
        existing={drawerExisting}
        onClose={() => setDrawer(null)}
        onSaved={() => setDrawer(null)}
        uploader={uploader}
      />
    </div>
  )
}

/**
 * One compliance pill. Green = submitted, amber = expiring, red =
 * expired, gray = missing. Click always opens the drawer (upload if
 * missing, edit if present).
 */
function PaperworkCell({ doc, onClick, compact = false }) {
  const status = docStatus(doc)
  const styles = {
    submitted: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
    expiring:  'bg-amber-50   border-amber-200   text-amber-700   hover:bg-amber-100',
    expired:   'bg-rose-50    border-rose-200    text-rose-700    hover:bg-rose-100',
    missing:   'bg-gray-50    border-gray-200    text-gray-500    hover:bg-gray-100',
  }
  const labels = {
    submitted: 'Submitted',
    expiring:  'Expiring',
    expired:   'Expired',
    missing:   'Missing',
  }
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold transition ${styles[status]} ${compact ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {labels[status]}
      {doc?.expiresAt && status !== 'submitted' && (
        <span className="opacity-70">· {fmtShortDate(doc.expiresAt)}</span>
      )}
    </button>
  )
}

function fmtShortDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch { return iso }
}

/**
 * Communications timeline — reverse-chronological feed of every interaction
 * (call, email, sms, in-person, note). Plus a compact SMS composer at the
 * top when a phone number is on file for the primary guardian.
 */
function CommunicationsTab({ family }) {
  const comms = useFamilyCommunications(family.id)
  const [drawer, setDrawer] = useState(/** @type {{mode:'create'|'edit', entry?:any}|null} */ (null))
  const [smsBody, setSmsBody] = useState('')
  const [smsError, setSmsError] = useState(/** @type {string|null} */ (null))

  const primaryPhone = family.primaryGuardian?.phone || ''
  const primaryName  = family.primaryGuardian
    ? `${family.primaryGuardian.firstName} ${family.primaryGuardian.lastName}`
    : ''

  async function handleSendSms() {
    setSmsError(null)
    if (!primaryPhone) { setSmsError('No phone on file for the primary guardian.'); return }
    if (!smsBody.trim()) { setSmsError('Message is empty.'); return }
    const { ok, error: sErr } = await comms.sendSms({
      toPhone: primaryPhone,
      body: smsBody.trim(),
      familyId: family.id,
      guardianName: primaryName,
    })
    if (!ok) { setSmsError(sErr); return }
    setSmsBody('')
  }

  return (
    <div className="space-y-4">
      {/* SMS composer */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Send className="w-4 h-4 text-blue-600" />
            Send SMS
            {!comms.smsConfigured && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                webhook not set
              </span>
            )}
          </h3>
          <p className="text-[11px] text-gray-500">
            To: {primaryName || '—'} {primaryPhone && `· ${primaryPhone}`}
          </p>
        </div>
        <textarea
          rows={3}
          value={smsBody}
          onChange={(e) => setSmsBody(e.target.value)}
          placeholder="Hey — quick note from NexGen…"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
        />
        {smsError && (
          <p className="text-xs text-red-600 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {smsError}
          </p>
        )}
        <div className="flex items-center justify-end gap-2">
          <span className="text-[11px] text-gray-400">Auto-logs as outbound SMS.</span>
          <button
            onClick={handleSendSms}
            disabled={comms.sending || !primaryPhone}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
          >
            {comms.sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Send
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {comms.rows.length} log entry{comms.rows.length === 1 ? '' : 'ies'}
        </p>
        <button
          onClick={() => setDrawer({ mode: 'create' })}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          Log entry
        </button>
      </div>

      {comms.loading ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-xs text-gray-500">
          Loading…
        </div>
      ) : comms.rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
          <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-semibold">No log entries yet.</p>
          <p className="text-xs text-gray-400 mt-1">Log a call, text, or staff note above.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {comms.rows.map((r) => (
            <CommunicationRow
              key={r.id}
              row={r}
              onEdit={() => setDrawer({ mode: 'edit', entry: r })}
            />
          ))}
        </ul>
      )}

      <CommunicationLogDrawer
        open={!!drawer}
        mode={drawer?.mode || 'create'}
        entry={drawer?.entry}
        familyChildren={family.children.map((c) => ({ id: c.id, fullName: c.fullName }))}
        onClose={() => setDrawer(null)}
        onSaved={() => setDrawer(null)}
        comms={comms}
      />
    </div>
  )
}

function CommunicationRow({ row, onEdit }) {
  const methodLabels = {
    call: 'Phone call', sms: 'SMS', email: 'Email', in_person: 'In-person', note: 'Note',
  }
  const methodTones = {
    call: 'bg-blue-100 text-blue-700',
    sms: 'bg-emerald-100 text-emerald-700',
    email: 'bg-purple-100 text-purple-700',
    in_person: 'bg-amber-100 text-amber-700',
    note: 'bg-gray-100 text-gray-700',
  }
  return (
    <li className="rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300">
      <div className="flex items-center gap-2 flex-wrap mb-1.5">
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${methodTones[row.method] || 'bg-gray-100 text-gray-700'}`}>
          {methodLabels[row.method] || row.method}
        </span>
        {row.direction && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            {row.direction === 'inbound' ? '← Parent' : '→ Parent'}
          </span>
        )}
        {row.followUpNeeded && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
            Follow-up
            {row.followUpBy && ` · ${fmtShortDate(row.followUpBy)}`}
          </span>
        )}
        <span className="text-[11px] text-gray-500 ml-auto">
          {fmtDateTime(row.contactAt)}
        </span>
        <button onClick={onEdit} className="p-1 rounded text-gray-400 hover:text-gray-700" title="Edit">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
      {row.subject && <p className="text-sm font-semibold text-gray-900">{row.subject}</p>}
      {row.body && <p className="text-sm text-gray-700 whitespace-pre-line mt-1">{row.body}</p>}
    </li>
  )
}

/**
 * Tours list — reverse-chronological table with add/edit drawer.
 */
function ToursTab({ family }) {
  const tours = useFamilyTours(family.id)
  const [drawer, setDrawer] = useState(/** @type {{mode:'create'|'edit', entry?:any}|null} */ (null))

  const typeLabels = {
    room_visit: 'Room visit',
    parent_walkthrough: 'Parent walkthrough',
    follow_up: 'Follow-up',
    other: 'Other',
  }
  const outcomeTones = {
    positive: 'bg-emerald-100 text-emerald-700',
    neutral: 'bg-gray-100 text-gray-700',
    concern: 'bg-rose-100 text-rose-700',
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{tours.rows.length} tour{tours.rows.length === 1 ? '' : 's'} logged</p>
        <button
          onClick={() => setDrawer({ mode: 'create' })}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          Log tour
        </button>
      </div>

      {tours.loading ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-xs text-gray-500">
          Loading…
        </div>
      ) : tours.rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
          <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-semibold">No post-enrollment tours yet.</p>
          <p className="text-xs text-gray-400 mt-1">Pre-enrollment prospect tours live under Leads → Tours.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tours.rows.map((t) => (
            <li key={t.id} className="rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                  {typeLabels[t.tourType] || t.tourType}
                </span>
                {t.outcome && (
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${outcomeTones[t.outcome]}`}>
                    {t.outcome}
                  </span>
                )}
                <span className="text-[11px] text-gray-500 ml-auto">{fmtDateTime(t.tourAt)}</span>
                <button
                  onClick={() => setDrawer({ mode: 'edit', entry: t })}
                  className="p-1 rounded text-gray-400 hover:text-gray-700"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              {t.notes && <p className="text-sm text-gray-700 whitespace-pre-line mt-2">{t.notes}</p>}
            </li>
          ))}
        </ul>
      )}

      <TourLogDrawer
        open={!!drawer}
        mode={drawer?.mode || 'create'}
        entry={drawer?.entry}
        onClose={() => setDrawer(null)}
        onSaved={() => setDrawer(null)}
        tours={tours}
      />
    </div>
  )
}

/**
 * Billing summary — placeholder until we scope the tuition data source
 * (Books tables vs a dedicated tuition/payment table). Shows the info
 * we already have on the child rows (parent price + CCMS coverage) as
 * a temporary read-only summary.
 */
function BillingTab({ family }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
        <p className="font-semibold">Read-only preview.</p>
        <p className="mt-1">
          The tuition status is not yet wired to a payment source. This surface
          will pull from Books (bank_statements) once we align on the columns
          that track family balance + upcoming due dates.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Enrollment records
          </p>
        </div>
        {family.children.length === 0 ? (
          <p className="p-4 text-xs text-gray-500 italic">No children linked.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {family.children.map((c) => (
              <li key={c.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{c.fullName}</p>
                  <p className="text-[11px] text-gray-500">
                    Room {c.roomNumber ?? '—'} · Teacher {c.teacherName ?? '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-500">Program / Class</p>
                  <p className="text-xs text-gray-800">{c.programClass || '—'}</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    CCMS: {c.onCcms === true ? 'Yes' : c.onCcms === false ? 'No' : 'Unknown'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function fmtDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    })
  } catch { return iso }
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
