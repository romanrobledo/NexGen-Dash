import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  ChevronRight,
  Loader2,
  AlertCircle,
  Search as SearchIcon,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { useSops } from '../hooks/useSops'
import SopBreadcrumbs from '../components/SopBreadcrumbs'
import SopSearchBar, { filterSopsByQuery } from '../components/SopSearchBar'
import SopStatusChip from '../components/SopStatusChip'

/**
 * SOP Library landing — `/sop-library`.
 *
 * Layout echoes TrainingsRoleClarityPage (confirmed as the closest visual
 * precedent): gradient icon header, progress bar, grid of tiles.
 *
 * Two display modes:
 *   - Default (no search query): show 21 chapter tiles with live/total
 *     counts. Tap a chapter → drills into the chapter page. ALL 21 chapters
 *     are always shown (per Phase 1 decision: consistency > hiding).
 *   - Searching: flatten to a list of matching SOPs, rendered as one-line
 *     rows with SOP id, title, chapter hint, and status chip. Tap an SOP →
 *     goes straight to its detail page without the chapter stop-over.
 */

// The brief specifies 21 chapters. We don't have their names hard-coded
// anywhere — we derive both number and name from the rows we fetch. If a
// chapter has zero SOPs (edge case, shouldn't happen post-seed), it won't
// appear; we display a note below the grid so curators know to seed it.
const EXPECTED_CHAPTER_COUNT = 21

export default function SopLibraryPage() {
  const navigate = useNavigate()
  const { mobileMode } = useViewMode()
  const { sops, loading, error, canCurate } = useSops()
  const [query, setQuery] = useState('')

  // Group SOPs by chapter_num, preserving chapter_name from the first row.
  // We iterate in the order sops came back (already sorted by natural
  // sop_id), so the first row per chapter is the lowest-numbered SOP — its
  // chapter_name wins, which is fine because every SOP in a chapter shares
  // the same chapter_name by schema convention.
  const chapters = useMemo(() => {
    /** @type {Map<number, { chapterNum: number, chapterName: string, total: number, live: number }>} */
    const map = new Map()
    for (const s of sops) {
      const key = s.chapter_num
      if (!map.has(key)) {
        map.set(key, {
          chapterNum: s.chapter_num,
          chapterName: s.chapter_name,
          total: 0,
          live: 0,
        })
      }
      const entry = map.get(key)
      entry.total += 1
      if (s.status === 'live') entry.live += 1
    }
    return Array.from(map.values()).sort(
      (a, b) => a.chapterNum - b.chapterNum
    )
  }, [sops])

  const totalSops = sops.length
  const totalLive = useMemo(
    () => sops.filter((s) => s.status === 'live').length,
    [sops]
  )
  const progressPct =
    totalSops > 0 ? Math.round((totalLive / totalSops) * 100) : 0

  const searchResults = useMemo(
    () => filterSopsByQuery(sops, query),
    [sops, query]
  )
  const isSearching = query.trim().length > 0

  return (
    <div className={mobileMode ? '' : 'max-w-5xl mx-auto'}>
      <SopBreadcrumbs />

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] flex items-center justify-center shadow-sm">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className={`font-bold text-gray-900 ${mobileMode ? 'text-xl' : 'text-2xl'}`}>
            SOP Library
          </h1>
          <p className="text-sm text-gray-500 truncate">
            NexGen's operations bible — every procedure, every chapter.
          </p>
        </div>
      </div>

      {/* Progress + Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Progress</h3>
            <span className="text-xs text-gray-400 font-medium tabular-nums">
              {totalLive}/{totalSops} live · {progressPct}%
            </span>
          </div>
          <div className="bg-gray-100 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-[#7c3aed] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {canCurate && (
            <p className="text-[11px] text-gray-400 mt-2">
              You're seeing every SOP, including drafts and in-review items.
            </p>
          )}
        </div>
        <SopSearchBar value={query} onChange={setQuery} />
      </div>

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
              Couldn't load the SOP Library
            </p>
            <p className="text-xs text-red-500 mt-0.5 break-words">{error}</p>
          </div>
        </div>
      ) : isSearching ? (
        // ── Flat search-result list ─────────────────────────────────────────
        <SearchResultList results={searchResults} onOpen={(s) => navigate(`/sop-library/${s.sop_id}`)} />
      ) : (
        // ── Chapter tile grid ───────────────────────────────────────────────
        <ChapterTileGrid
          chapters={chapters}
          mobileMode={mobileMode}
          onOpen={(ch) => navigate(`/sop-library/chapter/${ch.chapterNum}`)}
          expectedCount={EXPECTED_CHAPTER_COUNT}
        />
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ChapterTileGrid({ chapters, mobileMode, onOpen, expectedCount }) {
  const missingCount = Math.max(0, expectedCount - chapters.length)

  return (
    <>
      <div
        className={`grid gap-3 ${
          mobileMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {chapters.map((ch) => (
          <button
            key={ch.chapterNum}
            onClick={() => onOpen(ch)}
            className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-[#7c3aed]/40 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center flex-shrink-0 font-bold text-sm tabular-nums">
                {String(ch.chapterNum).padStart(2, '0')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-gray-900 leading-snug">
                    {ch.chapterName}
                  </h4>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Chapter {ch.chapterNum}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[11px] font-semibold text-gray-900 tabular-nums">
                  {ch.live}/{ch.total}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                  live
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {missingCount > 0 && (
        <p className="text-[11px] text-gray-400 text-center mt-5">
          {chapters.length} of {expectedCount} chapters seeded.
          {' '}
          {missingCount} chapter{missingCount === 1 ? '' : 's'} not yet in the
          database — once SOPs are seeded in those chapters, they'll appear
          here automatically.
        </p>
      )}

      {chapters.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">
            No SOPs yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Once your SOP seed runs, chapters will populate here.
          </p>
        </div>
      )}
    </>
  )
}

function SearchResultList({ results, onOpen }) {
  if (results.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
        <SearchIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-700">No matching SOPs</p>
        <p className="text-xs text-gray-400 mt-1">
          Try a different keyword or clear the search.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-5 pt-4 pb-2">
        {results.length} result{results.length === 1 ? '' : 's'}
      </p>
      <ul className="divide-y divide-gray-100">
        {results.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => onOpen(s)}
              className="w-full flex items-start gap-3 px-5 py-3.5 text-left hover:bg-gray-50 transition-colors group"
            >
              <span className="inline-flex items-center justify-center min-w-[3rem] px-2 h-6 rounded-md bg-[#7c3aed]/10 text-[#7c3aed] font-bold text-xs tabular-nums">
                {s.sop_id}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug">
                  {s.title}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                  Ch. {s.chapter_num} · {s.chapter_name}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                <SopStatusChip status={s.status} />
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
