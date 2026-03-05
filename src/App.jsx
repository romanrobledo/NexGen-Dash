import Sidebar from './components/Sidebar'
import MetricsDashboard from './components/MetricsDashboard'

function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-60 p-8">
        <MetricsDashboard />
      </main>
    </div>
  )
}

export default App
