import { useParams } from 'react-router-dom'
import {
  Users,
  ClipboardList,
  Target,
  CalendarClock,
  Wrench,
  TrendingUp,
  CalendarCheck,
  MessageCircle,
  HelpCircle,
  BarChart3,
} from 'lucide-react'

const GUIDES = {
  'who-are-we': {
    title: 'Who Are We',
    description: 'Learn about NexGen School, our mission, values, and the team that makes it all happen.',
    icon: Users,
    color: 'bg-blue-500',
  },
  'what-do-i-do': {
    title: 'What Do I Do',
    description: 'Understand your role, daily responsibilities, and what is expected of you as a team member.',
    icon: ClipboardList,
    color: 'bg-purple-500',
  },
  'why-is-it-important': {
    title: 'Why Is It Important',
    description: 'Discover the impact of your work on children, families, and our TRS 4-Star standards.',
    icon: Target,
    color: 'bg-emerald-500',
  },
  'when-do-i-do-it': {
    title: 'When Do I Do It',
    description: 'Daily schedules, routines, and timelines for completing your key tasks.',
    icon: CalendarClock,
    color: 'bg-orange-500',
  },
  'how-do-i-do-it': {
    title: 'How Do I Do It',
    description: 'Step-by-step guides, procedures, and best practices for doing your job well.',
    icon: Wrench,
    color: 'bg-pink-500',
  },
  'how-do-i-know': {
    title: 'How Do I Know I Am Doing A Good Job',
    description: 'Performance indicators, feedback loops, and self-assessment tools to measure your success.',
    icon: TrendingUp,
    color: 'bg-teal-500',
  },
  'when-do-we-meet': {
    title: 'When Do We Meet',
    description: 'Regular meeting schedule, stand-ups, team check-ins, and important dates.',
    icon: CalendarCheck,
    color: 'bg-indigo-500',
  },
  'what-do-we-talk-about': {
    title: 'What Do We Talk About',
    description: 'Meeting agendas, discussion topics, and how to prepare for team conversations.',
    icon: MessageCircle,
    color: 'bg-amber-500',
  },
  'where-to-go': {
    title: 'Where Do We Go If You Have Questions',
    description: 'Resources, contacts, and support channels for getting the help you need.',
    icon: HelpCircle,
    color: 'bg-rose-500',
  },
  'important-metrics': {
    title: 'What Are The Most Important Metrics To Track and Why',
    description: 'Key performance metrics that drive our success and how to monitor them.',
    icon: BarChart3,
    color: 'bg-cyan-500',
  },
}

export default function DashboardGuidePage() {
  const { slug } = useParams()
  const guide = GUIDES[slug]

  if (!guide) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <h3 className="font-semibold mb-1">Page not found</h3>
        <p className="text-sm">The requested guide could not be found.</p>
      </div>
    )
  }

  const IconComponent = guide.icon

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className={`w-12 h-12 rounded-xl ${guide.color} flex items-center justify-center`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{guide.title}</h2>
            <p className="text-gray-500 mt-0.5">{guide.description}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <IconComponent className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-400 text-sm">Content for this section is coming soon.</p>
        <p className="text-gray-300 text-xs mt-1">This page will be built out with detailed information.</p>
      </div>
    </div>
  )
}
