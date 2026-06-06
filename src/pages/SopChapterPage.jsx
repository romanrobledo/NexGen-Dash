import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  BookOpen,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { useSops } from '../hooks/useSops'
import SopBreadcrumbs from '../components/SopBreadcrumbs'
import SopSearchBar, { filterSopsByQuery } from '../components/SopSearchBar'
import SopStatusChip from '../components/SopStatusChip'

/**
 * Chapter view — `/sop-library/chapter/:chapterNum`.
 *
 * Shows all SOPs in the selected chapter as a two-column card grid on
 * wider screens, single-column on mobile. Cloned loosely from
 * HandbooksPage's card layout but scaled down for dozens of items per
 * chapter rather than two.
 *
 * Empty-chapter state (user confirmed): teachers with zero `live` SOPs in
 * this chapter see a friendly "nothing published yet" state rather than a
 * 404. Keeps the URL space stable and lets curators deep-link to an empty
 * chapter to start filling it in.
 */
export default function SopChapterPage() {
  const { chapterNum } = useParams()
  const navigate = useNavigate()
  const { mobileMode } = useViewMode()
  const { sops, loading, error, canCurate } = useSops()
  const [query, setQuery] = useState('')

  // Parse + validate the URL param. Malformed → back to library.
  const numericChapter = Number(chapterNum)
  const isValidChapter =
    Number.isInteger(numericChapter) && numericChapter >= 1

  const chapterSops = useMemo(() => {
    if (!isValidChapter) return []
    return sops.filter((s) => s.chapter_num === numericChapter)
  }, [sops, numericChapter, isValidChapter])

  const filteredChapterSops = useMemo(
    () => filterSopsByQuery(chapterSops, query),
    [chapterSops, query]
  )

  // Derive chapter name from the first row in the chapter. If no rows
  // exist (teacher sees zero live, or chapter hasn't been seeded yet), we
  // display "Chapter N" as a fallback.
  const chapterName = chapterSops[0]?.chapter_name || `Chapter ${numericChapter}`

  const liveCount = chapterSops.filter((s) => s.status === 'live').length

  return (
    <div className={mobileMode ? '' : 'max-w-5xl mx-auto'}>
      <SopBreadcrumbs
        chapter={
          isValidChapter
            ? { chapterNum: numericChapter, chapterName }
            : null
        }
      />

      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate('/sop-library')}
          className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Back to SOP Library"
          aria-label="Back to SOP Library"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center flex-shrink-0 font-bold text-sm text-[#7c3aed] tabular-nums">
            {isValidChapter ? String(numericChapter).padStart(2, '0') : '??'}
          </div>
          <div className="min-w-0">
            <h1 className={`font-bold text-gray-900 ${mobileMode ? 'text-xl' : 'text-2xl'}`}>
              {chapterName}
            </h1>
            <p className="text-sm text-gray-500 truncate">
              {isValidChapter
                ? `Chapter ${numericChapter} · ${liveCount}/${chapterSops.length} live`
                : 'Chapter not found'}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      {isValidChapter && chapterSops.length > 0 && (
        <div className="mb-5">
          <SopSearchBar
            value={query}
            onChange={setQuery}
            placeholder={`Search within ${chapterName}…`}
          />
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl flex items-center justify-center py-14">
          <Loader2 className="w-5 h-5 text-[#7c3aed] animate-spin" />
          <span className="ml-2 text-sm text-gray-500">Loading SOPs…</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              Couldn't load this chapter
            </p>
            <p className="text-xs text-red-500 mt-0.5 break-words">{error}</p>
          </div>
        </div>
      ) : !isValidChapter ? (
        <ChapterEmptyState
          title="That chapter doesn't look right"
          body={`"${chapterNum}" isn't a valid chapter number.`}
        />
      ) : chapterSops.length === 0 ? (
        <ChapterEmptyState
          title={
            canCurate
              ? 'This chapter has no SOPs yet'
              : 'No published SOPs in this chapter yet'
          }
          body={
            canCurate
              ? 'Add SOPs to this chapter in Supabase or via the Editor (Phase 2) and they\'ll appear here.'
              : 'Check back soon — the curation team is actively building this chapter out.'
          }
        />
      ) : filteredChapterSops.length === 0 ? (
        <ChapterEmptyState
          title="No matching SOPs"
          body="Try a different keyword or clear the search."
        />
      ) : (
        <div
          className={`grid gap-3 ${
            mobileMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {filteredChapterSops.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(`/sop-library/${s.sop_id}`)}
              className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-[#7c3aed]/40 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start gap-3 mb-2">
                <span className="inline-flex items-center justify-center min-w-[3rem] px-2 h-6 rounded-md bg-[#7c3aed]/10 text-[#7c3aed] font-bold text-xs tabular-nums">
                  {s.sop_id}
                </span>
                <h4 className="text-sm font-semibold text-gray-900 leading-snug flex-1">
                  {s.title}
                </h4>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-0.5 transition-colors" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <SopStatusChip status={s.status} />
                {s.owner_role && (
                  <span className="text-[11px] text-gray-500">
                    Owner: <span className="font-medium text-gray-700">{s.owner_role}</span>
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Empty state ────────────────────────────────────────────────────────────

function ChapterEmptyState({ title, body }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
      <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">{body}</p>
    </div>
  )
}
