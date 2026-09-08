import { useParams } from 'react-router-dom'
import RichContentView from '../components/RichContentView'
import { getPlaybookEntry } from '../lib/playbookContent'

/**
 * Renders one Playbook page. Mounted at /lead/playbook/:section/:slug —
 * see App.jsx for the route registration and src/lib/navItems.js for
 * the LEAD → Playbook leaves that point at these URLs.
 *
 * Thin wrapper: reads the URL params, looks up the entry in the
 * playbookContent lib, and hands it to the shared RichContentView.
 * Same rendering pipeline as RevenueFrameworkPage.
 */
export default function PlaybookPage() {
  const { section, slug } = useParams()
  const entry = getPlaybookEntry(section, slug)
  return (
    <RichContentView
      entry={entry}
      notFoundUrl={`/lead/playbook/${section}/${slug}`}
    />
  )
}
