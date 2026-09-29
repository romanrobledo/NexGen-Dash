import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  UserCircle,
  Plus,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isBooksAdmin } from '../lib/roles'
import { useAvatars } from '../hooks/useAvatars'
import AvatarEditDrawer from '../components/AvatarEditDrawer'

export default function AvatarsListPage() {
  const { staff } = useAuth()
  const admin = isBooksAdmin(staff)
  const [showInactive, setShowInactive] = useState(false)
  const {
    rows, loading, error,
    createAvatar, updateAvatar, deleteAvatar,
  } = useAvatars({ includeInactive: showInactive })
  const [drawer, setDrawer] = useState(null) // {mode:'create'} | {mode:'edit', avatar}

  const sorted = useMemo(
    () => [...rows].sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1
      if (a.position !== b.position) return a.position - b.position
      return a.name.localeCompare(b.name)
    }),
    [rows]
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-indigo-600" />
            Avatars
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Customer personas. One card per avatar — click into a card to read the full profile.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {admin && (
            <label className="text-xs text-gray-600 inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600"
              />
              Show inactive
            </label>
          )}
          {admin && (
            <button
              onClick={() => setDrawer({ mode: 'create' })}
              className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> New avatar
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center text-gray-500 inline-flex items-center justify-center gap-2 w-full">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading avatars…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2 text-sm">{error}</div>
      ) : sorted.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-gray-200">
          <UserCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <div className="text-sm text-gray-600">No avatars yet.</div>
          {admin && (
            <button
              onClick={() => setDrawer({ mode: 'create' })}
              className="mt-3 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Create your first avatar
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sorted.map(a => (
            <Link
              key={a.id}
              to={`/framework/avatars/${a.slug}`}
              className={`group block bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm p-5 transition ${
                a.active ? '' : 'opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <UserCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-gray-900 truncate">{a.name}</h2>
                    {!a.active && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                        Inactive
                      </span>
                    )}
                  </div>
                  {a.subtitle && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.subtitle}</p>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                    <span>{a.pains.length} pains</span>
                    <span>·</span>
                    <span>{a.goals.length} goals</span>
                    <span>·</span>
                    <span>{a.objections.length} objections</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 mt-1 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {drawer && (
        <AvatarEditDrawer
          mode={drawer.mode}
          avatar={drawer.avatar}
          onClose={() => setDrawer(null)}
          onSave={async (values) => {
            if (drawer.mode === 'create') {
              const { error: eErr } = await createAvatar(values)
              return eErr
            }
            const { error: eErr } = await updateAvatar(drawer.avatar.id, values)
            return eErr
          }}
          onDelete={drawer.mode === 'edit' ? async () => {
            const { error: eErr } = await deleteAvatar(drawer.avatar.id)
            return eErr
          } : null}
        />
      )}
    </div>
  )
}
