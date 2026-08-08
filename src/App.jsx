import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ViewModeProvider, useViewMode } from './contexts/ViewModeContext'
import ProtectedRoute from './components/ProtectedRoute'
import { BOOKS_ADMIN_ROLES } from './lib/roles'
import Sidebar from './components/Sidebar'
import TopToolbar from './components/TopToolbar'
import MobileBottomNav from './components/MobileBottomNav'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import StaffResponsesPage from './pages/StaffResponsesPage'
import StaffProfileDatabasePage from './pages/StaffProfileDatabasePage'
import StaffProfilePage from './pages/StaffProfilePage'
import ContentCalendarPage from './pages/ContentCalendarPage'
import MarketingEventsPage from './pages/MarketingEventsPage'
import MarketingCalendarPage from './pages/MarketingCalendarPage'
import ShotListsPage from './pages/ShotListsPage'
import UploadPage from './pages/UploadPage'
import OfficerPage from './pages/OfficerPage'
import TrainingsDashboardPage from './pages/TrainingsDashboardPage'
import TrainingsOnboardingPage from './pages/TrainingsOnboardingPage'
import TrainingsRoleClarityPage from './pages/TrainingsRoleClarityPage'
import TrainingsTrsPage from './pages/TrainingsTrsPage'
import TrainingsToolsPage from './pages/TrainingsToolsPage'
import TrainingsHowTosPage from './pages/TrainingsHowTosPage'
import TrainingsAdminPage from './pages/TrainingsAdminPage'
import TrainingsViewerPage from './pages/TrainingsViewerPage'
import DashboardGuidePage from './pages/DashboardGuidePage'
import WhoAreWePage from './pages/WhoAreWePage'
import WhoAmIPage from './pages/WhoAmIPage'
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
import TargetsProgressPage from './pages/TargetsProgressPage'
import TasksPage from './pages/TasksPage'
import TrainingCategoryPage from './pages/TrainingCategoryPage'
import AdminPanelPage from './pages/AdminPanelPage'
import OperatingSystemPage from './pages/OperatingSystemPage'
import HandbooksPage from './pages/HandbooksPage'
import ApplicationsPage from './pages/ApplicationsPage'
import TrsDocumentsPage from './pages/TrsDocumentsPage'
import SopLibraryPage from './pages/SopLibraryPage'
import SopChapterPage from './pages/SopChapterPage'
import SopDetailPage from './pages/SopDetailPage'
import QuickFocusPage from './pages/QuickFocusPage'
import PulsePage from './pages/PulsePage'
import CapacityPage from './pages/CapacityPage'
import CapacityRoomPage from './pages/CapacityRoomPage'
import FacilityMapPage from './pages/FacilityMapPage'
import RosterPage from './pages/RosterPage'
import BooksAccountsPage from './pages/BooksAccountsPage'
import BooksTransactionsPage from './pages/BooksTransactionsPage'
import BooksReportsPage from './pages/BooksReportsPage'
import BooksRulesPage from './pages/BooksRulesPage'
import MarketingOffersPage from './pages/MarketingOffersPage'
import FinanceDashboardPage from './pages/FinanceDashboardPage'
import PerformanceCompliancePage from './pages/PerformanceCompliancePage'
import BillingDashboardPage from './pages/BillingDashboardPage'
import MarketingDashboardPage from './pages/MarketingDashboardPage'
import LeadsDashboardPage from './pages/LeadsDashboardPage'
import LeadsToursPage from './pages/LeadsToursPage'
import LeadsProceduresPage from './pages/LeadsProceduresPage'
import CandidatesDashboardPage from './pages/CandidatesDashboardPage'
import CandidatesInterviewsPage from './pages/CandidatesInterviewsPage'
import CandidatesProceduresPage from './pages/CandidatesProceduresPage'
import CalendarPage from './pages/CalendarPage'
import AdminMeetingsPage from './pages/AdminMeetingsPage'
import AIChatPage from './pages/AIChatPage'
import DataIntegrityPage from './pages/admin/data-integrity'
import MetricDetailPage from './pages/admin/data-integrity/MetricDetailPage'

function AppShell({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { mobileMode } = useViewMode()

  if (mobileMode) {
    // Mobile mode = mobile chrome (hamburger toolbar, slide-out sidebar,
    // bottom nav). We deliberately do NOT clamp the container width —
    // content fills whatever width the browser gives it. On an actual
    // phone viewport that means a phone-shaped layout; on a wide desktop
    // with the toggle on you'll see wide content + mobile chrome.
    //
    // pb-20 leaves room for the fixed MobileBottomNav so scrollable content
    // clears the bar.
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <TopToolbar onMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 pb-20">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '4rem' : '15rem' }}
      >
        <TopToolbar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <ViewModeProvider>
      <AuthProvider>
        <Routes>
        {/* Public route — Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — wrapped in AppShell (sidebar + toolbar) */}
        <Route path="/*" element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route path="/" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><DashboardPage /></ProtectedRoute>} />
                <Route path="/targets" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><TargetTaskDashboardPage /></ProtectedRoute>} />
                <Route path="/targets/progress" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><TargetsProgressPage /></ProtectedRoute>} />
                <Route path="/targets/tasks" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><TasksPage /></ProtectedRoute>} />
                <Route path="/targets/submit" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><TargetTaskSubmitPage /></ProtectedRoute>} />
                <Route path="/ai-chat" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><AIChatPage /></ProtectedRoute>} />
                <Route path="/operating-system" element={<OperatingSystemPage />} />
                <Route path="/handbooks" element={<HandbooksPage />} />
                <Route path="/applications" element={<ApplicationsPage />} />
                <Route path="/trs/documents" element={<TrsDocumentsPage />} />
                {/* SOP Library — chapter index + per-chapter list + per-SOP detail.
                    The specific `chapter/:chapterNum` route is registered BEFORE
                    the catch-all `:sopId` so that drilling into a chapter
                    resolves to the chapter page rather than being interpreted
                    as an SOP with id "chapter". sop_ids follow the
                    "{chapter_num}.{order}" format so they can never collide
                    with the literal word "chapter" anyway — this is
                    belt-and-suspenders. */}
                <Route path="/sop-library" element={<SopLibraryPage />} />
                <Route path="/sop-library/chapter/:chapterNum" element={<SopChapterPage />} />
                <Route path="/sop-library/:sopId" element={<SopDetailPage />} />
                <Route path="/quick-focus" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><QuickFocusPage /></ProtectedRoute>} />
                {/* Tasks page lives at /tasks — the PulsePage.jsx filename
                    stayed for git-history continuity, only the URL changed. */}
                <Route path="/tasks" element={<PulsePage />} />
                {/* Facility dashboard + per-room detail. The route lives at
                    /facility (was /capacity before the rename). Room id slugs
                    live in src/lib/rooms.js — unknown ids land on a "Room not
                    found" empty state inside CapacityRoomPage. The page
                    component filenames stayed as Capacity* for git history;
                    only the user-facing label + URL changed. */}
                <Route path="/facility" element={<CapacityPage />} />
                <Route path="/facility/:roomId" element={<CapacityRoomPage />} />
                {/* Facility Map — daily "what's happening in the building"
                    view. Different from the /facility grid above (which is
                    the Community capacity dashboard). /facility-map opens
                    the interactive floor plan with per-room drawers for
                    adding kids / teachers / incidents. */}
                <Route path="/facility-map" element={<FacilityMapPage />} />
                {/* Roster — canonical enrollment CRUD surface. Replaces the
                    read-only view of children driven by the retired Sheet
                    sync. Lives under Families > Students in the sidebar. */}
                <Route path="/roster" element={<RosterPage />} />
                {/* Books — bank-statement upload, transaction categorization,
                    monthly rollups. All three pages gated by RLS via the
                    current_staff_is_books_admin() predicate; non-admin
                    sessions see empty lists (which is the correct behavior
                    for sensitive financial data). */}
                <Route path="/finance/books/accounts" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><BooksAccountsPage /></ProtectedRoute>} />
                <Route path="/finance/books/transactions" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><BooksTransactionsPage /></ProtectedRoute>} />
                <Route path="/finance/books/reports" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><BooksReportsPage /></ProtectedRoute>} />
                {/* Books → Rules — vendor_rules admin surface. Test patterns,
                    manage the 155+ pattern→category mappings, re-apply rules
                    across a statement. Read/write gated by the same
                    current_staff_is_books_admin() predicate as the other Books
                    pages. */}
                <Route path="/finance/books/rules" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><BooksRulesPage /></ProtectedRoute>} />
                <Route path="/finance" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><FinanceDashboardPage /></ProtectedRoute>} />
                <Route path="/leads" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><LeadsDashboardPage /></ProtectedRoute>} />
                <Route path="/leads/tours" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><LeadsToursPage /></ProtectedRoute>} />
                <Route path="/leads/procedures" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><LeadsProceduresPage /></ProtectedRoute>} />
                <Route path="/candidates" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><CandidatesDashboardPage /></ProtectedRoute>} />
                <Route path="/candidates/interviews" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><CandidatesInterviewsPage /></ProtectedRoute>} />
                <Route path="/candidates/procedures" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><CandidatesProceduresPage /></ProtectedRoute>} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/admin/meetings" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><AdminMeetingsPage /></ProtectedRoute>} />
                {/* Org Chart landing → reuses the existing role-selector page
                    (WhoAmIPage). Each role click continues to open the
                    per-section pages (What Do I Do, How Do I Do It, etc.)
                    for now — merging those 5 pages into one combined page
                    per role is the next iteration. */}
                <Route path="/org-chart" element={<WhoAmIPage />} />
                <Route path="/billing" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><BillingDashboardPage /></ProtectedRoute>} />
                <Route path="/marketing" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><MarketingDashboardPage /></ProtectedRoute>} />
                <Route path="/marketing/offers" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><MarketingOffersPage /></ProtectedRoute>} />
                <Route path="/marketing/offers/:category" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><MarketingOffersPage /></ProtectedRoute>} />
                <Route path="/marketing/offers/:category/:subcategory" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><MarketingOffersPage /></ProtectedRoute>} />
                <Route path="/dashboard/who-are-we" element={<WhoAreWePage />} />
                <Route path="/dashboard/who-am-i" element={<WhoAmIPage />} />
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
                <Route path="/staff/responses" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><StaffResponsesPage /></ProtectedRoute>} />
                <Route path="/staff/profile-database" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><StaffProfileDatabasePage /></ProtectedRoute>} />
                <Route path="/staff/:id" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><StaffProfilePage /></ProtectedRoute>} />
                <Route path="/calendars/content" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><ContentCalendarPage /></ProtectedRoute>} />
                <Route path="/marketing/events" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><MarketingEventsPage /></ProtectedRoute>} />
                <Route path="/marketing/calendar" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><MarketingCalendarPage /></ProtectedRoute>} />
                <Route path="/marketing/shot-lists" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><ShotListsPage /></ProtectedRoute>} />
                <Route path="/marketing/upload" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><UploadPage /></ProtectedRoute>} />
                <Route path="/officers/:officerKey" element={<ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}><OfficerPage /></ProtectedRoute>} />
                <Route path="/trainings" element={<TrainingsDashboardPage />} />
                <Route path="/trainings/onboarding" element={<TrainingsOnboardingPage />} />
                {/* Role Clarity landing — must be registered before the generic
                    /trainings/:category route below, otherwise that dynamic
                    pattern would swallow "role-clarity" and show the wrong
                    page. */}
                <Route path="/trainings/role-clarity" element={<TrainingsRoleClarityPage />} />
                {/* TRS landing — same reasoning: registered before the
                    /trainings/:category catch-all so "trs" resolves to the
                    landing page, while /trainings/trs/cat-1 etc. still match
                    the :category/:subcategory route below. */}
                <Route path="/trainings/trs" element={<TrainingsTrsPage />} />
                <Route path="/trainings/tools" element={<TrainingsToolsPage />} />
                <Route path="/trainings/howtos" element={<TrainingsHowTosPage />} />
                <Route path="/trainings/admin" element={<TrainingsAdminPage />} />
                <Route path="/trainings/view/:stepId" element={<TrainingsViewerPage />} />
                <Route path="/trainings/:category" element={<TrainingCategoryPage />} />
                <Route path="/trainings/:category/:subcategory" element={<TrainingCategoryPage />} />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}>
                    <AdminPanelPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/permissions" element={
                  <ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}>
                    <AdminPanelPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}>
                    <AdminPanelPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings/theme" element={
                  <ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}>
                    <AdminPanelPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings/integrations" element={
                  <ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}>
                    <AdminPanelPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings/webhooks" element={
                  <ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}>
                    <AdminPanelPage />
                  </ProtectedRoute>
                } />
                {/* Compliance routes — Teachers + Support have nav_compliance so
                    they can reach these to see their own certs / training hours.
                    Guard on the specific permission_key rather than
                    BOOKS_ADMIN_ROLES so those non-admin roles don't 403. */}
                <Route path="/admin/performance-compliance" element={
                  <ProtectedRoute requiredPermission="nav_compliance">
                    <PerformanceCompliancePage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/data-integrity" element={
                  <ProtectedRoute requiredPermission="nav_compliance">
                    <DataIntegrityPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/data-integrity/metric/:metricName" element={
                  <ProtectedRoute requiredRole={BOOKS_ADMIN_ROLES}>
                    <MetricDetailPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        } />
        </Routes>
      </AuthProvider>
    </ViewModeProvider>
  )
}

export default App
