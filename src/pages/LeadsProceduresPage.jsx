import { useState } from 'react'
import {
  ClipboardList,
  PhoneCall,
  MessageSquare,
  Route,
  Handshake,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'

/**
 * Leads → Procedures
 *
 * SOP/playbook reference for the lead lifecycle. Static content today, but
 * structured so each SOP can later become its own routed page or editable
 * document without reshaping the UI.
 */

const SOPS = [
  {
    key: 'intake',
    label: 'Lead Intake',
    icon: ClipboardList,
    accent: 'indigo',
    summary: 'Capture every inquiry the same way — web form, phone, or walk-in.',
    steps: [
      'Greet within 30 seconds; smile on the phone.',
      'Collect: guardian name, child DOB, desired start date, phone, email, source.',
      'Create the lead record before ending the call.',
      'Tag the lead with the correct source (web, referral, phone, walk-in).',
    ],
  },
  {
    key: 'first-response',
    label: 'First Response',
    icon: PhoneCall,
    accent: 'blue',
    summary: 'First contact attempt happens inside 5 minutes — every time.',
    steps: [
      'Call the lead back within 5 minutes of intake.',
      'If no answer, leave a warm voicemail + send the intro text.',
      'Send the follow-up email with the program brochure.',
      'Log the attempt in the lead record.',
    ],
  },
  {
    key: 'tour-script',
    label: 'Tour Script',
    icon: Route,
    accent: 'amber',
    summary: 'Consistent tour flow so every family sees our best.',
    steps: [
      'Welcome + tour intro (2 min).',
      'Walk the rooms in age order; pause at age-appropriate highlights.',
      'Share the daily schedule and curriculum samples.',
      'Cover safety protocols and staff ratios.',
      'Close with pricing, availability, and a clear next step.',
    ],
  },
  {
    key: 'followup',
    label: 'Follow-up Cadence',
    icon: MessageSquare,
    accent: 'purple',
    summary: 'Stay visible without being pushy — touch cadence by day.',
    steps: [
      'Day 0 — Tour thank-you text + enrollment link.',
      'Day 1 — Personal note from the Director.',
      'Day 3 — Address any unanswered questions in writing.',
      'Day 7 — Check-in call; offer a second tour if helpful.',
      'Day 14 — Final soft close; move to nurture list if no reply.',
    ],
  },
  {
    key: 'close',
    label: 'Enrollment Close',
    icon: Handshake,
    accent: 'emerald',
    summary: 'Convert a warm tour into an enrolled family.',
    steps: [
      'Confirm desired start date and classroom placement.',
      'Walk through the enrollment packet together.',
      'Collect the registration fee and first-week deposit.',
      'Schedule the transition/first-day plan.',
      'Move the record from Leads → Families.',
    ],
  },
  {
    key: 'reengagement',
    label: 'Re-engagement',
    icon: Sparkles,
    accent: 'rose',
    summary: 'Win back cold leads when capacity, pricing, or offers change.',
    steps: [
      'Pull cold leads older than 30 days every month.',
      'Segment by original source and age group needed.',
      'Send a tailored offer (scholarship, decoy pricing, giveaway).',
      'Route any replies back to the First Response SOP.',
    ],
  },
]

const ACCENTS = {
  indigo:  { chip: 'bg-indigo-50',  icon: 'text-indigo-600',  ring: 'group-hover:border-indigo-200' },
  blue:    { chip: 'bg-blue-50',    icon: 'text-blue-600',    ring: 'group-hover:border-blue-200' },
  amber:   { chip: 'bg-amber-50',   icon: 'text-amber-600',   ring: 'group-hover:border-amber-200' },
  purple:  { chip: 'bg-purple-50',  icon: 'text-purple-600',  ring: 'group-hover:border-purple-200' },
  emerald: { chip: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'group-hover:border-emerald-200' },
  rose:    { chip: 'bg-rose-50',    icon: 'text-rose-600',    ring: 'group-hover:border-rose-200' },
}

export default function LeadsProceduresPage() {
  const { mobileMode } = useViewMode()
  const [activeKey, setActiveKey] = useState(SOPS[0].key)
  const active = SOPS.find((s) => s.key === activeKey) || SOPS[0]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Lead Procedures</h2>
            <p className="text-gray-500 mt-0.5 text-sm">
              The playbook the enrollment team runs on — intake through close.
            </p>
          </div>
        </div>
      </div>

      <div className={`grid gap-4 ${mobileMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
        {/* SOP picker */}
        <div className="lg:col-span-1 space-y-2">
          {SOPS.map((sop) => {
            const a = ACCENTS[sop.accent] || ACCENTS.indigo
            const isActive = sop.key === activeKey
            return (
              <button
                key={sop.key}
                onClick={() => setActiveKey(sop.key)}
                className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-colors ${
                  isActive
                    ? 'border-indigo-300 bg-indigo-50/50'
                    : `border-gray-200 bg-white hover:bg-gray-50 ${a.ring}`
                }`}
              >
                <div className={`w-9 h-9 rounded-lg ${a.chip} flex items-center justify-center shrink-0`}>
                  <sop.icon className={`w-4.5 h-4.5 ${a.icon}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{sop.label}</p>
                  <p className="text-xs text-gray-500 truncate">{sop.summary}</p>
                </div>
                <ArrowRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-500' : 'text-gray-300'}`} />
              </button>
            )
          })}
        </div>

        {/* SOP detail */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-lg ${ACCENTS[active.accent].chip} flex items-center justify-center`}>
              <active.icon className={`w-5 h-5 ${ACCENTS[active.accent].icon}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{active.label}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{active.summary}</p>
            </div>
          </div>

          <ol className="mt-4 space-y-3">
            {active.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Each step should leave a trace in the lead record (call note, status change, timestamp).
          </div>
        </div>
      </div>

      {/* Info footer */}
      <div className="mt-6 bg-indigo-50/60 border border-indigo-100 border-l-4 border-l-indigo-500 rounded-xl p-4 flex gap-3">
        <ClipboardList className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600">
          <p className="font-semibold text-indigo-700 uppercase tracking-wider text-[10px] mb-1">
            Heads up
          </p>
          <p>
            These SOPs are the shared language between Marketing (who bring leads in) and Enrollment
            (who turn them into families). Update them here and the team reads the same playbook.
          </p>
        </div>
      </div>
    </div>
  )
}
