import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGetProfileById, useGetQuestions } from '../services/api'
import { SummaryCard } from '../components/SummaryCard'

interface LocationState {
  profileId: string
}

export function Summary() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const profileId = state?.profileId
  const [shareableLink, setShareableLink] = useState<string | undefined>()

  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfileById(profileId || '')
  const { data: questions, isLoading: questionsLoading } = useGetQuestions()

  if (!profileId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">No profile ID provided</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (profileLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">
            {profileError instanceof Error ? profileError.message : 'Failed to load profile'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!questions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No questions available</p>
      </div>
    )
  }

  const handleEdit = () => {
    // Navigate back to questionnaire with existing responses
    navigate('/questionnaire', {
      state: {
        profileId: profile.id,
        existingResponses: profile.responses,
      },
    })
  }

  const handleGenerateLink = () => {
    const link = `${window.location.origin}/share/${profile.shareableId}`
    setShareableLink(link)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SummaryCard
        profile={profile}
        questions={questions}
        onEdit={handleEdit}
        onGenerateLink={handleGenerateLink}
        shareableLink={shareableLink}
      />
    </div>
  )
}
