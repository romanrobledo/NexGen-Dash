import { Activity } from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import ProjectStatusBoard from '../components/ProjectStatusBoard'

/**
 * Tasks page — `/tasks`.
 *
 * Dedicated home for the project status board. Filename stayed PulsePage.jsx
 * (was originally called "Pulse" before the rename) so git history stays
 * intact; only the user-facing label, page title, and URL changed.
 *
 * Reads from src/lib/projects.js via <ProjectStatusBoard />, which is also
 * the renderer used wherever else we surface these tiles in the future.
 */
export default function PulsePage() {
  const { mobileMode } = useViewMode()

  return (
    <div className={mobileMode ? '' : 'max-w-6xl mx-auto'}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className={`font-bold text-gray-900 ${mobileMode ? 'text-xl' : 'text-2xl'}`}>
            Tasks
          </h1>
          <p className="text-sm text-gray-500">
            Every major initiative — owner, status, and where we stand right now.
          </p>
        </div>
      </div>

      {/* The "THE PULSE" eyebrow that used to sit here was removed during the
          rename — the page title already says "Tasks", so a second label
          would be redundant. The emerald header gradient still carries the
          original visual identity. */}

      <ProjectStatusBoard />
    </div>
  )
}
