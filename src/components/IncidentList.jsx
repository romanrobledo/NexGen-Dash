import { Loader2, AlertCircle, Clock } from 'lucide-react'

const SEVERITY_TONES = {
  info:     'bg-gray-100 text-gray-700',
  minor:    'bg-blue-100 text-blue-800',
  serious:  'bg-amber-100 text-amber-800',
  critical: 'bg-rose-100 text-rose-800',
}

/**
 * Reverse-chron list of recent incidents in a given scope.
 */
export default function IncidentList({ hook, scope }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Recent (last 30 days)</h3>
        <span className="text-xs text-gray-500">{hook.rows.length}</span>
      </div>
      {hook.loading ? (
        <div className="p-6 text-center text-sm text-gray-500 inline-flex items-center justify-center gap-2 w-full">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : hook.error ? (
        <div className="p-4 text-sm text-rose-700">{hook.error}</div>
      ) : hook.rows.length === 0 ? (
        <div className="p-10 text-center">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <div className="text-sm text-gray-600">No {scope} incidents logged.</div>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {hook.rows.map(r => (
            <li key={r.id} className="px-5 py-3 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${SEVERITY_TONES[r.severity] || SEVERITY_TONES.info}`}>
                  {r.severity}
                </span>
                {r.childName && (
                  <span className="text-xs text-gray-700">
                    Child: <b>{r.childName}</b>
                  </span>
                )}
                {r.parentName && (
                  <span className="text-xs text-gray-700">
                    Parent: <b>{r.parentName}</b>
                  </span>
                )}
                {r.roomNumber != null && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">Room {r.roomNumber}</span>
                )}
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">{r.description}</div>
              <div className="text-[11px] text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(r.reportedAt).toLocaleString()}
                {r.reportedByName && <> · {r.reportedByName}</>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
