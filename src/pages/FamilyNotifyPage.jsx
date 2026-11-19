import { useMemo, useState } from 'react'
import {
  Megaphone, Users, Loader2, Send, AlertCircle, CheckCircle2, Tag,
  UserCircle, Baby,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isBooksAdmin } from '../lib/roles'
import { useGhlContacts, fireNotifyBlast } from '../hooks/useGhl'

/**
 * Notify — bulk SMS to a GHL audience.
 *
 * Sends happen via the GHL workflow webhook (POST once, GHL fans out
 * with its own Wait-between-sends step). Our end just shows the
 * audience preview + lets Roman compose the message.
 *
 * Audience modes:
 *   - Staff           → preset tag (configurable per-send)
 *   - Enrolled Parents → preset tag defaulting to "nexgen parent"
 *   - Custom          → free-text tag or Smart List name
 *
 * Because GHL handles the fan-out, we don't need per-recipient
 * checkboxes — the audience is "everyone in GHL with this tag".
 * The preview list is informational.
 */
const PRESETS = {
  staff:    { id: 'staff',    label: 'Staff',           tag: 'staff',          icon: UserCircle, tone: 'indigo' },
  enrolled: { id: 'enrolled', label: 'Enrolled Parents', tag: 'nexgen parent', icon: Baby,       tone: 'emerald' },
}

export default function FamilyNotifyPage() {
  const { staff } = useAuth()
  const admin = isBooksAdmin(staff)

  const [preset, setPreset] = useState('enrolled')
  const [customTag, setCustomTag] = useState('')
  const [search, setSearch] = useState('')

  // The effective tag that drives both the audience preview and the webhook.
  const activeTag = preset === 'custom' ? customTag.trim() : PRESETS[preset].tag
  const audienceLabel = preset === 'custom' ? (customTag.trim() || 'Custom') : PRESETS[preset].label

  const contacts = useGhlContacts({ tag: activeTag || null, enabled: !!activeTag })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return contacts.rows
    return contacts.rows.filter(c =>
      [c.name, c.phone, c.email].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    )
  }, [contacts.rows, search])

  const withPhone    = contacts.rows.filter(c => c.phone).length
  const withoutPhone = contacts.rows.length - withPhone

  const [message, setMessage] = useState('')
  const [throttleSeconds, setThrottleSeconds] = useState(30)
  const [sending, setSending] = useState(false)
  const [result,  setResult]  = useState(null)
  const [confirming, setConfirming] = useState(false)

  async function doSend() {
    if (!activeTag || !message.trim()) return
    setSending(true); setResult(null)
    const senderName = staff?.full_name || null
    const r = await fireNotifyBlast({
      tag: activeTag,
      message: message.trim(),
      throttleSeconds,
      audienceKey: preset,       // 'staff' | 'enrolled' | 'custom'
      audienceLabel,
      senderName,
    })
    setSending(false); setConfirming(false)
    setResult(r)
    if (r.ok) setMessage('')
  }

  // Estimated completion time at current throttle
  const etaSeconds = withPhone > 0 ? (withPhone - 1) * throttleSeconds : 0
  const etaLabel = etaSeconds < 60
    ? `${etaSeconds}s`
    : etaSeconds < 3600
      ? `${Math.round(etaSeconds / 60)}m`
      : `${(etaSeconds / 3600).toFixed(1)}h`

  if (!admin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 text-center text-sm text-gray-500">
        Notify is admin-only.
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header — Notify moved under Conversations on 2026-11-18, so no
          breadcrumb back-link to Families; sidebar provides the context. */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-blue-600" />
          Notify
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Bulk SMS a GHL audience. We fan out one webhook per contact with a staggered delay, GHL waits per its instance then sends. Carriers see one SMS every N seconds instead of a burst.
        </p>
      </div>

      {/* Audience toggle — Staff | Enrolled Parents | Custom */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Audience</div>

        <div className="flex gap-2 flex-wrap">
          <PresetBtn active={preset === 'staff'}    onClick={() => setPreset('staff')}
            icon={UserCircle} label="Staff" />
          <PresetBtn active={preset === 'enrolled'} onClick={() => setPreset('enrolled')}
            icon={Baby} label="Enrolled Parents" />
          <PresetBtn active={preset === 'custom'}   onClick={() => setPreset('custom')}
            icon={Tag} label="Custom tag" />
        </div>

        {preset === 'custom' && (
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Tag</label>
            <input
              value={customTag}
              onChange={e => setCustomTag(e.target.value)}
              placeholder="hot lead"
              className="w-60 h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              GHL will blast every contact carrying this exact tag.
            </p>
          </div>
        )}

        {preset !== 'custom' && (
          <p className="text-[11px] text-gray-500">
            Default tag: <code className="px-1 py-0.5 rounded bg-gray-100">{PRESETS[preset].tag}</code>
            <span className="text-gray-400"> · change this in-page by editing the preset in code, or use Custom tag for one-offs.</span>
          </p>
        )}
      </section>

      {/* Recipients preview — read-only, just shows who'll be hit */}
      {activeTag && (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-gray-900">
                {contacts.loading ? 'Loading…' : `${withPhone} recipient${withPhone === 1 ? '' : 's'}`}
              </span>
              {!contacts.loading && filtered.length !== contacts.rows.length && (
                <span className="text-xs text-gray-500">({filtered.length} shown · {contacts.rows.length} with tag)</span>
              )}
              {withoutPhone > 0 && (
                <span className="text-xs text-amber-700">· {withoutPhone} skipped (no phone)</span>
              )}
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter preview by name / phone / email"
              className="w-60 h-8 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <RecipientPreview loading={contacts.loading} error={contacts.error} rows={filtered} />
        </section>
      )}

      {/* Composer */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Message</div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={5}
          maxLength={1000}
          placeholder="Hi {name} — quick note from NexGen…"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="text-[11px] text-gray-500 text-right">{message.length} / 1000</div>

        {/* Throttle picker */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Wait between sends</div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Spacing between individual SMS so carriers don't flag as spam.
                {withPhone > 0 && (
                  <> Full audience done in <b className="text-gray-700">~{etaLabel}</b>.</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {[5, 15, 30, 60, 120].map(n => (
                <button key={n}
                  onClick={() => setThrottleSeconds(n)}
                  className={`h-8 px-2.5 rounded-lg text-xs font-semibold border ${
                    throttleSeconds === n
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {n < 60 ? `${n}s` : `${n / 60}m`}
                </button>
              ))}
              <input
                type="number"
                min={0}
                max={3600}
                value={throttleSeconds}
                onChange={e => setThrottleSeconds(Math.max(0, Number(e.target.value) || 0))}
                className="w-16 h-8 rounded-lg border border-gray-200 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Custom seconds"
              />
            </div>
          </div>
        </div>

        {result && !result.ok && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2 text-sm inline-flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              {result.error}
              {/webhook/i.test(result.error || '') && (
                <div className="text-rose-600 mt-0.5 text-xs">
                  Is <code>GHL_NOTIFY_WEBHOOK_URL</code> set in Vercel, and is the GHL workflow published?
                </div>
              )}
            </div>
          </div>
        )}
        {result && result.ok && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm inline-flex items-start gap-1.5">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <b>Queued {result.queued} message{result.queued === 1 ? '' : 's'} in GHL.</b>{' '}
              The last send goes out in about{' '}
              <b>{formatEta(result.lastSendEtaSeconds)}</b>.
              {result.skippedNoPhone > 0 && <> {result.skippedNoPhone} contact{result.skippedNoPhone === 1 ? '' : 's'} skipped (no phone).</>}
              {result.failed > 0 && <> {result.failed} webhook fire{result.failed === 1 ? '' : 's'} failed — check Vercel logs.</>}
            </div>
          </div>
        )}

        {!confirming ? (
          <div className="flex justify-end">
            <button
              onClick={() => setConfirming(true)}
              disabled={sending || !activeTag || !message.trim() || withPhone === 0}
              className="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Review & send
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
            <div className="text-sm text-amber-900">
              Fire this to <b>{withPhone}</b> contact{withPhone === 1 ? '' : 's'} tagged <code className="px-1 py-0.5 rounded bg-white border border-amber-300">{activeTag}</code>?{' '}
              Last message goes out in about <b>{etaLabel}</b> at {throttleSeconds}s spacing. Once queued in GHL, workflow instances cannot be cancelled mid-drip.
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="h-8 px-3 rounded-lg text-sm text-gray-700 hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={doSend}
                disabled={sending}
                className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Yes, fire {withPhone} webhook{withPhone === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function formatEta(seconds) {
  if (!seconds || seconds <= 0) return 'a few seconds'
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  return `${(seconds / 3600).toFixed(1)}h`
}

function PresetBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm border ${
        active
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  )
}

function RecipientPreview({ loading, error, rows }) {
  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-gray-500 inline-flex items-center justify-center gap-2 w-full">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading recipients…
      </div>
    )
  }
  if (error) return <div className="p-4 text-sm text-rose-700">{error}</div>
  if (!rows.length) {
    return <div className="p-6 text-center text-sm text-gray-500">No contacts match.</div>
  }
  return (
    <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
      {rows.map(c => {
        const noPhone = !c.phone
        return (
          <li key={c.id} className="px-5 py-2 flex items-center gap-3 text-sm">
            <div className="min-w-0 flex-1">
              <div className={`font-medium ${noPhone ? 'text-gray-400' : 'text-gray-900'}`}>
                {c.name || '(no name)'}
              </div>
              <div className="text-xs text-gray-500">
                {c.phone || <span className="text-amber-700">no phone — GHL will skip</span>}
                {c.email && ` · ${c.email}`}
              </div>
            </div>
            {c.tags?.length > 0 && (
              <div className="hidden sm:flex items-center gap-1 flex-wrap">
                {c.tags.slice(0, 3).map((t, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{t}</span>
                ))}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
