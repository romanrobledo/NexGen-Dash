import { useState } from 'react'
import {
  ClipboardList,
  ClipboardCheck,
  PhoneCall,
  MessageSquare,
  Route,
  Handshake,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Search,
} from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'

/**
 * Candidates → Procedures
 *
 * Hiring twin of Leads → Procedures. Same two-column SOP browser (picker
 * on the left, steps on the right), retargeted at the applicant lifecycle:
 * application intake → phone screen → in-person interview → reference
 * check → offer → onboarding handoff. Static content today; each SOP is
 * structured so it can graduate to a routed page or editable document
 * later without reshaping this file.
 */

const SOPS = [
  {
    key: 'intake',
    label: 'Application Intake',
    icon: ClipboardList,
    accent: 'indigo',
    summary: 'Capture every applicant the same way — form, referral, or walk-in.',
    steps: [
      'Log the applicant into the candidates table within 24 hours.',
      'Collect: name, role of interest, phone, email, source, resume link.',
      'Tag the source cleanly (Indeed, LinkedIn, referral name, walk-in).',
      'Assign to the hiring manager for that role.',
    ],
  },
  {
    key: 'first-response',
    label: 'First Response',
    icon: PhoneCall,
    accent: 'blue',
    summary: 'Reach out within 1 business day so strong candidates stay engaged.',
    steps: [
      'Send an intro email confirming the application was received.',
      'Attempt a call within 1 business day — leave a warm voicemail if no answer.',
      'Send the follow-up text with a link to schedule the phone screen.',
      'Log the outreach attempt on the candidate record.',
    ],
  },
  {
    key: 'phone-screen',
    label: 'Phone Screen',
    icon: MessageSquare,
    accent: 'amber',
    summary: '15-minute call to confirm fit before booking a full interview.',
    steps: [
      'Confirm role interest, availability, and desired start date.',
      'Ask about relevant experience and licensing (CPR, background check status).',
      'Verify compensation expectations line up with the range.',
      'Set expectations for the next step and timeline.',
      'Decide: advance to in-person interview, keep on file, or pass with feedback.',
    ],
  },
  {
    key: 'interview',
    label: 'In-Person Interview',
    icon: Route,
    accent: 'purple',
    summary: 'Structured on-site interview + classroom shadow.',
    steps: [
      'Tour the facility so the candidate can see the environment.',
      'Structured interview using the role-specific question set.',
      'Shadow a classroom for 15–20 minutes to watch how they engage with kids.',
      'Debrief with the lead teacher and Director after the shadow.',
      'Score against the rubric and file with the candidate record.',
    ],
  },
  {
    key: 'references',
    label: 'Reference & Background',
    icon: ClipboardCheck,
    accent: 'rose',
    summary: 'Verify every claim before an offer goes out.',
    steps: [
      'Collect two professional references (previous supervisor + peer).',
      'Call each reference using the standard question set.',
      'Kick off the background check + fingerprinting (state requirement).',
      'Verify licensing and any state-required trainings are current.',
      'File all results with the candidate record.',
    ],
  },
  {
    key: 'offer',
    label: 'Offer & Close',
    icon: Handshake,
    accent: 'emerald',
    summary: 'Present the offer cleanly so a yes stays a yes.',
    steps: [
      'Verbal offer first — walk through rate, hours, start date, benefits.',
      'Send the written offer within 24 hours of the verbal.',
      'Confirm signed offer + first-day paperwork inside 5 business days.',
      'If the candidate declines, capture reason for the pipeline debrief.',
      'Move the record from Candidates → Hires.',
    ],
  },
  {
    key: 'onboarding-handoff',
    label: 'Onboarding Handoff',
    icon: GraduationCap,
    accent: 'blue',
    summary: 'Warm handoff to Training so day-one is not day-zero.',
    steps: [
      'Notify the Onboarding lead 5 business days before start date.',
      'Assign the correct Trainings track (Onboarding + Teachers or Admin).',
      'Schedule their first-week shadowing plan with the lead teacher.',
      'Provision access: email, timeclock, sidebar permissions, radio.',
      'Send the day-one welcome message and dress-code reminder.',
    ],
  },
  {
    key: 'reengagement',
    label: 'Re-engagement',
    icon: Search,
    accent: 'rose',
    summary: 'Warm the pool back up when a role opens.',
    steps: [
      'Pull passive candidates whose role or license still matches an open seat.',
      'Segment by role, experience level, and source.',
      'Send a tailored re-engagement message tied to the current opening.',
      'Route replies back to the First Response SOP.',
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

export default function CandidatesProceduresPage() {
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
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Candidate Procedures</h2>
            <p className="text-gray-500 mt-0.5 text-sm">
              The playbook the hiring team runs on — intake through onboarding handoff.
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
            Each step should leave a trace in the candidate record (call note, status change, timestamp).
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
            These SOPs are the shared language between the hiring team and Training. Update them here and every
            interviewer, screener, and onboarder reads the same playbook.
          </p>
        </div>
      </div>
    </div>
  )
}
