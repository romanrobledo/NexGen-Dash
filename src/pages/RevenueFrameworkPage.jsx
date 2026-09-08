import { useParams } from 'react-router-dom'
import RichContentView from '../components/RichContentView'
import { getRevenueFrameworkEntry } from '../lib/revenueFrameworkContent'

/**
 * Renders one Revenue Framework page. Mounted at /framework/:slug —
 * see App.jsx for the route registration and src/lib/navItems.js for
 * the REVENUE FRAMEWORK leaves that point at these URLs.
 *
 * Thin wrapper matching PlaybookPage: URL params → content lookup →
 * shared RichContentView.
 */
export default function RevenueFrameworkPage() {
  const { slug } = useParams()
  const entry = getRevenueFrameworkEntry(slug)
  return (
    <RichContentView entry={entry} notFoundUrl={`/framework/${slug}`} />
  )
}
