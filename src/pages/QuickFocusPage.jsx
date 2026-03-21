import {
  Zap,
  Heart,
  Users,
  HelpCircle,
  DollarSign,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Target,
  TrendingUp,
  Briefcase,
} from 'lucide-react'

const howWeHelp = [
  'Get clear on each child\'s needs, age level, and learning stage',
  'Create consistent daily routines that help kids feel secure and focused',
  'Teach early learning fundamentals (language, numbers, motor skills, social skills)',
  'Support social-emotional growth: confidence, sharing, kindness, self-control',
  'Offer full-day, part-week, and after-school care for working families',
  'Maintain clean, safe classrooms that meet all health and licensing standards',
  'Use trained, nurturing teachers who actively guide development',
  'Provide structured classroom management with clear expectations',
  'Communicate with parents daily on progress, needs, and milestones',
  'Support families using state subsidies and affordable tuition options',
  'Track child development with simple, consistent reporting',
  'Build school readiness for Pre-K and Kindergarten success',
  'Offer enrichment opportunities like self-defense and technology learning',
  'Provide uniforms and practical support to reduce family stress',
  'Run strong onboarding and training systems for teachers',
  'Maintain accountability through team leads and clear standards',
  'Continuously improve care quality through review and coaching',
]

const teams = [
  'Targets', 'Sales', 'Marketing', 'Support', 'Training', 'Recruiting', 'Fulfillment',
  'Offers', 'Product', 'Customer Satisfaction / Success', 'Finance & Accounting', 'IT', 'HR',
]

const talkAboutLeft = [
  { label: 'Position', desc: 'Where are we currently at?' },
  { label: 'Targets', desc: 'Where are we trying to go? KPI\'s' },
  { label: 'Performance Results', desc: 'Where did we come from?' },
  { label: 'Plan', desc: 'What are we currently doing?' },
  { label: 'Track', desc: 'How are we measuring progress or regression?' },
]

const talkAboutRight = [
  { label: 'Accountability', desc: 'Who is in charge of what?' },
  { label: 'Priorities', desc: 'Next 7 days' },
  { label: 'Problems', desc: 'Any Problems?' },
  { label: 'Issues', desc: 'Any Issues?' },
  { label: 'Concerns', desc: 'Any Concerns?' },
]

export default function QuickFocusPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-500 rounded-xl flex items-center justify-center">
            <Zap className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quick Focus</h1>
            <p className="text-gray-500 text-sm">NexGen SELF — Our mission, method, and rhythm</p>
          </div>
        </div>
      </div>

      {/* ── NexGen SELF Section ─────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
          <h2 className="text-xl font-bold text-white tracking-wide">NexGen SELF</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* What we do */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Heart size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">What we do</h3>
            </div>
            <p className="text-gray-700">
              We provide safe, high-quality child care and early education for working families.
            </p>
          </div>

          {/* Who we help */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-purple-600" />
              <h3 className="font-semibold text-gray-900">Who we help</h3>
            </div>
            <p className="text-gray-700">
              We help hardworking families who need affordable, trustworthy child care.
            </p>
          </div>

          {/* How we help */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">How we help</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {howWeHelp.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-blue-500 mt-1 shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What we sell */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-emerald-600" />
              <h3 className="font-semibold text-gray-900">What we sell</h3>
            </div>
            <p className="text-2xl font-bold text-emerald-700">$215 <span className="text-base font-medium text-gray-600">Weekly Care</span></p>
          </div>
        </div>
      </div>

      {/* ── Productivity & Growth Section ─────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-5">
          <h2 className="text-xl font-bold text-white tracking-wide">How do we ensure productivity and growth?</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* 1. What are the teams */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-700 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">What are the teams?</h3>
                <p className="text-sm text-gray-500">Snapshots of the business health in focused groups</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 ml-11">
              {teams.map((team, i) => (
                <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-sm font-medium text-blue-800 flex items-center gap-2">
                  <Briefcase size={13} className="text-blue-500 shrink-0" />
                  {team}
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* 2. When do we meet */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-700 font-bold text-sm">2</span>
              </div>
              <h3 className="font-semibold text-gray-900">When do we meet?</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-purple-600" />
                  <h4 className="font-semibold text-gray-900">Integrator & Operator</h4>
                </div>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />45 Minutes</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />1 / Week</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />Every Thursday @ 3:30pm</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={16} className="text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Full Team</h4>
                </div>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />60 Minutes</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />1 / Month — Overlaps with Quarterly's</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />Every 2nd Monday of Every Month</li>
                </ul>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* 3. What do we talk about */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-700 font-bold text-sm">3</span>
              </div>
              <h3 className="font-semibold text-gray-900">What do we talk about?</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
              <div className="space-y-2">
                {talkAboutLeft.map((item, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare size={14} className="text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{item.label}</span>
                        <span className="text-gray-500 text-sm"> — {item.desc}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {talkAboutRight.map((item, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare size={14} className="text-purple-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{item.label}</span>
                        <span className="text-gray-500 text-sm"> — {item.desc}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* 4. What do we finish with */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-700 font-bold text-sm">4</span>
              </div>
              <h3 className="font-semibold text-gray-900">What do we finish the meeting with?</h3>
            </div>
            <div className="flex flex-wrap gap-3 ml-11">
              {['Target', 'Plan', 'Next meeting booked'].map((item, i) => (
                <div key={i} className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-2">
                  <Target size={14} className="text-emerald-600" />
                  <span className="font-medium text-emerald-800 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
