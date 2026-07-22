import { useEffect } from 'react'
import {
  X,
  LogIn,
  LogOut,
  UsersRound,
  Sparkles,
  Calendar,
  MapPin,
} from 'lucide-react'
import { formatAge } from '../hooks/useChildren'
// (touched to bust stale Vite HMR cache after Alumni→Active rename)

/**
 * Right-side slide-in listing kids in the selected enrollment cohort:
 * Active, Incoming, or Departing. The classroom tiles show Active kids
 * broken down by room; this drawer's Active view is the alphabetical
 * full-roster snapshot.
 *
 * Read-only. Data comes from the Sheet via n8n and is not mutable here —
 * to move a kid between cohorts, the office edits the Sheet and waits for
 * the next sync. Keeps this drawer simple and prevents split-brain state.
 * Alumni are tracked in a separate "Alumni" sheet on the office side, not
 * in the app.
 */

const COHORT_META = {
  active: {
    label: 'Active',
    subtitle: 'Currently enrolled — full roster, alphabetical',
    icon: UsersRound,
    accent: 'indigo',
    empty: 'No active kids yet.',
  },
  incoming: {
    label: 'Incoming',
    subtitle: 'Kids enrolled to start soon',
    icon: LogIn,
    accent: 'emerald',
    empty: 'No incoming kids right now.',
  },
  departing: {
    label: 'Departing',
    subtitle: 'Kids leaving at the end of the current period',
    icon: LogOut,
    accent: 'amber',
    empty: 'No departing kids right now.',
  },
}

const ACCENT_CLASSES = {
  indigo: {
    icon: 'bg-indigo-100 text-indigo-700',
    strip: 'bg-indigo-50 border-indigo-100 text-indigo-800',
    chip: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  emerald: {
    icon: 'bg-emerald-100 text-emerald-700',
    strip: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-700',
    strip: 'bg-amber-50 border-amber-100 text-amber-800',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
  },
}

/**
 * @param {{
 *   cohort: 'active' | 'incoming' | 'departing' | null,
 *   kids: import('../hooks/useChildren').Child[],
 *   rooms?: import('../hooks/useClassrooms').Room[],
 *   onClose: () => void,
 * }} props
 */
export default function CohortDrawer({ cohort, kids, rooms = [], onClose }) {
  // ESC to close — matches the room drawer's affordance.
  useEffect(() => {
    if (!cohort) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [cohort, onClose])

  if (!cohort) return null

  const meta = COHORT_META[cohort]
  const accent = ACCENT_CLASSES[meta.accent]
  const Icon = meta.icon
  const roomByNumber = new Map(rooms.map((r) => [r.roomNumber, r]))

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col"
        role="dialog"
        aria-label={`${meta.label} roster`}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-200">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent.icon}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
              Roster cohort
            </p>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {meta.label}{' '}
              <span className="text-gray-400 tabular-nums font-semibold">
                ({kids.length})
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{meta.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-only nudge */}
        <div className={`px-5 py-2.5 border-b border-gray-200 text-[11px] italic ${accent.strip}`}>
          Read-only · edit the Google Sheet's{' '}
          <strong className="not-italic font-semibold">Enrollment Status</strong>{' '}
          column to move a kid between cohorts. Changes appear here after the
          next sync.
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {kids.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-8 text-center">
              {meta.empty}
            </p>
          ) : (
            <ul className="space-y-2">
              {kids.map((k) => (
                <CohortRow
                  key={k.id}
                  child={k}
                  cohort={cohort}
                  chipClass={accent.chip}
                  room={
                    k.roomNumber != null ? roomByNumber.get(k.roomNumber) : null
                  }
                />
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}

function CohortRow({ child, cohort, chipClass, room }) {
  const age = formatAge(child.dateOfBirth)
  return (
    <li className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 flex flex-col gap-1">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold text-gray-900 truncate flex-1 min-w-0">
          {child.fullName}
        </span>
        {child.onCcms && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-[10px]">
            <Sparkles className="w-2.5 h-2.5" />
            CCMS
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 flex-wrap text-[11px] text-gray-500">
        {age && <span className="tabular-nums">{age}</span>}
        {room && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Room {room.roomNumber} · {room.teacherTitle} {room.teacherName}
          </span>
        )}
        {!room && child.roomNumber != null && (
          <span className="inline-flex items-center gap-1 text-gray-400">
            <MapPin className="w-3 h-3" />
            Room {child.roomNumber}
          </span>
        )}
        {cohort === 'incoming' && child.startDate && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-semibold ${chipClass}`}>
            <Calendar className="w-3 h-3" />
            Starts {formatShortDate(child.startDate)}
          </span>
        )}
        {cohort === 'incoming' && !child.startDate && (
          <span className="text-gray-400 italic">Start date not set</span>
        )}
      </div>
      {child.remarks && (
        <p className="text-[11px] text-gray-500 italic mt-0.5">
          {child.remarks}
        </p>
      )}
    </li>
  )
}

function formatShortDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}
