import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatCards from './components/StatCards'
import AttendanceChart from './components/AttendanceChart'
import QuickActions from './components/QuickActions'
import ClassOverview from './components/ClassOverview'
import RecentActivity from './components/RecentActivity'

function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-60 p-8">
        <Header />

        <div className="mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
          <p className="text-gray-500">Here's what's happening at NexGen today</p>
        </div>

        <div className="mt-6">
          <StatCards />
        </div>

        <div className="flex gap-5 mb-6">
          <AttendanceChart />
          <QuickActions />
        </div>

        <div className="flex gap-5">
          <ClassOverview />
          <RecentActivity />
        </div>
      </main>
    </div>
  )
}

export default App
