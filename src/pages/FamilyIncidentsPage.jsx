import { Users } from 'lucide-react'
import { useIncidents } from '../hooks/useIncidents'
import IncidentForm from '../components/IncidentForm'
import IncidentList from '../components/IncidentList'

export default function FamilyIncidentsPage() {
  const hook = useIncidents({ scope: 'family' })
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-rose-600" />
          Family / Parent Incident
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          For issues not tied to a specific room — dropoff / pickup conflicts, custody notes, allergy updates, communication requests.
        </p>
      </div>

      <IncidentForm scope="family" hook={hook} fields={['child', 'parent']} />
      <IncidentList hook={hook} scope="family" />
    </div>
  )
}
