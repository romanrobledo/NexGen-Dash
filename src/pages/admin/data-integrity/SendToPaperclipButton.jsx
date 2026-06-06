import { useState } from 'react'
import { Rocket, Loader2, CheckCircle2, MessageCircle } from 'lucide-react'
import { fireCycleVerified, webhooksConfigured } from './utils/webhookClient'
import { useAuth } from '../../../contexts/AuthContext'

/**
 * SendToPaperclipButton — the bottom call-to-action.
 *
 * Fires the cycle-level webhook. Disabled unless at least one domain
 * has been verified this cycle. After it fires, shows a success state
 * with timestamp + list of Slack channels that should have received reports.
 *
 * @param {object} props
 * @param {string[]} props.verifiedDomains — domains verified in the current cycle
 * @param {string} props.cycleId
 * @param {boolean} props.canSend          — true if Ed or Founder
 */
export default function SendToPaperclipButton({ verifiedDomains, cycleId, canSend }) {
  const { staff } = useAuth()
  const [sending, setSending] = useState(false)
  const [lastSentAt, setLastSentAt] = useState(null)
  const [channelsReceived, setChannelsReceived] = useState([])
  const [error, setError] = useState(null)
  const webhooks = webhooksConfigured()

  const hasVerifiedDomains = verifiedDomains && verifiedDomains.length > 0
  const disabled = !canSend || !hasVerifiedDomains || sending

  async function handleSend() {
    if (disabled || !staff?.id) return
    setSending(true)
    setError(null)
    try {
      const now = new Date().toISOString()
      const result = await fireCycleVerified({
        cycle_id: cycleId,
        verified_at: now,
        verified_by: staff.id,
        domains_included: verifiedDomains,
      })
      if (!result.ok && !result.skipped) {
        setError('The robots didn\'t respond just yet. Try again in a moment.')
      } else {
        setLastSentAt(now)
        setChannelsReceived(deriveSlackChannels(verifiedDomains))
        if (result.skipped) {
          setError('Button recorded — but the N8N workflow isn\'t wired up yet, so the agents won\'t fire until Phase 3 is live.')
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="rounded-2xl border border-[#52B788]/30 bg-gradient-to-br from-white to-[#EDF4EC] p-6 md:p-8 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#1B4332] flex items-center justify-center shrink-0">
          <Rocket className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#081C15]">Send Verified Data to the AI Team</h2>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            When everything checks out, hit the button below. The AI agents will pull the
            fresh data and drop their updated reports into Slack.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col md:flex-row md:items-center gap-4">
        <button
          onClick={handleSend}
          disabled={disabled}
          className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-colors ${
            disabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#1B4332] text-white hover:bg-[#081C15] shadow-sm'
          }`}
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              Send verified data to Paperclip agents
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 flex-1">
          {!canSend
            ? 'Only Ed (or a Founder during dev) can send this.'
            : !hasVerifiedDomains
              ? 'Almost there — verify at least one section and this button will light up.'
              : `Ready to fire. ${verifiedDomains.length} ${verifiedDomains.length === 1 ? 'section is' : 'sections are'} verified in this cycle.`}
        </p>
      </div>

      {/* Last sent + channels */}
      {lastSentAt && (
        <div className="mt-5 bg-white rounded-xl border border-[#52B788]/30 p-4">
          <div className="flex items-center gap-2 text-sm text-[#1B4332] font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Last sent: {new Date(lastSentAt).toLocaleString('en-US', {
              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
            })}
          </div>
          {channelsReceived.length > 0 && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-2 flex-wrap">
              <MessageCircle className="w-3.5 h-3.5" />
              Reports landing in:
              {channelsReceived.map((c) => (
                <span key={c} className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#EDF4EC] text-[#1B4332] font-medium">
                  {c}
                </span>
              ))}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {!webhooks.cycle && (
        <p className="mt-4 text-[11px] text-gray-400 italic">
          N8N webhook not set yet (VITE_N8N_DATA_INTEGRITY_VERIFIED_WEBHOOK). Button will record locally until Phase 3.
        </p>
      )}
    </section>
  )
}

/** Map verified domains → the Slack channels that will receive their agent reports. */
function deriveSlackChannels(verifiedDomains) {
  const map = {
    baseline_numbers:     ['#pc-revenue', '#pc-finance'],
    staff_roster:         ['#pc-teams'],
    strategic_priorities: ['#pc-alerts'],
    rooms:                ['#pc-teams', '#pc-ops'],
    room_scores:          ['#pc-quality', '#pc-teams'],
    teacher_scores:       ['#pc-quality', '#pc-teams'],
    compliance_hhsc:      ['#pc-legal'],
    compliance_policies:  ['#pc-legal'],
  }
  const set = new Set()
  for (const d of verifiedDomains) {
    ;(map[d] || []).forEach((c) => set.add(c))
  }
  return Array.from(set)
}
