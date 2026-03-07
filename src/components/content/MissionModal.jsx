import { useState } from 'react'
import { X, Save, Trash2 } from 'lucide-react'
import { BUCKETS, TIME_BLOCKS, PHOTO_TARGET, VIDEO_TARGET, DEFAULT_CHECKLIST } from '../../lib/contentCalendarConstants'
import { useMissionMutations } from '../../hooks/useMissionMutations'
import ChecklistBlock from './ChecklistBlock'
import MediaCounter from './MediaCounter'

export default function MissionModal({ date, mission, programs, onClose, onSaved }) {
  const { createMission, updateMission, deleteMission, saving } = useMissionMutations()
  const isEditing = !!mission

  // Local form state
  const [programId, setProgramId] = useState(mission?.program_id || '')
  const [bucket, setBucket] = useState(mission?.bucket || '')
  const [checklist, setChecklist] = useState(mission?.checklist || DEFAULT_CHECKLIST)
  const [photosTaken, setPhotosTaken] = useState(mission?.photos_taken || 0)
  const [videosTaken, setVideosTaken] = useState(mission?.videos_taken || 0)
  const [uniformCheck, setUniformCheck] = useState(mission?.uniform_check || false)
  const [handoffNotes, setHandoffNotes] = useState(mission?.handoff_notes || '')
  const [status, setStatus] = useState(mission?.status || 'pending')
  const [formError, setFormError] = useState(null)

  // Format date for display
  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  function handleChecklistToggle(blockKey, itemKey) {
    setChecklist((prev) => ({
      ...prev,
      [blockKey]: {
        ...prev[blockKey],
        [itemKey]: !prev[blockKey][itemKey],
      },
    }))
  }

  async function handleSave() {
    if (!programId) {
      setFormError('Please select a program')
      return
    }
    if (!bucket) {
      setFormError('Please select a content bucket')
      return
    }
    setFormError(null)

    const payload = {
      date,
      program_id: programId,
      bucket,
      checklist,
      photos_taken: photosTaken,
      videos_taken: videosTaken,
      uniform_check: uniformCheck,
      handoff_notes: handoffNotes,
      status,
    }

    if (isEditing) {
      const { error } = await updateMission(mission.id, payload)
      if (!error) onSaved()
      else setFormError(error)
    } else {
      const { error } = await createMission(payload)
      if (!error) onSaved()
      else setFormError(error)
    }
  }

  async function handleDelete() {
    if (!mission) return
    const { error } = await deleteMission(mission.id)
    if (!error) onSaved()
    else setFormError(error)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-lg bg-white shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Mission' : 'New Mission'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{displayDate}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Error display */}
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {/* Program select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program
            </label>
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Select a program...</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age_range})
                </option>
              ))}
            </select>
          </div>

          {/* Bucket picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Bucket
            </label>
            <div className="flex flex-wrap gap-2">
              {BUCKETS.map((b) => (
                <button
                  key={b.key}
                  onClick={() => setBucket(b.key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    bucket === b.key
                      ? 'border-transparent text-white shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                  style={
                    bucket === b.key
                      ? { backgroundColor: b.color }
                      : {}
                  }
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist blocks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shot List
            </label>
            <div className="space-y-3">
              {TIME_BLOCKS.map((block) => (
                <ChecklistBlock
                  key={block.key}
                  block={block}
                  checklist={checklist[block.key] || {}}
                  onToggle={handleChecklistToggle}
                />
              ))}
            </div>
          </div>

          {/* Media counters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Media Captured
            </label>
            <div className="space-y-3">
              <MediaCounter
                label="Photos"
                value={photosTaken}
                target={PHOTO_TARGET}
                onChange={setPhotosTaken}
              />
              <MediaCounter
                label="Videos"
                value={videosTaken}
                target={VIDEO_TARGET}
                onChange={setVideosTaken}
              />
            </div>
          </div>

          {/* Uniform check toggle */}
          <div className="flex items-center justify-between py-3 border-t border-b border-gray-100">
            <div>
              <span className="text-sm font-medium text-gray-700">
                Uniform Check
              </span>
              <p className="text-xs text-gray-400 mt-0.5">
                All children in photos wearing clean uniforms?
              </p>
            </div>
            <button
              onClick={() => setUniformCheck(!uniformCheck)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                uniformCheck ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  uniformCheck ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Handoff notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Handoff Notes
            </label>
            <textarea
              value={handoffNotes}
              onChange={(e) => setHandoffNotes(e.target.value)}
              placeholder="What went well? Any notable moments? Post angle ideas..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="pending"
                  checked={status === 'pending'}
                  onChange={() => setStatus('pending')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Pending</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="completed"
                  checked={status === 'completed'}
                  onChange={() => setStatus('completed')}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Completed</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            {isEditing && (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : isEditing ? 'Update Mission' : 'Create Mission'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
