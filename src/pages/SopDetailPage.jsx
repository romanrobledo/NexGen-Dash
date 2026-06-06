import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  BookOpen,
  Clock,
  UserRound,
  Tag,
  CalendarCheck,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { useSops } from '../hooks/useSops'
import SopBreadcrumbs from '../components/SopBreadcrumbs'
import SopStatusChip from '../components/SopStatusChip'
import SopRenderer from '../components/SopRenderer'

/**
 * Single SOP viewer — `/sop-library/:sopId`.
 *
 * Layout:
 *   - Breadcrumbs
 *   - Back button + title + metadata strip (status, owner, version, last
 *     reviewed)
 *   - Optional "Triggers" chip row so users can see what keywords route
 *     agents to this SOP — surfaces retrieval context transparently
 *   - SopRenderer for body (handles its own empty state)
 *
 * Phase 2 hook-in point:
 *   The "Edit" button lives between the title and the metadata strip. See
 *   the comment marker in the JSX below (`<!-- PHASE 2 EDIT BUTTON --> `).
 *   Replace that comment with an `<EditSopButton sop={sop} />` component.
 *   Gate visibility with `canCurate` from `useSops()` (already exposed).
 */
export default function SopDetailPage() {
  const { sopId } = useParams()
  const navigate = useNavigate()
  const { mobileMode } = useViewMode()
  const { sops, loading, error } = useSops()

  const sop = useMemo(
    () => sops.find((s) => s.sop_id === sopId) || null,
    [sops, sopId]
  )

  if (loading) {
    return (
      <div className={mobileMode ? '' : 'max-w-4xl mx-auto'}>
        <div className="bg-white border border-gray-200 rounded-2xl flex items-center justify-center py-14">
          <Loader2 className="w-5 h-5 text-[#7c3aed] animate-spin" />
          <span className="ml-2 text-sm text-gray-500">Loading SOP…</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={mobileMode ? '' : 'max-w-4xl mx-auto'}>
        <SopBreadcrumbs />
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              Couldn't load this SOP
            </p>
            <p className="text-xs text-red-500 mt-0.5 break-words">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!sop) {
    return (
      <div className={mobileMode ? '' : 'max-w-4xl mx-auto'}>
        <SopBreadcrumbs />
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">
            SOP not found
          </p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Either this SOP id ({sopId}) doesn't exist, or it's not visible at
            your access level (drafts and in-review SOPs are only visible to
            curators).
          </p>
          <button
            onClick={() => navigate('/sop-library')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#7c3aed] text-white hover:bg-[#5b21b6] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to SOP Library
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={mobileMode ? '' : 'max-w-4xl mx-auto'}>
      <SopBreadcrumbs
        chapter={{ chapterNum: sop.chapter_num, chapterName: sop.chapter_name }}
        sop={{ sopId: sop.sop_id, title: sop.title }}
      />

      {/* Back + Title */}
      <div className="flex items-start gap-3 mb-4">
        <button
          onClick={() =>
            navigate(`/sop-library/chapter/${sop.chapter_num}`)
          }
          className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0 mt-0.5"
          title="Back to chapter"
          aria-label="Back to chapter"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center justify-center min-w-[3.25rem] px-2 h-7 rounded-md bg-[#7c3aed]/10 text-[#7c3aed] font-bold text-sm tabular-nums">
              {sop.sop_id}
            </span>
            <SopStatusChip status={sop.status} size="md" />
          </div>
          <h1 className={`font-bold text-gray-900 leading-tight ${mobileMode ? 'text-xl' : 'text-2xl'}`}>
            {sop.title}
          </h1>
        </div>
      </div>

      {/* Phase 2 hook-in point
          --------------------
          Add <EditSopButton sop={sop} /> here once Phase 2 lands. Gate it
          with `canCurate` from useSops() — the hook already exposes that
          flag. Don't render a disabled placeholder in Phase 1. */}

      {/* Metadata strip */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <MetaCell
            icon={UserRound}
            label="Owner"
            value={sop.owner_role || '—'}
          />
          <MetaCell
            icon={Tag}
            label="Version"
            value={sop.version || '—'}
          />
          <MetaCell
            icon={Clock}
            label="Last reviewed"
            value={formatDate(sop.last_reviewed)}
          />
          <MetaCell
            icon={CalendarCheck}
            label="Review due"
            value={formatDate(sop.next_review_due)}
          />
        </div>

        {/* Triggers */}
        {Array.isArray(sop.triggers) && sop.triggers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Triggers
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sop.triggers.map((t) => (
                <span
                  key={t}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* TRS categories + Severity */}
        {(Array.isArray(sop.trs_categories) && sop.trs_categories.length > 0) ||
        sop.severity ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {Array.isArray(sop.trs_categories) &&
              sop.trs_categories.map((c) => (
                <span
                  key={c}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold"
                >
                  TRS Cat {c}
                </span>
              ))}
            {sop.severity && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold capitalize">
                Severity: {sop.severity}
              </span>
            )}
          </div>
        ) : null}
      </div>

      {/* Body */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7">
        <SopRenderer markdown={sop.body_markdown} />
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetaCell({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-gray-400">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">
        {value}
      </p>
    </div>
  )
}

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}
