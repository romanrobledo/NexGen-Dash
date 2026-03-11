import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopToolbar from './components/TopToolbar'
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
import DashboardGuidePage from './pages/DashboardGuidePage'
import WhoAreWePage from './pages/WhoAreWePage'
import WhatDoIDoPage from './pages/WhatDoIDoPage'
import HowDoIDoItPage from './pages/HowDoIDoItPage'
import WhyIsItImportantPage from './pages/WhyIsItImportantPage'
import WhenDoIDoItPage from './pages/WhenDoIDoItPage'
import HowDoIKnowPage from './pages/HowDoIKnowPage'
import WhenDoWeMeetPage from './pages/WhenDoWeMeetPage'
import WhatDoWeTalkAboutPage from './pages/WhatDoWeTalkAboutPage'
import WhereDoWeGoPage from './pages/WhereDoWeGoPage'
import ImportantMetricsPage from './pages/ImportantMetricsPage'
import TargetTaskDashboardPage from './pages/TargetTaskDashboardPage'
import TargetTaskSubmitPage from './pages/TargetTaskSubmitPage'
import TrainingCategoryPage from './pages/TrainingCategoryPage'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '4rem' : '15rem' }}
      >
        <TopToolbar />
        <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/targets" element={<TargetTaskDashboardPage />} />
          <Route path="/targets/submit" element={<TargetTaskSubmitPage />} />
          <Route path="/dashboard/who-are-we" element={<WhoAreWePage />} />
          <Route path="/dashboard/what-do-i-do" element={<WhatDoIDoPage />} />
          <Route path="/dashboard/how-do-i-do-it" element={<HowDoIDoItPage />} />
          <Route path="/dashboard/why-is-it-important" element={<WhyIsItImportantPage />} />
          <Route path="/dashboard/when-do-i-do-it" element={<WhenDoIDoItPage />} />
          <Route path="/dashboard/how-do-i-know" element={<HowDoIKnowPage />} />
          <Route path="/dashboard/when-do-we-meet" element={<WhenDoWeMeetPage />} />
          <Route path="/dashboard/what-do-we-talk-about" element={<WhatDoWeTalkAboutPage />} />
          <Route path="/dashboard/where-to-go" element={<WhereDoWeGoPage />} />
          <Route path="/dashboard/important-metrics" element={<ImportantMetricsPage />} />
          <Route path="/dashboard/:slug" element={<DashboardGuidePage />} />
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
          <Route path="/trainings/:category" element={<TrainingCategoryPage />} />
          <Route path="/trainings/:category/:subcategory" element={<TrainingCategoryPage />} />
        </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
