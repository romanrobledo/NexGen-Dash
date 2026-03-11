import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, BookOpen, FolderOpen, ArrowLeft } from 'lucide-react'

// ─── Training category definitions ────────────────────────────────────────────
const CATEGORIES = {
  sales: {
    title: 'Sales',
    description:
      'Training content for the enrollment sales process — from first inquiry to signed enrollment.',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100 text-blue-600',
    subcategories: {
      playbook: {
        title: 'Playbook',
        description:
          'The complete sales playbook — scripts, objection handling, follow-up sequences, and enrollment conversion strategies.',
      },
      campaigns: {
        title: 'Campaigns',
        description:
          'Ad campaigns, promotional offers, seasonal pushes, and lead-generation strategies.',
      },
      routine: {
        title: 'Routine',
        description:
          'Daily and weekly sales routines — lead follow-up cadence, CRM updates, and pipeline management.',
      },
    },
  },
  marketing: {
    title: 'Marketing',
    description:
      'Training content for brand visibility, social media, content creation, and community outreach.',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-100 text-purple-600',
    subcategories: {},
  },
  tours: {
    title: 'Tours',
    description:
      'Training for delivering exceptional facility tours — preparation, presentation, and follow-up.',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-600',
    subcategories: {},
  },
  support: {
    title: 'Support',
    description:
      'Customer support training — parent communication, issue resolution, and satisfaction management.',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-100 text-amber-600',
    subcategories: {},
  },
  offers: {
    title: 'Offers',
    description:
      'Pricing, promotions, discounts, referral programs, and enrollment incentive training.',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    iconBg: 'bg-rose-100 text-rose-600',
    subcategories: {},
  },
  fulfillment: {
    title: 'Fulfillment',
    description:
      'Classroom-level training for delivering the NexGen experience — room-specific procedures, routines, and standards.',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    iconBg: 'bg-teal-100 text-teal-600',
    subcategories: {
      'infant-room': {
        title: 'Infant Room',
        description:
          'Training for the Infant Room (6 weeks to 12 months) — feeding, safe sleep, tummy time, and responsive caregiving.',
      },
      'older-infant-room': {
        title: 'Older Infant Room',
        description:
          'Training for the Older Infant Room (12 to 18 months) — mobility, first foods transitions, and early communication.',
      },
      'young-toddler-room': {
        title: 'Young Toddler Room',
        description:
          'Training for the Young Toddler Room (18 to 24 months) — language explosion, independence building, and routine structuring.',
      },
      'toddler-room': {
        title: 'Toddler Room',
        description:
          'Training for the Toddler Room (2 to 3 years) — potty training, social skills, structured play, and early discipline.',
      },
      'pre-kinder-room': {
        title: 'Pre-Kinder Room',
        description:
          'Training for the Pre-Kinder Room (3 to 4 years) — school-readiness curriculum, letter/number recognition, and group learning.',
      },
      'kinder-room': {
        title: 'Kinder Room',
        description:
          'Training for the Kinder Room (4 to 5 years) — advanced curriculum, writing readiness, and kindergarten preparation.',
      },
      'afterschool-room': {
        title: 'Afterschool Room',
        description:
          'Training for the Afterschool Room (5+ years) — homework support, enrichment activities, and age-appropriate independence.',
      },
    },
  },
}

export default function TrainingCategoryPage() {
  const { category, subcategory } = useParams()
  const navigate = useNavigate()

  const cat = CATEGORIES[category]
  if (!cat) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-gray-500 text-lg">Training category not found.</p>
        <button
          onClick={() => navigate('/trainings')}
          className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Training Library
        </button>
      </div>
    )
  }

  const sub = subcategory ? cat.subcategories[subcategory] : null
  if (subcategory && !sub) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-gray-500 text-lg">Subcategory not found.</p>
        <button
          onClick={() => navigate(`/trainings/${category}`)}
          className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {cat.title}
        </button>
      </div>
    )
  }

  const title = sub ? sub.title : cat.title
  const description = sub ? sub.description : cat.description
  const subEntries = !sub ? Object.entries(cat.subcategories) : []

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
        <button
          onClick={() => navigate('/trainings')}
          className="hover:text-gray-600 transition-colors"
        >
          Library
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button
          onClick={() => navigate('/trainings')}
          className="hover:text-gray-600 transition-colors"
        >
          Trainings
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        {sub ? (
          <>
            <button
              onClick={() => navigate(`/trainings/${category}`)}
              className="hover:text-gray-600 transition-colors"
            >
              {cat.title}
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-700 font-medium">{sub.title}</span>
          </>
        ) : (
          <span className="text-gray-700 font-medium">{cat.title}</span>
        )}
      </nav>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className={`p-3 rounded-xl ${cat.iconBg}`}>
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-1 text-sm max-w-2xl">{description}</p>
        </div>
      </div>

      {/* Sub-category cards (only on parent pages) */}
      {subEntries.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Sub-categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subEntries.map(([slug, subcat]) => (
              <button
                key={slug}
                onClick={() => navigate(`/trainings/${category}/${slug}`)}
                className="text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${cat.iconBg}`}>
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {subcat.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{subcat.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Placeholder for future training content */}
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
        <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h3 className="text-gray-500 font-medium mb-1">Training Content Coming Soon</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Training modules for <strong>{title}</strong> will be added here. Each module will include
          step-by-step guides, videos, and assessments.
        </p>
      </div>
    </div>
  )
}
