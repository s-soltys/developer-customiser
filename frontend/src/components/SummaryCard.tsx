import { Profile, Question } from '../types/api'
import { CATEGORIES } from '../types/api'

interface SummaryCardProps {
  profile: Profile
  questions: Question[]
  onEdit?: () => void
  onGenerateLink?: () => void
  shareableLink?: string
}

export function SummaryCard({
  profile,
  questions,
  onEdit,
  onGenerateLink,
  shareableLink,
}: SummaryCardProps) {
  const handleCopyLink = async () => {
    if (shareableLink) {
      await navigator.clipboard.writeText(shareableLink)
      // You could add a toast notification here
      alert('Link copied to clipboard!')
    }
  }

  const getQuestionText = (categoryId: string, questionId: string): string => {
    const question = questions.find(
      (q) => q.categoryId === categoryId && q.questionId === questionId
    )
    return question?.text || questionId
  }

  const formatResponse = (value: string | string[]): string => {
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    return value
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{profile.name}</h1>
        <p className="text-sm text-gray-600">How to Work With Me</p>
      </div>

      {/* Responses by category */}
      <div className="space-y-6">
        {CATEGORIES.map((category) => {
          const categoryResponses = profile.responses[category.id]
          if (!categoryResponses || Object.keys(categoryResponses).length === 0) {
            return null
          }

          return (
            <div key={category.id} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">
                {category.displayName}
              </h2>
              <div className="space-y-4">
                {Object.entries(categoryResponses).map(([questionId, response]) => (
                  <div key={questionId}>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                      {getQuestionText(category.id, questionId)}
                    </h3>
                    <p className="text-base text-gray-900 whitespace-pre-wrap">
                      {formatResponse(response.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="mt-8 space-y-4">
        {/* Edit button */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-full md:w-auto px-6 py-3 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            ✏️ Edit Profile
          </button>
        )}

        {/* Generate/Copy shareable link */}
        {!shareableLink && onGenerateLink && (
          <button
            onClick={onGenerateLink}
            className="w-full md:w-auto px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors md:ml-4"
          >
            🔗 Generate Shareable Link
          </button>
        )}

        {shareableLink && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Shareable Link:</p>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                value={shareableLink}
                readOnly
                className="flex-1 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                📋 Copy Link
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>Created: {new Date(profile.createdAt).toLocaleDateString()}</p>
        <p>Last updated: {new Date(profile.updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  )
}
