import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import StaffResponsesPage from './pages/StaffResponsesPage'
import StaffProfileDatabasePage from './pages/StaffProfileDatabasePage'
import StaffProfilePage from './pages/StaffProfilePage'
import ContentCalendarPage from './pages/ContentCalendarPage'
import TrainingsDashboardPage from './pages/TrainingsDashboardPage'
import TrainingsOnboardingPage from './pages/TrainingsOnboardingPage'
import TrainingsToolsPage from './pages/TrainingsToolsPage'
import TrainingsHowTosPage from './pages/TrainingsHowTosPage'
import TrainingsAdminPage from './pages/TrainingsAdminPage'
import TrainingsViewerPage from './pages/TrainingsViewerPage'

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
          <Route path="/trainings/onboarding" element={<TrainingsOnboardingPage />} />
          <Route path="/trainings/tools" element={<TrainingsToolsPage />} />
          <Route path="/trainings/howtos" element={<TrainingsHowTosPage />} />
          <Route path="/trainings/admin" element={<TrainingsAdminPage />} />
          <Route path="/trainings/view/:stepId" element={<TrainingsViewerPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
