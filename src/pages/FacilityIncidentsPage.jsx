import { Building2 } from 'lucide-react'
import { useIncidents } from '../hooks/useIncidents'
import IncidentForm from '../components/IncidentForm'
import IncidentList from '../components/IncidentList'

export default function FacilityIncidentsPage() {
  const hook = useIncidents({ scope: 'facility' })
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-rose-600" />
          Facility Incident
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Building-wide events — power outage, fire drill, equipment failure, vendor visit, security.
        </p>
      </div>

      <IncidentForm scope="facility" hook={hook} fields={[]} />
      <IncidentList hook={hook} scope="facility" />
    </div>
  )
}
