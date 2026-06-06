import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

/**
 * Debounced search input for the SOP Library.
 *
 * Parent components pass in `onChange(query)` and SopSearchBar handles local
 * value + debouncing. Debounce is 200 ms — short enough to feel live, long
 * enough that a fast typist doesn't filter the 438-row in-memory list on
 * every keystroke.
 *
 * The filter logic itself lives on the parent (pages implement `matchesSop`
 * via `filterSopsByQuery()` below) so it can be reused outside of this
 * component. This file is presentational only.
 *
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void,
 *   placeholder?: string,
 * }} props
 */
export default function SopSearchBar({ value, onChange, placeholder = 'Search by title, SOP ID, or keyword...' }) {
  const [local, setLocal] = useState(value)
  const timerRef = useRef(null)

  // Keep local input in sync when parent resets (e.g., navigating to a
  // different chapter).
  useEffect(() => {
    setLocal(value)
  }, [value])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (local !== value) onChange(local)
    }, 200)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#7c3aed]/30 focus:border-[#7c3aed] outline-none transition-colors placeholder:text-gray-400"
      />
      {local && (
        <button
          type="button"
          onClick={() => setLocal('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

/**
 * Case-insensitive match against title, sop_id, and triggers[].
 * Exported here so pages can keep filter logic consistent.
 *
 * Matching rules:
 *   - Exact `sop_id` match (cheap early-out)
 *   - Substring in title
 *   - Substring in any trigger
 * All three are OR'd together.
 *
 * @param {import('../lib/sopTypes').Sop} sop
 * @param {string} rawQuery
 * @returns {boolean}
 */
export function sopMatchesQuery(sop, rawQuery) {
  const q = (rawQuery || '').trim().toLowerCase()
  if (!q) return true
  if (!sop) return false

  if (sop.sop_id && sop.sop_id.toLowerCase() === q) return true
  if (sop.title && sop.title.toLowerCase().includes(q)) return true

  const triggers = Array.isArray(sop.triggers) ? sop.triggers : []
  for (const t of triggers) {
    if (typeof t === 'string' && t.toLowerCase().includes(q)) return true
  }
  return false
}

/**
 * Apply `sopMatchesQuery` across an array.
 *
 * @param {import('../lib/sopTypes').Sop[]} sops
 * @param {string} query
 * @returns {import('../lib/sopTypes').Sop[]}
 */
export function filterSopsByQuery(sops, query) {
  if (!query || !query.trim()) return sops
  return sops.filter((s) => sopMatchesQuery(s, query))
}
