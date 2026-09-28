import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Search,
  Baby,
  Phone,
  Mail,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useFamilies } from '../hooks/useFamilies'

/**
 * The Families roster — one row per household. Auto-populated from the
 * children table by grouping on surname (see seed-families-autopopulate.mjs).
 *
 * Search matches family name, any guardian name, or any child name.
 * Room filter shows only families with at least one child in the room.
 */
export default function FamiliesListPage() {
  const { families, loading, error } = useFamilies()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [roomFilter, setRoomFilter] = useState('all')

  // Union of every family's room numbers, for the filter dropdown.
  const allRooms = useMemo(() => {
    const rooms = new Set()
    for (const f of families) for (const r of f.roomNumbers) rooms.add(r)
    return [...rooms].sort((a, b) => a - b)
  }, [families])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return families.filter((f) => {
      if (roomFilter !== 'all' && !f.roomNumbers.includes(Number(roomFilter))) {
        return false
      }
      if (!q) return true
      if (f.familyName.toLowerCase().includes(q)) return true
      if (f.guardians.some((g) => `${g.firstName} ${g.lastName}`.toLowerCase().includes(q))) return true
      if (f.children.some((c) => (c.fullName || '').toLowerCase().includes(q))) return true
      return false
    })
  }, [families, search, roomFilter])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Header total={families.length} shown={filtered.length} />
      <Toolbar
        search={search}
        onSearch={setSearch}
        roomFilter={roomFilter}
        onRoomFilter={setRoomFilter}
        rooms={allRooms}
      />
      {filtered.length === 0 ? (
        <EmptyState hasFilters={!!search || roomFilter !== 'all'} />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <Th>Family</Th>
                <Th>Children</Th>
                <Th>Primary Guardian</Th>
                <Th>Rooms</Th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <FamilyRow
                  key={f.id}
                  family={f}
                  onClick={() => navigate(`/families/${f.id}`)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Header({ total, shown }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Families
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {shown === total
            ? `${total} household${total === 1 ? '' : 's'}`
            : `${shown} of ${total} household${total === 1 ? '' : 's'}`}
        </p>
      </div>
    </div>
  )
}

function Toolbar({ search, onSearch, roomFilter, onRoomFilter, rooms }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search family, guardian, or child…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
        />
      </div>
      <select
        value={roomFilter}
        onChange={(e) => onRoomFilter(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none min-w-[140px]"
      >
        <option value="all">All rooms</option>
        {rooms.map((r) => (
          <option key={r} value={r}>Room {r}</option>
        ))}
      </select>
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

function FamilyRow({ family, onClick }) {
  const kids = family.children
  const g = family.primaryGuardian
  return (
    <tr
      onClick={onClick}
      className="border-b border-gray-100 last:border-b-0 hover:bg-blue-50/50 cursor-pointer transition-colors"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
            {family.familyName?.[0] || '·'}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {family.familyName}
            </div>
            {family.notes && (
              <div className="text-xs text-gray-500 truncate max-w-xs">
                {family.notes}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm text-gray-700">
          <Baby className="w-3.5 h-3.5 text-gray-400" />
          <span>{kids.length}</span>
          {kids.length > 0 && (
            <span className="text-xs text-gray-500 truncate max-w-[200px]">
              — {kids.map((k) => k.fullName?.split(',').pop()?.trim() || k.fullName).join(', ')}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        {g ? (
          <div className="space-y-0.5">
            <div className="text-sm text-gray-900">
              {g.firstName} {g.lastName}
              {g.relationship && (
                <span className="text-xs text-gray-500 ml-1">({g.relationship})</span>
              )}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              {g.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {g.phone}
                </span>
              )}
              {g.email && (
                <span className="flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3" />
                  {g.email}
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">No guardian yet</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {family.roomNumbers.length === 0 ? (
            <span className="text-xs text-gray-400 italic">—</span>
          ) : (
            family.roomNumbers.map((r) => (
              <span
                key={r}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700"
              >
                {r}
              </span>
            ))
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </td>
    </tr>
  )
}

function LoadingState() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      <span className="ml-3 text-sm text-gray-500">Loading families…</span>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-800">Failed to load families</p>
          <p className="text-xs text-red-600 mt-1">{message}</p>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ hasFilters }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-16 text-center">
      <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-600 font-semibold">
        {hasFilters ? 'No families match those filters.' : 'No families yet.'}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        {hasFilters
          ? 'Try clearing the search or room filter.'
          : 'Run the auto-populate seed script to create families from the current children roster.'}
      </p>
    </div>
  )
}
