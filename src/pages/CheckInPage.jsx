import { LogIn } from 'lucide-react'
import CheckPunchView from '../components/CheckPunchView'

export default function CheckInPage() {
  return (
    <CheckPunchView
      mode="check_in"
      title="Check In"
      subtitle="Log the start of your shift."
      icon={LogIn}
      accent="green"
    />
  )
}
