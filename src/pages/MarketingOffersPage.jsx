import { useParams, useNavigate } from 'react-router-dom'
import {
  Megaphone,
  Gift,
  ShoppingBag,
  Package,
  ShoppingCart,
  Clock,
  Heart,
  GraduationCap,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'

const offerCategories = [
  {
    id: 'giveaways',
    title: 'Giveaways',
    description: 'Promotional giveaway items to attract and engage families.',
    icon: Gift,
    color: 'blue',
    children: [
      { id: 'bags', title: 'Bags', description: 'Branded bags for families and events.', icon: ShoppingBag, color: 'blue' },
      { id: 'kits', title: 'Kits', description: 'Curated kits with essential items for new enrollments.', icon: Package, color: 'indigo' },
      { id: 'baskets', title: 'Baskets', description: 'Gift baskets for special promotions and outreach.', icon: Gift, color: 'violet' },
    ],
  },
  {
    id: 'decoy',
    title: 'Decoy',
    description: 'Strategic pricing options that guide families toward the best value.',
    icon: ShoppingCart,
    color: 'purple',
  },
  {
    id: 'buy-x-get-y',
    title: 'Buy X, Get Y',
    description: 'Bundle offers that reward families for commitment.',
    icon: ShoppingCart,
    color: 'pink',
  },
  {
    id: 'pay-less-now',
    title: 'Pay Less Now or Pay More Later',
    description: 'Incentive pricing that encourages early enrollment decisions.',
    icon: Clock,
    color: 'amber',
  },
  {
    id: 'free-goodwill',
    title: 'Free Goodwill Offer',
    description: 'Community-focused offers that build trust and goodwill.',
    icon: Heart,
    color: 'emerald',
    children: [
      { id: '3-month-scholarship', title: '3 Month Scholarship', description: 'Scholarship program offering 3 months of sponsored care.', icon: GraduationCap, color: 'emerald' },
    ],
  },
]

const colorMap = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', iconBg: 'bg-blue-100', iconText: 'text-blue-600', badge: 'bg-blue-600' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600', badge: 'bg-indigo-600' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', iconBg: 'bg-violet-100', iconText: 'text-violet-600', badge: 'bg-violet-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', iconBg: 'bg-purple-100', iconText: 'text-purple-600', badge: 'bg-purple-600' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', iconBg: 'bg-pink-100', iconText: 'text-pink-600', badge: 'bg-pink-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-100', iconText: 'text-amber-600', badge: 'bg-amber-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', badge: 'bg-emerald-600' },
}

function OfferCard({ item, basePath, navigate }) {
  const colors = colorMap[item.color]
  const Icon = item.icon
  const hasChildren = item.children && item.children.length > 0
  const path = `${basePath}/${item.id}`

  return (
    <button
      onClick={() => navigate(path)}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all text-left group"
    >
      <div className={`${colors.bg} ${colors.border} border-b p-5`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
            <Icon size={20} className={colors.iconText} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
            {hasChildren && (
              <span className="text-xs text-gray-500">{item.children.length} items</span>
            )}
          </div>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600">{item.description}</p>
      </div>
    </button>
  )
}

function DetailPage({ title, description, icon: Icon, color, children, navigate, backPath, backLabel }) {
  const colors = colorMap[color]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(backPath)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to {backLabel}
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
            <Icon className={colors.iconText} size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-500 text-sm">{description}</p>
          </div>
        </div>
      </div>

      {children ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <OfferCard key={child.id} item={child} basePath={backPath + '/' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')} navigate={navigate} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className={`w-16 h-16 ${colors.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <Icon size={32} className={colors.iconText} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 mb-4">{description}</p>
          <p className="text-sm text-gray-400">Content coming soon — this section is ready for your materials.</p>
        </div>
      )}
    </div>
  )
}

export default function MarketingOffersPage() {
  const { category, subcategory } = useParams()
  const navigate = useNavigate()

  // If we have a subcategory, find the parent category and the child
  if (category && subcategory) {
    const parent = offerCategories.find((c) => c.id === category)
    if (parent && parent.children) {
      const child = parent.children.find((c) => c.id === subcategory)
      if (child) {
        return (
          <DetailPage
            title={child.title}
            description={child.description}
            icon={child.icon}
            color={child.color}
            navigate={navigate}
            backPath={`/marketing/offers/${category}`}
            backLabel={parent.title}
          />
        )
      }
    }
  }

  // If we have a category, show its detail/children
  if (category) {
    const item = offerCategories.find((c) => c.id === category)
    if (item) {
      return (
        <DetailPage
          title={item.title}
          description={item.description}
          icon={item.icon}
          color={item.color}
          children={item.children}
          navigate={navigate}
          backPath="/marketing/offers"
          backLabel="Offers"
        />
      )
    }
  }

  // Main offers hub
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
            <Megaphone className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketing Offers</h1>
            <p className="text-gray-500 text-sm">Promotional strategies and offer types</p>
          </div>
        </div>
      </div>

      {/* Offer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offerCategories.map((item) => (
          <OfferCard key={item.id} item={item} basePath="/marketing/offers" navigate={navigate} />
        ))}
      </div>
    </div>
  )
}
