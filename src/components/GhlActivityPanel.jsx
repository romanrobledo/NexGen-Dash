import { useEffect, useState } from 'react'
import {
  Loader2, User, FileText, Tag, Calendar, Link2, ExternalLink,
} from 'lucide-react'
import { useGhlThread } from '../hooks/useGhl'

/**
 * Right-sidebar activity panel — mirrors the GHL contact-activity pane.
 *
 * Shows (whatever the contact's GHL record carries): source, campaign,
 * lead-form name, tags, dateAdded, dateUpdated, link out to the native
 * GHL contact detail. If no contact has been matched by phone yet, the
 * whole panel renders a quiet "not linked" state — no noisy errors.
 *
 * Reuses the useGhlThread hook (it already returns the contact), so
 * this panel and the conversation panel stay in sync and only fire one
 * network call between them.
 */
export default function GhlActivityPanel({ phone, thread }) {
  const own = useGhlThread({ phone, enabled: !!phone && !thread })
  const { contact, loading, error } = thread || own

  if (!phone) {
    return <ShellMessage>No phone on file.</ShellMessage>
  }
  if (loading && !contact) {
    return (
      <Shell>
        <div className="p-4 text-sm text-gray-500 inline-flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading activity…
        </div>
      </Shell>
    )
  }
  if (error) {
    return (
      <Shell>
        <div className="p-4 text-xs text-rose-700">
          GHL unreachable — activity unavailable.
        </div>
      </Shell>
    )
  }
  if (!contact) {
    return <ShellMessage>Not linked to a GHL contact yet. First SMS send will create one.</ShellMessage>
  }

  const created = contact.date_added ? new Date(contact.date_added) : null
  const updated = contact.date_updated ? new Date(contact.date_updated) : null

  // Attribution: GHL stores UTM-ish fields on the contact itself; some
  // workspaces also carry them in customFields. We render whatever
  // top-level attribution exists.
  const firstSource  = contact.source || null
  const latestSource = contact.source || null   // GHL doesn't split by default

  return (
    <Shell>
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
        <div className="text-sm font-semibold text-gray-900">Activity</div>
        <span className="text-[10px] text-gray-500 uppercase tracking-wide">GHL</span>
        {contact.ghl_url && (
          <a href={contact.ghl_url} target="_blank" rel="noreferrer"
             title="Open in GHL"
             className="ml-auto p-1 rounded hover:bg-gray-100 text-gray-500">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="p-4 space-y-3">
        {created && (
          <SectionLabel>
            {created.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
          </SectionLabel>
        )}

        <ActivityCard
          icon={User}
          title="Contact Created"
          rows={[
            contact.source     && { label: 'Source',   value: contact.source },
            contact.type       && { label: 'Type',     value: contact.type },
            contact.company    && { label: 'Company',  value: contact.company },
            contact.owner_name && { label: 'Owner',    value: contact.owner_name },
          ].filter(Boolean)}
          timestamp={created ? `${created.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${created.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : null}
        />

        {contact.tags?.length > 0 && (
          <ActivityCard
            icon={Tag}
            title="Tags"
            body={
              <div className="flex flex-wrap gap-1">
                {contact.tags.map((t, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{t}</span>
                ))}
              </div>
            }
          />
        )}

        {contact.custom_fields?.length > 0 && (
          <ActivityCard
            icon={FileText}
            title="Custom fields"
            body={
              <ul className="text-xs text-gray-700 space-y-0.5">
                {contact.custom_fields.slice(0, 6).map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-semibold text-gray-900">{f.name || f.id}:</span>
                    <span className="min-w-0 truncate">{typeof f.value === 'object' ? JSON.stringify(f.value) : String(f.value ?? '—')}</span>
                  </li>
                ))}
                {contact.custom_fields.length > 6 && (
                  <li className="text-[11px] text-gray-500">+{contact.custom_fields.length - 6} more…</li>
                )}
              </ul>
            }
          />
        )}

        {updated && (
          <ActivityCard
            icon={Calendar}
            title="Last updated"
            body={<div className="text-xs text-gray-700">{updated.toLocaleString()}</div>}
          />
        )}
      </div>

      {(firstSource || latestSource) && (
        <div className="border-t border-gray-100 px-4 py-3 text-xs space-y-1">
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">First attribution source:</span>
            <span className="font-semibold text-gray-900 truncate">{firstSource || '—'}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Latest attribution source:</span>
            <span className="font-semibold text-gray-900 truncate">{latestSource || '—'}</span>
          </div>
        </div>
      )}
    </Shell>
  )
}

function Shell({ children }) {
  return <aside className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">{children}</aside>
}

function ShellMessage({ children }) {
  return (
    <Shell>
      <div className="p-4 text-xs text-gray-500">{children}</div>
    </Shell>
  )
}

function SectionLabel({ children }) {
  return <div className="text-[10px] font-semibold tracking-wider text-gray-500">{children}</div>
}

function ActivityCard({ icon: Icon, title, rows, body, timestamp }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-slate-50/50 p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-indigo-600" />
        <div className="text-xs font-semibold text-gray-900">{title}</div>
      </div>
      {rows && rows.length > 0 && (
        <ul className="text-[11px] text-gray-700 space-y-0.5">
          {rows.map((r, i) => (
            <li key={i} className="bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5">
              <span className="font-semibold text-blue-900">{r.label}:</span> {r.value}
            </li>
          ))}
        </ul>
      )}
      {body}
      {timestamp && <div className="text-[10px] text-gray-500 mt-1.5 text-right">{timestamp}</div>}
    </div>
  )
}
