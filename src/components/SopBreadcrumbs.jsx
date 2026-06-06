import { Link } from 'react-router-dom'
import { ChevronRight, FolderOpen, BookOpen } from 'lucide-react'

/**
 * Breadcrumb trail for the SOP Library.
 *
 * Levels, in order:
 *   Resources → SOP Library → [Chapter] → [SOP]
 *
 * "Resources" doesn't have a dedicated route (it's a sidebar group, not a
 * page), so that crumb is a non-link label. Every deeper crumb links back
 * to its own level. The current page's crumb is a plain text span with
 * `aria-current="page"` for accessibility.
 *
 * @param {{
 *   chapter?: { chapterNum: number, chapterName: string } | null,
 *   sop?: { sopId: string, title: string } | null,
 * }} props
 */
export default function SopBreadcrumbs({ chapter = null, sop = null }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 flex-wrap"
    >
      {/* Resources group — non-clickable (no route) */}
      <span className="inline-flex items-center gap-1 text-gray-400">
        <FolderOpen className="w-3.5 h-3.5" />
        Resources
      </span>

      <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />

      {/* SOP Library — either a link (when drilled in) or the current page */}
      {chapter || sop ? (
        <Link
          to="/sop-library"
          className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          SOP Library
        </Link>
      ) : (
        <span
          aria-current="page"
          className="inline-flex items-center gap-1 text-gray-700 font-medium"
        >
          <BookOpen className="w-3.5 h-3.5" />
          SOP Library
        </span>
      )}

      {/* Chapter crumb */}
      {chapter && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
          {sop ? (
            <Link
              to={`/sop-library/chapter/${chapter.chapterNum}`}
              className="hover:text-gray-900 transition-colors truncate max-w-[160px] sm:max-w-none"
            >
              Ch. {chapter.chapterNum}. {chapter.chapterName}
            </Link>
          ) : (
            <span
              aria-current="page"
              className="text-gray-700 font-medium truncate max-w-[200px] sm:max-w-none"
            >
              Ch. {chapter.chapterNum}. {chapter.chapterName}
            </span>
          )}
        </>
      )}

      {/* SOP crumb */}
      {sop && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
          <span
            aria-current="page"
            className="text-gray-700 font-medium truncate max-w-[200px] sm:max-w-none"
            title={sop.title}
          >
            {sop.sopId} · {sop.title}
          </span>
        </>
      )}
    </nav>
  )
}
