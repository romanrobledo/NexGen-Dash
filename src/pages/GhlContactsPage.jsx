import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Loader2, Search, Phone, Mail, Tag, ChevronLeft,
  ChevronRight, X, AlertCircle, RefreshCw,
} from 'lucide-react'
import { useGhlContacts } from '../hooks/useGhl'

/**
 * Live GHL contacts directory. Mirrors the GHL native "Contacts" page.
 *
 * Fetches once per mount; the list is cached in the hook. Client-side
 * search across name/phone/email so typing is instant. Tag chips above
 * the table swap the fetch (server-side filter) between "all" and a
 * specific tag — cheaper than pulling all and client-filtering when
 * the dataset grows past the current 100-at-a-time cursor.
 */
export default function GhlContactsPage() {
  const [tag, setTag] = useState(null)     // null = all, else specific tag
  const [search, setSearch] = useState('')
  const contacts = useGhlContacts({ tag, enabled: true })

  // Tag landscape from the currently-loaded rows — lets us show a
  // compact "top tags" filter strip without a second API call.
  const topTags = useMemo(() => {
    const counts = new Map()
    for (const c of contacts.rows) {
      for (const t of (c.tags || [])) counts.set(t, (counts.get(t) || 0) + 1)
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [contacts.rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return contacts.rows
    return contacts.rows.filter(c =>
      [c.name, c.phone, c.email, c.company].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    )
  }, [contacts.rows, search])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <Link to="/families" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2">
          <ChevronLeft className="w-4 h-4" /> Families
        </Link>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              Contacts
              <span className="text-sm text-gray-500 font-normal">
                {contacts.loading ? '…' : `${filtered.length}${filtered.length !== contacts.rows.length ? ` of ${contacts.rows.length}` : ''}`}
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Live mirror of your GoHighLevel contacts. Read-only for now — edit in GHL, refresh here.
            </p>
          </div>
          <button
            onClick={contacts.refetch}
            disabled={contacts.loading}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 text-sm text-gray-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${contacts.loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, email, company…"
            className="w-full h-10 rounded-lg border border-gray-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100">
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <TagChip active={tag === null} onClick={() => setTag(null)} label="All" />
          {topTags.map(([t, n]) => (
            <TagChip key={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)} label={`${t} (${n})`} />
          ))}
          {tag && !topTags.find(([t]) => t === tag) && (
            <TagChip active onClick={() => setTag(null)} label={tag} />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {contacts.loading ? (
          <div className="p-10 text-center text-sm text-gray-500 inline-flex items-center justify-center gap-2 w-full">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading contacts…
          </div>
        ) : contacts.error ? (
          <div className="p-5 text-sm text-rose-800 inline-flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            GHL unreachable: {contacts.error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <div className="text-sm font-semibold text-gray-700">
              {search || tag ? 'No matches' : 'No contacts'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {search || tag ? 'Try a different filter.' : 'Your GHL sub-account has no contacts yet.'}
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100">
                <th className="px-4 py-2.5 font-semibold">Name</th>
                <th className="px-4 py-2.5 font-semibold">Phone</th>
                <th className="px-4 py-2.5 font-semibold hidden md:table-cell">Email</th>
                <th className="px-4 py-2.5 font-semibold hidden lg:table-cell">Tags</th>
                <th className="px-4 py-2.5 font-semibold hidden sm:table-cell text-right">Last activity</th>
                <th className="w-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <Link to={`/families/contacts/${c.id}`} className="font-medium text-gray-900 hover:text-indigo-700 flex items-center gap-2">
                      <Avatar name={c.name} />
                      <span className="truncate">{c.name || '(no name)'}</span>
                    </Link>
                    {c.company && <div className="text-[11px] text-gray-500 truncate ml-8">{c.company}</div>}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">
                    {c.phone ? (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {c.phone}
                      </span>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700 hidden md:table-cell">
                    {c.email ? (
                      <span className="inline-flex items-center gap-1 truncate max-w-[220px]">
                        <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </span>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-2.5 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-[260px]">
                      {(c.tags || []).slice(0, 3).map((t, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 truncate max-w-[110px]">{t}</span>
                      ))}
                      {(c.tags || []).length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">+{c.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 hidden sm:table-cell text-right">
                    {relativeTime(c.date_updated)}
                  </td>
                  <td className="px-2 text-gray-400">
                    <Link to={`/families/contacts/${c.id}`} className="inline-flex p-1">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-[11px] text-gray-400">
        Showing {contacts.rows.length} loaded contacts. GHL API caps each page at 500; we currently fetch up to 100 per request and don't paginate further on this page. If you need all 982, say the word and I'll wire infinite-scroll.
      </p>
    </div>
  )
}

function TagChip({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`h-7 px-2.5 rounded-full text-xs border inline-flex items-center gap-1 ${
        active
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
      }`}
    >
      <Tag className="w-3 h-3" />
      {label}
    </button>
  )
}

function Avatar({ name }) {
  const initials = (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || '·'
  return (
    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center shrink-0">
      {initials}
    </span>
  )
}

function relativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 0) return ''
  const m = Math.floor(diff / 60000)
  if (m < 1)    return 'just now'
  if (m < 60)   return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)   return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7)    return `${d}d ago`
  if (d < 30)   return `${Math.floor(d / 7)}w ago`
  if (d < 365)  return `${Math.floor(d / 30)}mo ago`
  return `${Math.floor(d / 365)}y ago`
}
