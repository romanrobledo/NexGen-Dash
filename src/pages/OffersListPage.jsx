import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tag, Plus, Loader2, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isBooksAdmin } from '../lib/roles'
import { useOffers } from '../hooks/useOffers'
import OfferEditDrawer from '../components/OfferEditDrawer'

export default function OffersListPage() {
  const { staff } = useAuth()
  const admin = isBooksAdmin(staff)
  const [showInactive, setShowInactive] = useState(false)
  const {
    rows, loading, error,
    createOffer, updateOffer, deleteOffer,
  } = useOffers({ includeInactive: showInactive })
  const [drawer, setDrawer] = useState(null)

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
            <Tag className="w-6 h-6 text-indigo-600" />
            Offers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Full offer pages — Founding Partner, Free Goodwill, Attraction, etc. Click into an offer for the full pitch.
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
              <Plus className="w-4 h-4" /> New offer
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center text-gray-500 inline-flex items-center justify-center gap-2 w-full">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading offers…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2 text-sm">{error}</div>
      ) : sorted.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-gray-200">
          <Tag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <div className="text-sm text-gray-600">No offers yet.</div>
          {admin && (
            <button
              onClick={() => setDrawer({ mode: 'create' })}
              className="mt-3 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Create your first offer
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sorted.map(o => (
            <Link
              key={o.id}
              to={`/framework/offers/${o.slug}`}
              className={`group block bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm p-5 transition ${
                o.active ? '' : 'opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-gray-900">{o.name}</h2>
                  {o.subtitle && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{o.subtitle}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {o.priceHeadline && (
                      <span className="text-sm font-bold text-gray-900">{o.priceHeadline}</span>
                    )}
                    {o.priceNote && (
                      <span className="text-xs text-gray-500">{o.priceNote}</span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {o.sections.length} section{o.sections.length === 1 ? '' : 's'}
                  </div>
                  {!o.active && (
                    <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                      Inactive
                    </span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 mt-1 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {drawer && (
        <OfferEditDrawer
          mode={drawer.mode}
          offer={drawer.offer}
          onClose={() => setDrawer(null)}
          onSave={async (values) => {
            if (drawer.mode === 'create') {
              const { error: eErr } = await createOffer(values)
              return eErr
            }
            const { error: eErr } = await updateOffer(drawer.offer.id, values)
            return eErr
          }}
          onDelete={drawer.mode === 'edit' ? async () => {
            const { error: eErr } = await deleteOffer(drawer.offer.id)
            return eErr
          } : null}
        />
      )}
    </div>
  )
}
