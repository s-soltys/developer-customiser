import { useParams } from 'react-router-dom'
import { useGetProfileByShareableId, useGetQuestions } from '../services/api'
import { ProfileViewCard } from '../components/ProfileViewCard'

export function ProfileView() {
  const { shareableId } = useParams<{ shareableId: string }>()

  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfileByShareableId(shareableId || '')
  const { data: questions, isLoading: questionsLoading } = useGetQuestions()

  if (profileLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">
            The profile you're looking for doesn't exist or has been removed.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your Own Profile
          </a>
        </div>
      </div>
    )
  }

  if (!questions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Unable to load questions</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ProfileViewCard profile={profile} questions={questions} />
    </div>
  )
}
