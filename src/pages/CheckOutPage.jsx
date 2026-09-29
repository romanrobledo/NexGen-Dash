import { LogOut } from 'lucide-react'
import CheckPunchView from '../components/CheckPunchView'

export default function CheckOutPage() {
  return (
    <CheckPunchView
      mode="check_out"
      title="Check Out"
      subtitle="Log the end of your shift."
      icon={LogOut}
      accent="rose"
    />
  )
}
