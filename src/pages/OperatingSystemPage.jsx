import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Target,
  Users,
  Calendar,
  AlertCircle,
  TrendingUp,
  FileText,
  Shield,
  GraduationCap,
  DollarSign,
  Bell,
} from 'lucide-react'

function CollapsibleSection({ title, icon, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-purple-600">{icon}</div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        {isOpen ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
      </button>

      {isOpen && (
        <div className="p-6 pt-0 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, color }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

export default function OperatingSystemPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
            <FileText className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Operating System</h1>
            <p className="text-gray-500 text-sm">
              NexGen's operational framework — how we run, measure success, and ensure consistent excellence
            </p>
          </div>
        </div>
      </div>

      {/* Core Mission Metrics */}
      <CollapsibleSection title="Core Mission Metrics (North Stars)" icon={<Target size={20} />} defaultOpen={true}>
        <p className="text-gray-700 mb-4 font-medium">Every team drives these four outcomes:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Family Satisfaction" value="NPS ≥ 75" color="text-purple-600" />
          <MetricCard label="Child Development" value="≥ 90%" color="text-blue-600" />
          <MetricCard label="Financial Health" value="Margin ≥ 12%" color="text-green-600" />
          <MetricCard label="Growth" value="+8/month" color="text-pink-600" />
        </div>
      </CollapsibleSection>

      {/* Accountability Structure */}
      <CollapsibleSection title="Accountability Structure" icon={<Users size={20} />}>
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 mb-3">Metric Ownership</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { role: 'Director (Robyn)', metrics: 'Overall NPS, Margin, Enrollment Growth, Licensing Compliance' },
              { role: 'Educational Coordinator', metrics: 'Curriculum Standards, Milestone Achievement' },
              { role: 'Lead Teachers', metrics: 'Classroom ratios, Child safety, Daily activities' },
              { role: 'Family Engagement Lead', metrics: 'Parent NPS, Communication quality' },
              { role: 'Operations Manager', metrics: 'Staff retention, Facility safety' },
              { role: 'Administrative Lead', metrics: 'Billing accuracy, CCMS compliance' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-semibold text-purple-700 text-sm mb-1">{item.role}</p>
                <p className="text-xs text-gray-600">{item.metrics}</p>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Meeting System */}
      <CollapsibleSection title="Meeting System" icon={<Calendar size={20} />}>
        <div className="space-y-6">
          {/* Rules */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              Rules (Zero Tolerance) - Follow Eloni's Framework
            </h3>
            <ul className="space-y-2">
              {[
                'Purpose Required: No meeting without clear decisions needed for child outcomes',
                'Time Limits: Hard stops enforced (respect teaching schedules)',
                "Value Add: Leave if you're not contributing to child/family success",
                'Direct Communication: Skip hierarchy when child safety is involved',
              ].map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-purple-600 font-bold">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Meeting Cadence */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Meeting Cadence</h3>
            <div className="space-y-3">
              {[
                { freq: 'Daily (10 min)', type: 'Morning classroom huddles', purpose: 'Staff coordination, immediate issues, safety checks' },
                { freq: 'Weekly (45 min)', type: 'Leadership team meeting', purpose: 'Strategic alignment, performance review, cross-team coordination' },
                { freq: 'Monthly (90 min)', type: 'Family feedback & curriculum review', purpose: 'Parent engagement, program refinement, developmental progress' },
                { freq: 'Quarterly (60 min)', type: 'Parent town hall & development showcase', purpose: 'Community building, transparency, performance meetings + review' },
              ].map((meeting, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-purple-900">{meeting.freq}</span>
                    <span className="text-xs text-purple-700 font-medium">{meeting.type}</span>
                  </div>
                  <p className="text-sm text-gray-700">{meeting.purpose}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Standard Agenda */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Standard Agenda (Time-Boxed)</h3>
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
              {[
                { num: 1, time: '1 min', item: 'Mission Check', desc: 'Which North Star are we moving?' },
                { num: 2, time: '5 min', item: 'Safety & Compliance', desc: 'Ratios, incidents, licensing updates' },
                { num: 3, time: '5 min', item: 'Metrics Review', desc: 'Green/yellow/red status vs targets' },
                { num: 4, time: '15 min', item: 'Blockers', desc: 'Issue → Root cause → Owner → Deadline' },
                { num: 5, time: '10 min', item: 'Decisions', desc: 'Assign directly responsible individual (DRI)' },
                { num: 6, time: '5 min', item: 'Parent Communication', desc: 'What families hear this week' },
                { num: 7, time: '4 min', item: 'Quick Wins', desc: 'One small improvement per classroom' },
              ].map((agenda) => (
                <div key={agenda.num} className="p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {agenda.num}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{agenda.item}</span>
                      <span className="text-xs text-gray-500">({agenda.time})</span>
                    </div>
                    <p className="text-xs text-gray-600">{agenda.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Daily Reporting */}
      <CollapsibleSection title="Daily Reporting (Due 6:00 PM)" icon={<FileText size={20} />}>
        <div className="space-y-4">
          <p className="text-gray-700 font-medium">All teams submit to #daily-reports channel:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              'Classroom/Teacher',
              'Top 3 KPIs (with targets)',
              "Today's Highlights (developmental wins, activities)",
              'Parent Talking Points (positive updates to share)',
              'Safety Incidents (if any - immediate reporting required)',
              "Tomorrow's Focus",
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Classroom-Specific KPIs */}
      <CollapsibleSection title="Classroom-Specific KPIs" icon={<TrendingUp size={20} />}>
        <div className="space-y-3">
          {[
            { classroom: 'Infant Room', kpis: 'Sleep/feeding schedules met, milestone tracking, parent satisfaction' },
            { classroom: '2-Year-Old Classes', kpis: 'Potty training progress, language development, social skills' },
            { classroom: '3-Year-Old Classes', kpis: 'Pre-K readiness, independence skills, behavioral goals' },
            { classroom: '4-Year-Old Class', kpis: 'Kindergarten readiness, academic milestones, leadership development' },
            { classroom: 'After-School Program', kpis: 'Homework completion, enrichment participation, family communication' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-900 mb-2">{item.classroom}</p>
              <p className="text-sm text-gray-700">{item.kpis}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Team Structure */}
      <CollapsibleSection title="Team Structure & Standards" icon={<Users size={20} />}>
        <div className="space-y-6">
          {/* Org Chart */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Organizational Hierarchy</h3>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
              <div className="text-center mb-4">
                <div className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-bold shadow-lg">
                  Director (Robyn)
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                {[
                  'Educational Coordinator (Curriculum & Development)',
                  'Lead Teacher - Infants',
                  'Lead Teacher - 2-Year-Olds (2 classes)',
                  'Lead Teacher - 3-Year-Olds (2 classes)',
                  'Lead Teacher - 4-Year-Olds',
                  'After-School Program Lead',
                  'Family Engagement Lead',
                  'Operations Manager (Safety & Facilities)',
                  'Administrative Lead (Billing & Compliance)',
                ].map((role, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-purple-300 text-center">
                    <p className="text-gray-700">{role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Standards */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Key Performance Standards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { metric: 'Teacher-Child Ratios', target: 'Always meet/exceed state requirements' },
                { metric: 'Staff Retention', target: '≥ 85% annual retention' },
                { metric: 'Enrollment Capacity', target: '≥ 90% (167+ children enrolled)' },
                { metric: 'Safety Incidents', target: 'Zero preventable incidents' },
                { metric: 'Parent Response Time', target: '≤24 hours for non-urgent, ≤30 min for urgent' },
                { metric: 'Billing Accuracy', target: '≥ 98%' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
                  <p className="font-semibold text-gray-900 mb-1">{item.metric}</p>
                  <p className="text-sm text-purple-700">{item.target}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Family Communication System */}
      <CollapsibleSection title="Family Communication System" icon={<Bell size={20} />}>
        <div className="space-y-6">
          {/* Daily Updates */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Daily Updates (Via Playground App / BrightWheel)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Real-time photos: Minimum 3 per child daily',
                'Activity reports: Learning moments, meals, naps, milestones',
                'Milestone celebrations: Immediate notification for achievements',
                'Incident reports: Same-day communication for any concerns',
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Digest */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Weekly Family Digest (Friday 4 PM)</h3>
            <ul className="space-y-2">
              {[
                'Curriculum Spotlight: What children learned this week',
                'Upcoming Events: Field trips, special activities, parent nights',
                'Developmental Focus: Age-appropriate tips for home extension',
                'Staff Spotlight: Teacher achievements or training updates',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Response Protocol */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Response Protocol</h3>
            <div className="space-y-2">
              {[
                { type: 'Urgent matters', sla: 'Immediate phone call + follow-up text', color: 'red' },
                { type: 'Concerns/complaints', sla: 'Personal response within 4 hours', color: 'amber' },
                { type: 'General questions', sla: 'Response within 24 hours via preferred method', color: 'blue' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    item.color === 'red'
                      ? 'bg-red-50 border border-red-200'
                      : item.color === 'amber'
                        ? 'bg-amber-50 border border-amber-200'
                        : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <span className="font-semibold text-gray-900 text-sm">{item.type}</span>
                  <span className="text-xs text-gray-600">{item.sla}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Child Development Tracking */}
      <CollapsibleSection title="Child Development Tracking" icon={<GraduationCap size={20} />}>
        <div className="space-y-6">
          {/* Assessment Schedule */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Assessment Schedule</h3>
            <div className="space-y-2">
              {[
                { freq: 'Weekly', desc: 'Ongoing observations' },
                { freq: 'Monthly', desc: 'Individual developmental milestone reviews' },
                { freq: 'Quarterly', desc: 'Parent-teacher conferences with portfolio review' },
                { freq: 'Bi-annual', desc: 'Comprehensive developmental assessments' },
                { freq: 'Ongoing', desc: 'Daily observation documentation' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <span className="font-semibold text-purple-700 min-w-24">{item.freq}:</span>
                  <span className="text-sm text-gray-700">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Age-Specific Goals */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Age-Specific Goals</h3>
            <div className="space-y-3">
              {[
                { age: 'Infants (6 weeks-12 months)', goals: 'Attachment security, sensory development, motor skills' },
                { age: '2-Year-Olds', goals: 'Language explosion, social play, independence skills' },
                { age: '3-Year-Olds', goals: 'Pre-academic skills, emotional regulation, friendship building' },
                { age: '4-Year-Olds', goals: 'Kindergarten readiness, leadership skills, complex problem-solving' },
                { age: 'After-School (5-13 years)', goals: 'Homework support, enrichment activities, social development' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2">{item.age}</p>
                  <p className="text-sm text-gray-700">{item.goals}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Safety & Compliance */}
      <CollapsibleSection title="Safety & Compliance Standards" icon={<Shield size={20} />}>
        <div className="space-y-6">
          {/* Daily Checklist */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Daily Safety Checklist</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Morning walkthrough: Facility safety, equipment check',
                'Ratio maintenance: Documented teacher-child ratios hourly',
                'Incident reporting: Immediate documentation + parent notification',
                'Secure entry/exit: Verification of all pickups/drop-offs',
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
                  <Shield size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Licensing Compliance */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Licensing Compliance</h3>
            <ul className="space-y-2">
              {[
                'Staff qualifications: All requirements met + documentation current',
                'Background checks: Annual updates for all staff',
                'Training hours: CPR, First Aid, ongoing professional development',
                'Facility inspections: Monthly internal + state requirements',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 p-2 hover:bg-gray-50 rounded">
                  <span className="text-red-600 font-bold">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CollapsibleSection>

      {/* Staff Development */}
      <CollapsibleSection title="Staff Development Program" icon={<GraduationCap size={20} />}>
        <div className="space-y-6">
          {/* Initial Training */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Initial (In-House Training)</h3>
            <div className="space-y-2">
              {[
                'New hire orientation: 2-week comprehensive training program',
                '90-day mentorship: Teacher Assist to Lead Teacher pathway',
                'Attendance-based rewards: Incentive for continuing perfection',
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Continuing Development */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Continuing Professional Development</h3>
            <ul className="space-y-2">
              {[
                'Monthly professional development: Teacher development, rotating topics based on needs',
                'Punctuality rewards: ≥30% on-time arrival → Team celebration (2-3 hr)',
                'Performance Standards: Communication quality (Parent satisfaction ≥ 71%)',
                'Team collaboration: Peer feedback integration',
                'Professional growth: Individual development plans updated quarterly',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CollapsibleSection>

      {/* Financial Management */}
      <CollapsibleSection title="Financial Management" icon={<DollarSign size={20} />}>
        <div className="space-y-6">
          {/* Revenue Tracking */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Revenue Tracking</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Monthly Collection Rate</p>
                <p className="text-2xl font-bold text-green-700">≥ 98%</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Enrollment Target</p>
                <p className="text-2xl font-bold text-blue-700">80%+ always</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Core Revenue</p>
                <p className="text-2xl font-bold text-purple-700">≥ 75%</p>
              </div>
            </div>
          </div>

          {/* Cost Management */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Cost Management</h3>
            <div className="space-y-2">
              {[
                { category: 'Staff costs', target: '≤60% of revenue' },
                { category: 'Supplies & materials', target: '~8% of revenue' },
                { category: 'Facility maintenance', target: '~5% of revenue' },
                { category: 'Food program', target: '~7% of revenue' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{item.category}</span>
                  <span className="text-sm text-purple-700 font-semibold">{item.target}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Emergency Procedures */}
      <CollapsibleSection title="Emergency Procedures" icon={<AlertCircle size={20} />}>
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <AlertCircle size={18} />
                Communication Protocol
              </h3>
              <div className="space-y-2">
                {[
                  'Immediate threats: Call 911 → Director → All staff → Parents',
                  'Weather emergencies: Follow district closures, notify parents 2 hours advance',
                  'Medical emergencies: First aid → 911 if needed → Parent notification',
                  'Facility issues: Alternative space arrangements, family notification',
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-white rounded border border-red-300">
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-red-900 mb-3">Business Continuity</h3>
              <ul className="space-y-1">
                {[
                  'Lockdown → Secure → Parent notification → Documentation',
                  'Staff shortages: Substitute roster maintained, ratio compliance priority',
                  'Technology failures: Backup communication methods, manual processes',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-red-600 font-bold">!</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Quality Assurance */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white mt-4">
        <h2 className="text-2xl font-bold mb-4">Quality Assurance Framework</h2>
        <h3 className="text-lg font-semibold mb-3">Key Success Principles</h3>
        <div className="space-y-2">
          {[
            'Child-First Decision Making: Every policy filtered through "What\'s best for child development?"',
            'Safety is Non-Negotiable: Compliance and safety standards always maintained',
            "Transparent Communication: Open, honest sharing with families about their child's experience",
            'Continuous Improvement: Data-driven decisions for program enhancement',
            'Staff Support & Development: Invest in team growth and well-being',
          ].map((principle, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-white/10 rounded-lg backdrop-blur">
              <span className="font-bold text-yellow-300">{idx + 1}.</span>
              <p className="text-sm">{principle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>This Operating System defines how NexGen runs daily, measures success, and ensures consistent excellence.</p>
      </div>
    </div>
  )
}
