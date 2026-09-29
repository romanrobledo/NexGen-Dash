import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  UserCircle,
  ChevronLeft,
  Pencil,
  Loader2,
  BadgeInfo,
  Flame,
  Target,
  MessageCircleWarning,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isBooksAdmin } from '../lib/roles'
import { useAvatars } from '../hooks/useAvatars'
import AvatarEditDrawer from '../components/AvatarEditDrawer'

export default function AvatarDetailPage() {
  const { slug } = useParams()
  const { staff } = useAuth()
  const admin = isBooksAdmin(staff)
  const { rows, loading, error, updateAvatar, deleteAvatar, bySlug } = useAvatars({ includeInactive: true })
  const [editing, setEditing] = useState(false)

  const avatar = bySlug(slug)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center text-gray-500 inline-flex items-center justify-center gap-2 w-full">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading avatar…
      </div>
    )
  }
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2 text-sm">{error}</div>
      </div>
    )
  }
  if (!avatar) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center">
        <UserCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <div className="text-sm text-gray-700">No avatar with slug <code className="text-gray-900">{slug}</code>.</div>
        <Link to="/framework/avatars" className="mt-3 inline-flex items-center gap-1 text-sm text-indigo-700 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to avatars
        </Link>
        <div className="mt-2 text-[11px] text-gray-400">{rows.length} avatars loaded</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/framework/avatars"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4" /> All avatars
        </Link>
        {admin && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 text-sm font-semibold text-gray-800"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
        )}
      </div>

      <header>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{avatar.name}</h1>
        {avatar.subtitle && (
          <p className="text-base text-gray-600 mt-1">{avatar.subtitle}</p>
        )}
        {!avatar.active && (
          <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
            Inactive
          </span>
        )}
      </header>

      {avatar.summary && (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Avatar Profile</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{avatar.summary}</p>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IdentityCard rows={avatar.identity} />
        <ListCard
          eyebrow="Pain Points"
          heading={`What keeps ${firstNameOf(avatar.name)} up at night?`}
          items={avatar.pains}
          icon={Flame}
          tone="rose"
        />
        <ListCard
          eyebrow="Goals"
          heading={`What does ${firstNameOf(avatar.name)} want?`}
          items={avatar.goals}
          icon={Target}
          tone="emerald"
        />
        <ListCard
          eyebrow="Objections"
          heading={`Why ${firstNameOf(avatar.name)} hesitates`}
          items={avatar.objections}
          icon={MessageCircleWarning}
          tone="amber"
        />
      </div>

      {editing && (
        <AvatarEditDrawer
          mode="edit"
          avatar={avatar}
          onClose={() => setEditing(false)}
          onSave={async (values) => {
            const { error: eErr } = await updateAvatar(avatar.id, values)
            return eErr
          }}
          onDelete={async () => {
            const { error: eErr } = await deleteAvatar(avatar.id)
            return eErr
          }}
        />
      )}
    </div>
  )
}

function firstNameOf(name) {
  const [first] = String(name || '').split(/\s+/)
  return first || 'they'
}

function IdentityCard({ rows }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-2">
        <BadgeInfo className="w-4 h-4 text-indigo-600" />
        <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Identity</div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">Who are they?</h3>
      {rows.length === 0 ? (
        <div className="text-sm text-gray-500 italic">No identity details yet.</div>
      ) : (
        <dl className="space-y-1.5 text-sm">
          {rows.map((r, i) => (
            <div key={i} className="flex gap-2">
              <dt className="font-semibold text-gray-900 shrink-0">{r.label}:</dt>
              <dd className="text-gray-700 min-w-0">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}

const TONES = {
  rose:    { chip: 'bg-rose-50 text-rose-700',       icon: 'text-rose-600' },
  emerald: { chip: 'bg-emerald-50 text-emerald-700', icon: 'text-emerald-600' },
  amber:   { chip: 'bg-amber-50 text-amber-700',     icon: 'text-amber-600' },
}

function ListCard({ eyebrow, heading, items, icon: Icon, tone }) {
  const T = TONES[tone] || TONES.rose
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${T.icon}`} />
        <div className={`text-[11px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${T.chip}`}>{eyebrow}</div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">{heading}</h3>
      {items.length === 0 ? (
        <div className="text-sm text-gray-500 italic">Nothing here yet.</div>
      ) : (
        <ul className="space-y-1.5 text-sm text-gray-700">
          {items.map((line, i) => (
            <li key={i} className="whitespace-pre-wrap">{line}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
