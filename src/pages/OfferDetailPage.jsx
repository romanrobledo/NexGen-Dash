import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Pencil, Loader2, Tag } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isBooksAdmin } from '../lib/roles'
import { useOffers } from '../hooks/useOffers'
import OfferSectionRenderer from '../components/OfferSectionRenderer'
import OfferEditDrawer from '../components/OfferEditDrawer'

export default function OfferDetailPage() {
  const { slug } = useParams()
  const { staff } = useAuth()
  const admin = isBooksAdmin(staff)
  const { loading, error, updateOffer, deleteOffer, bySlug } = useOffers({ includeInactive: true })
  const [editing, setEditing] = useState(false)

  const offer = bySlug(slug)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center text-gray-500 inline-flex items-center justify-center gap-2 w-full">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading offer…
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
  if (!offer) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center">
        <Tag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <div className="text-sm text-gray-700">No offer with slug <code className="text-gray-900">{slug}</code>.</div>
        <Link to="/framework/offers" className="mt-3 inline-flex items-center gap-1 text-sm text-indigo-700 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to offers
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/framework/offers"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4" /> All offers
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

      <header className="flex items-start justify-between gap-6 flex-wrap">
        <div className="min-w-0 max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight leading-tight">{offer.name}</h1>
          {offer.subtitle && (
            <p className="text-base text-gray-600 mt-2 leading-relaxed">{offer.subtitle}</p>
          )}
          {!offer.active && (
            <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
              Inactive
            </span>
          )}
        </div>
        {(offer.priceHeadline || offer.priceNote) && (
          <div className="text-right shrink-0">
            {offer.priceHeadline && (
              <div className="text-4xl font-bold text-gray-900 tracking-tight leading-none">
                {offer.priceHeadline}
              </div>
            )}
            {offer.priceNote && (
              <div className="text-sm text-gray-500 mt-1 max-w-xs">{offer.priceNote}</div>
            )}
          </div>
        )}
      </header>

      {offer.summary && (
        <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap max-w-3xl">
          {offer.summary}
        </p>
      )}

      <div className="space-y-4">
        {offer.sections.map((s, i) => (
          <OfferSectionRenderer key={i} section={s} />
        ))}
      </div>

      {editing && (
        <OfferEditDrawer
          mode="edit"
          offer={offer}
          onClose={() => setEditing(false)}
          onSave={async (values) => {
            const { error: eErr } = await updateOffer(offer.id, values)
            return eErr
          }}
          onDelete={async () => {
            const { error: eErr } = await deleteOffer(offer.id)
            return eErr
          }}
        />
      )}
    </div>
  )
}
