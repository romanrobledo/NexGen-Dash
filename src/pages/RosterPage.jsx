import { useMemo, useState } from 'react'
import {
  Search,
  UserPlus,
  Baby,
  MapPin,
  Sparkles,
  Filter,
  X,
  RefreshCw,
} from 'lucide-react'
import { useChildren, formatAge, ENROLLMENT_STATUSES } from '../hooks/useChildren'
import { useClassrooms } from '../hooks/useClassrooms'
import ChildDetailDrawer from '../components/ChildDetailDrawer'

/**
 * Roster — full student list with search, filters, and click-to-edit.
 *
 * Now that the Google Sheet sync is retired and RLS writes are on,
 * this page is the canonical surface for enrollment CRUD:
 *   • Search by name
 *   • Filter by room + enrollment status
 *   • Click a row → drawer (edit / withdraw)
 *   • "New Enrollment" button → drawer in create mode
 *
 * iPad-first: large tap targets, sticky header, drawer slides in from
 * the right so the list stays visible for context.
 */
export default function RosterPage() {
  const { children, loading, error, refetch } = useChildren()
  const { rooms } = useClassrooms()

  const [search, setSearch] = useState('')
  const [roomFilter, setRoomFilter] = useState('') // '' = all, 'unassigned', or number
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawer, setDrawer] = useState({ open: false, child: null })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return children
      .filter((c) => {
        if (statusFilter !== 'all' && c.enrollmentStatus !== statusFilter) return false
        if (roomFilter === 'unassigned' && c.roomNumber != null) return false
        if (roomFilter && roomFilter !== 'unassigned' && c.roomNumber !== Number(roomFilter)) return false
        if (q && !c.fullName.toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName))
  }, [children, search, roomFilter, statusFilter])

  const totals = useMemo(() => {
    const byStatus = { active: 0, incoming: 0, departing: 0 }
    let unassigned = 0
    for (const c of children) {
      if (byStatus[c.enrollmentStatus] != null) byStatus[c.enrollmentStatus] += 1
      if (c.enrollmentStatus === 'active' && c.roomNumber == null) unassigned += 1
    }
    return { ...byStatus, unassigned, total: children.length }
  }, [children])

  const hasFilters = search || roomFilter || statusFilter !== 'all'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header — brand strip + stats + actions */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                <Baby className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                  Families · Students
                </p>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  Roster
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refetch}
                disabled={loading}
                className="inline-flex items-center gap-1.5 h-11 px-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                title="Refresh from database"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setDrawer({ open: true, child: null })}
                className="inline-flex items-center gap-1.5 h-11 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                <UserPlus className="w-4 h-4" />
                New Enrollment
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label="Active" value={totals.active} accent="indigo" />
            <Stat label="Incoming" value={totals.incoming} accent="emerald" />
            <Stat label="Departing" value={totals.departing} accent="amber" />
            <Stat label="Unassigned" value={totals.unassigned} accent="gray" />
          </div>

          {/* Search + filters */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name…"
                className="w-full h-11 pl-9 pr-3 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              >
                <option value="all">All statuses</option>
                {ENROLLMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                className="h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              >
                <option value="">All rooms</option>
                <option value="unassigned">Unassigned</option>
                {rooms
                  .slice()
                  .sort((a, b) => a.roomNumber - b.roomNumber)
                  .map((r) => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} · {r.teacherName}
                    </option>
                  ))}
              </select>
              {hasFilters && (
                <button
                  onClick={() => {
                    setSearch('')
                    setRoomFilter('')
                    setStatusFilter('all')
                  }}
                  className="h-11 px-3 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg inline-flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading roster…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Baby className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">
              {hasFilters ? 'No matches for those filters.' : 'No children in the roster yet.'}
            </p>
            {!hasFilters && (
              <button
                onClick={() => setDrawer({ open: true, child: null })}
                className="mt-4 inline-flex items-center gap-1.5 h-11 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                <UserPlus className="w-4 h-4" />
                Enroll the first child
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <p className="px-4 py-2 text-[11px] uppercase tracking-wider font-bold text-gray-400 bg-gray-50 border-b border-gray-200 tabular-nums">
              {filtered.length} of {totals.total}
            </p>
            <ul className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <RosterRow
                  key={c.id}
                  child={c}
                  room={
                    c.roomNumber != null
                      ? rooms.find((r) => r.roomNumber === c.roomNumber)
                      : null
                  }
                  onClick={() => setDrawer({ open: true, child: c })}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      <ChildDetailDrawer
        open={drawer.open}
        child={drawer.child}
        rooms={rooms}
        onClose={() => setDrawer({ open: false, child: null })}
        onSaved={() => {
          setDrawer({ open: false, child: null })
          refetch()
        }}
        onWithdrawn={() => {
          setDrawer({ open: false, child: null })
          refetch()
        }}
      />
    </div>
  )
}

function Stat({ label, value, accent }) {
  const styles = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  }
  return (
    <div className={`rounded-lg border px-3 py-2 ${styles[accent]}`}>
      <p className="text-[10px] uppercase tracking-wider font-bold opacity-80">
        {label}
      </p>
      <p className="text-lg font-bold tabular-nums leading-none mt-0.5">{value}</p>
    </div>
  )
}

function RosterRow({ child, room, onClick }) {
  const age = formatAge(child.dateOfBirth)
  const statusStyle = STATUS_STYLES[child.enrollmentStatus] || STATUS_STYLES.active
  return (
    <li>
      <button
        onClick={onClick}
        className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-200 transition"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 truncate flex-1 min-w-[140px]">
            {child.fullName}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full border font-semibold text-[10px] uppercase tracking-wider ${statusStyle}`}
          >
            {child.enrollmentStatus}
          </span>
          {child.onCcms && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-[10px]">
              <Sparkles className="w-2.5 h-2.5" />
              CCMS
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap text-[11px] text-gray-500 mt-1">
          {age && <span className="tabular-nums">{age}</span>}
          {room ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Room {room.roomNumber} · {room.teacherTitle} {room.teacherName}
            </span>
          ) : child.roomNumber != null ? (
            <span className="inline-flex items-center gap-1 text-gray-400">
              <MapPin className="w-3 h-3" />
              Room {child.roomNumber}
            </span>
          ) : (
            <span className="italic text-gray-400">Unassigned</span>
          )}
          {child.enrollmentStatus === 'incoming' && child.startDate && (
            <span className="text-emerald-600 font-semibold">
              Starts {formatShortDate(child.startDate)}
            </span>
          )}
        </div>
      </button>
    </li>
  )
}

const STATUS_STYLES = {
  active: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  incoming: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  departing: 'bg-amber-50 text-amber-700 border-amber-200',
}

function formatShortDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}
