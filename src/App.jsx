import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import StaffResponsesPage from './pages/StaffResponsesPage'
import StaffProfileDatabasePage from './pages/StaffProfileDatabasePage'
import StaffProfilePage from './pages/StaffProfilePage'
import ContentCalendarPage from './pages/ContentCalendarPage'
import TrainingsDashboardPage from './pages/TrainingsDashboardPage'

function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-60 p-8">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/staff/responses" element={<StaffResponsesPage />} />
          <Route path="/staff/profile-database" element={<StaffProfileDatabasePage />} />
          <Route path="/staff/:id" element={<StaffProfilePage />} />
          <Route path="/calendars/content" element={<ContentCalendarPage />} />
          <Route path="/trainings" element={<TrainingsDashboardPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
