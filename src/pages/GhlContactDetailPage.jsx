import { Link, useParams } from 'react-router-dom'
import {
  ChevronLeft, Loader2, Phone, Mail, Tag, User, ExternalLink,
  AlertCircle,
} from 'lucide-react'
import { useGhlContact, useGhlThread } from '../hooks/useGhl'
import GhlConversationPanel from '../components/GhlConversationPanel'
import GhlActivityPanel from '../components/GhlActivityPanel'

/**
 * Single GHL contact page — same 2-column layout as the Family
 * Communications tab, but driven by a GHL contactId directly rather
 * than a Family's primary guardian.
 *
 * Fetches the contact once (useGhlContact), then uses its phone to
 * feed the shared useGhlThread hook — the conversation + activity
 * panels read from the same thread fetch so only one GHL message call
 * fires per page load.
 */
export default function GhlContactDetailPage() {
  const { id } = useParams()
  const { contact, loading, error } = useGhlContact({ id })
  // Shared thread fetch feeds both panels.
  const thread = useGhlThread({ phone: contact?.phone, enabled: !!contact?.phone })

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-center text-gray-500 inline-flex items-center justify-center gap-2 w-full">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading contact…
      </div>
    )
  }
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Link to="/families/contacts" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2">
          <ChevronLeft className="w-4 h-4" /> Contacts
        </Link>
        <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2 text-sm inline-flex items-start gap-1.5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>GHL unreachable: {error}</span>
        </div>
      </div>
    )
  }
  if (!contact) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-center">
        <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <div className="text-sm text-gray-700">No GHL contact with id <code className="text-gray-900">{id}</code>.</div>
        <Link to="/families/contacts" className="mt-3 inline-flex items-center gap-1 text-sm text-indigo-700 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to contacts
        </Link>
      </div>
    )
  }

  const toName = contact.name || contact.phone || contact.email || '(unnamed)'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <Link to="/families/contacts" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4" /> Contacts
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-5">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
            {(contact.name || '·').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || '·'}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{toName}</h1>
            <div className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              {contact.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {contact.phone}
                </span>
              )}
              {contact.email && (
                <span className="inline-flex items-center gap-1 truncate max-w-xs">
                  <Mail className="w-3.5 h-3.5" />
                  {contact.email}
                </span>
              )}
              {contact.type && <span className="text-gray-400">· {contact.type}</span>}
            </div>
            {(contact.tags || []).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {contact.tags.map((t, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 inline-flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          {contact.ghl_url && (
            <a
              href={contact.ghl_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 text-sm font-semibold text-gray-800"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in GHL
            </a>
          )}
        </div>
      </div>

      {!contact.phone && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2 text-sm inline-flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>No phone on this GHL contact — thread and SMS send are unavailable.</div>
        </div>
      )}

      {/* Conversation + Activity — same layout as Family Communications tab */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
        <GhlConversationPanel
          phone={contact.phone}
          toName={toName}
          thread={thread}
        />
        <GhlActivityPanel phone={contact.phone} thread={thread} />
      </div>
    </div>
  )
}
