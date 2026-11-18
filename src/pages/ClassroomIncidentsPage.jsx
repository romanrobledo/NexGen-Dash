import { School } from 'lucide-react'
import { useIncidents } from '../hooks/useIncidents'
import IncidentForm from '../components/IncidentForm'
import IncidentList from '../components/IncidentList'

export default function ClassroomIncidentsPage() {
  const hook = useIncidents({ scope: 'classroom' })
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <School className="w-6 h-6 text-rose-600" />
          Classroom Incident
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Room-level events — injury, disruption, specific-child behavior, teacher coverage.
        </p>
      </div>

      <IncidentForm scope="classroom" hook={hook} fields={['child', 'room']} />
      <IncidentList hook={hook} scope="classroom" />
    </div>
  )
}
