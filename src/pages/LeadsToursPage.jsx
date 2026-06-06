import { useState, useMemo } from 'react'
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  UserPlus,
  Phone,
  Mail,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { useLeadsData } from '../hooks/useLeadsData'

/**
 * Leads → Tours
 *
 * Operational list of all tours — upcoming, completed, cancelled. Uses the
 * shared `useLeadsData` hook so numbers line up with both the Leads Dashboard
 * and the Marketing Dashboard.
 */

const FILTER_TABS = [
  { key: 'upcoming',  label: 'Upcoming'  },
  { key: 'past',      label: 'Past'      },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'all',       label: 'All'       },
]

function StatusBadge({ status }) {
  const s = (status || 'scheduled').toLowerCase()
  const palette = {
    scheduled: { bg: 'bg-blue-50',    text: 'text-blue-600'    },
    confirmed: { bg: 'bg-indigo-50',  text: 'text-indigo-600'  },
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    cancelled: { bg: 'bg-red-50',     text: 'text-red-600'     },
    no_show:   { bg: 'bg-gray-100',   text: 'text-gray-500'    },
  }
  const p = palette[s] || palette.scheduled
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${p.bg} ${p.text}`}>
      {s.replace('_', ' ')}
    </span>
  )
}

export default function LeadsToursPage() {
  const { mobileMode } = useViewMode()
  const { tours, loading } = useLeadsData()
  const [filter, setFilter] = useState('upcoming')
  const [query, setQuery] = useState('')

  const now = new Date()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tours
      .filter((t) => {
        const status = (t.status || 'scheduled').toLowerCase()
        const when = t.scheduled_at ? new Date(t.scheduled_at) : null

        if (filter === 'upcoming') {
          if (status === 'cancelled') return false
          return when && when >= now
        }
        if (filter === 'past') {
          if (status === 'cancelled') return false
          return when && when < now
        }
        if (filter === 'cancelled') return status === 'cancelled'
        return true
      })
      .filter((t) => {
        if (!q) return true
        const name =
          t.guardian_name ||
          t.name ||
          [t.first_name, t.last_name].filter(Boolean).join(' ') ||
          ''
        return (
          name.toLowerCase().includes(q) ||
          (t.email || '').toLowerCase().includes(q) ||
          (t.phone || '').toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        const da = a.scheduled_at ? new Date(a.scheduled_at).getTime() : 0
        const db = b.scheduled_at ? new Date(b.scheduled_at).getTime() : 0
        // Upcoming: soonest first; everything else: most recent first
        return filter === 'upcoming' ? da - db : db - da
      })
  }, [tours, filter, query, now])

  // Quick metric counts for the strip.
  const counts = useMemo(() => {
    const c = { upcoming: 0, past: 0, cancelled: 0, completed: 0 }
    for (const t of tours) {
      const status = (t.status || 'scheduled').toLowerCase()
      const when = t.scheduled_at ? new Date(t.scheduled_at) : null
      if (status === 'cancelled') c.cancelled++
      else if (status === 'completed') c.completed++
      else if (when && when >= now) c.upcoming++
      else if (when && when < now) c.past++
    }
    return c
  }, [tours, now])

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Tours</h2>
            <p className="text-gray-500 mt-0.5 text-sm">
              Scheduled visits, walk-ins, and follow-ups for prospective families.
            </p>
          </div>
        </div>
        <button className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          Book Tour
        </button>
      </div>

      {/* Count strip */}
      <div className={`grid gap-4 mb-6 ${mobileMode ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'}`}>
        <CountTile label="Upcoming"  value={counts.upcoming}  icon={Clock}        accent="blue" />
        <CountTile label="Completed" value={counts.completed} icon={CheckCircle2} accent="emerald" />
        <CountTile label="Past"      value={counts.past}      icon={Calendar}     accent="indigo" />
        <CountTile label="Cancelled" value={counts.cancelled} icon={XCircle}      accent="red" />
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-1 sm:flex-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, phone…"
            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Loading tours...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 px-6">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-700">No tours match this view</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Tours booked via the lead intake form will appear here grouped by status.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((t) => {
              const when = t.scheduled_at ? new Date(t.scheduled_at) : null
              const name =
                t.guardian_name ||
                t.name ||
                [t.first_name, t.last_name].filter(Boolean).join(' ') ||
                'Tour'
              return (
                <div key={t.id || `${name}-${t.scheduled_at}`} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <UserPlus className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                      {when && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {when.toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric',
                          })}
                          {' · '}
                          {when.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      )}
                      {t.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {t.phone}
                        </span>
                      )}
                      {t.email && (
                        <span className="inline-flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{t.email}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="mt-6 bg-indigo-50/60 border border-indigo-100 border-l-4 border-l-indigo-500 rounded-xl p-4 flex gap-3">
        <Calendar className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600">
          <p className="font-semibold text-indigo-700 uppercase tracking-wider text-[10px] mb-1">
            Heads up
          </p>
          <p>
            Tours read from the <code className="bg-white px-1 rounded text-[11px]">tours</code> table and share the
            same counts shown on the Leads and Marketing dashboards.
          </p>
        </div>
      </div>
    </div>
  )
}

function CountTile({ label, value, icon: Icon, accent = 'blue' }) {
  const accents = {
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600'    },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600'  },
    red:     { bg: 'bg-red-50',     text: 'text-red-600'     },
  }
  const a = accents[accent] || accents.blue
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className={`w-9 h-9 rounded-lg ${a.bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-4.5 h-4.5 ${a.text}`} />
      </div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
