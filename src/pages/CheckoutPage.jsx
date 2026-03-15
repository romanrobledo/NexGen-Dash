import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, CheckCircle2, UserX } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCheckinMutations } from '../hooks/useCheckinMutations'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { staff } = useAuth()
  const { submitCheckin, saving } = useCheckinMutations()

  const [rating, setRating] = useState(0)
  const [activities, setActivities] = useState('')
  const [improvements, setImprovements] = useState('')
  const [tomorrowPlan, setTomorrowPlan] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  async function handleSubmit() {
    if (!rating || !activities.trim()) return
    setError('')

    const { error: submitError } = await submitCheckin({
      staff_id: staff.id,
      type: 'checkout',
      rating,
      activities: activities.trim(),
      improvements: improvements.trim(),
      tomorrow_plan: tomorrowPlan.trim(),
    })

    if (submitError) {
      setError(submitError)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/'), 1500)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Check-out Submitted!</h2>
        <p className="text-gray-500 mt-2 text-sm">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <UserX className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Daily Check-out</h1>
            <p className="text-sm text-gray-400">{staff?.first_name} {staff?.last_name} &middot; {today}</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-7 space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            How was your day overall? <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                  rating === n
                    ? n >= 8
                      ? 'bg-emerald-500 text-white shadow-md'
                      : n >= 5
                        ? 'bg-amber-400 text-white shadow-md'
                        : 'bg-red-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs text-gray-400 mt-1.5">
              You selected <span className="font-semibold text-gray-600">{rating}/10</span>
            </p>
          )}
        </div>

        {/* Accomplishments */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            What did you accomplish today? <span className="text-red-400">*</span>
          </label>
          <textarea
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
            placeholder="Describe what you accomplished..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all resize-y placeholder:text-gray-300"
          />
        </div>

        {/* Challenges */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Any challenges or things to improve?
          </label>
          <textarea
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            placeholder="Challenges you faced or areas for improvement..."
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all resize-y placeholder:text-gray-300"
          />
        </div>

        {/* Tomorrow's Focus */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            What's your focus for tomorrow?
          </label>
          <textarea
            value={tomorrowPlan}
            onChange={(e) => setTomorrowPlan(e.target.value)}
            placeholder="Your priorities and plans for tomorrow..."
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all resize-y placeholder:text-gray-300"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving || !rating || !activities.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserX className="w-4 h-4" />
          )}
          {saving ? 'Submitting...' : 'Submit Check-out'}
        </button>
      </div>
    </div>
  )
}
