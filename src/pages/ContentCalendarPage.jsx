import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useContentPrograms } from '../hooks/useContentPrograms'
import { useContentMissions } from '../hooks/useContentMissions'
import { useBucketStatus } from '../hooks/useBucketStatus'
import BucketStatusBar from '../components/content/BucketStatusBar'
import CalendarGrid from '../components/content/CalendarGrid'
import MissionModal from '../components/content/MissionModal'

export default function ContentCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedMission, setSelectedMission] = useState(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const { programs, loading: programsLoading, error: programsError } = useContentPrograms()
  const { missions, loading: missionsLoading, error: missionsError, refetch: refetchMissions } = useContentMissions(year, month)
  const { bucketStats, loading: bucketLoading, refetch: refetchBuckets } = useBucketStatus(year, month)

  function handlePrevMonth() {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  function handleNextMonth() {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  function handleDayClick(dateStr, mission) {
    setSelectedDate(dateStr)
    setSelectedMission(mission)
  }

  function handleModalClose() {
    setSelectedDate(null)
    setSelectedMission(null)
  }

  function handleMissionSaved() {
    refetchMissions()
    refetchBuckets()
    setSelectedDate(null)
    setSelectedMission(null)
  }

  // Loading state
  if (programsLoading && missionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  // Error state
  if (programsError || missionsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <h3 className="font-semibold mb-1">Error loading content calendar</h3>
        <p className="text-sm">{programsError || missionsError}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Content Calendar</h2>
        <p className="text-gray-500 mt-1">
          Plan and track daily content capture missions across programs
        </p>
      </div>

      {/* Bucket status dashboard */}
      <BucketStatusBar bucketStats={bucketStats} loading={bucketLoading} />

      {/* Calendar grid */}
      <CalendarGrid
        year={year}
        month={month}
        missions={missions}
        programs={programs}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onDayClick={handleDayClick}
      />

      {/* Mission modal */}
      {selectedDate && (
        <MissionModal
          date={selectedDate}
          mission={selectedMission}
          programs={programs}
          onClose={handleModalClose}
          onSaved={handleMissionSaved}
        />
      )}
    </div>
  )
}
