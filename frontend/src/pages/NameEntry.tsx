import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateProfile } from '../services/api'

export function NameEntry() {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const createProfile = useCreateProfile()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Please enter your name')
      return
    }

    try {
      const profile = await createProfile.mutateAsync({ name: trimmedName })
      // Navigate to questionnaire with profile ID in state
      navigate('/questionnaire', { state: { profileId: profile.id } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            How to Work With Me
          </h1>
          <p className="text-lg text-gray-600">
            Create your personalized work profile
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                What's your name?
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={createProfile.isPending}
              className={`w-full px-6 py-3 text-lg font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                createProfile.isPending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {createProfile.isPending ? 'Creating...' : 'Get Started →'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 text-sm text-gray-600">
            <p className="mb-2">You'll be guided through 6 categories:</p>
            <ul className="space-y-1 ml-4">
              <li>• Communication Preferences</li>
              <li>• Work Style</li>
              <li>• Feedback Style</li>
              <li>• Strengths & Growing Areas</li>
              <li>• Pet Peeves & Energizers</li>
              <li>• Personal Context</li>
            </ul>
            <p className="mt-4 text-xs text-gray-500">
              Takes about 5-10 minutes to complete
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
