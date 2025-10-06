import { Profile, Question } from '../types/api'
import { CATEGORIES } from '../types/api'

interface ProfileViewCardProps {
  profile: Profile
  questions: Question[]
}

export function ProfileViewCard({ profile, questions }: ProfileViewCardProps) {
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
        <p className="text-lg opacity-90">How to Work With Me</p>
      </div>

      {/* Introduction */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 rounded">
        <p className="text-sm text-gray-700">
          👋 Welcome! {profile.name} has shared their work preferences to help you collaborate more effectively together.
        </p>
      </div>

      {/* Responses by category */}
      <div className="space-y-6">
        {CATEGORIES.map((category) => {
          const categoryResponses = profile.responses[category.id]
          if (!categoryResponses || Object.keys(categoryResponses).length === 0) {
            return null
          }

          return (
            <div key={category.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-1 h-8 bg-blue-600 rounded-full mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  {category.displayName}
                </h2>
              </div>

              <div className="space-y-4 ml-4">
                {Object.entries(categoryResponses).map(([questionId, response]) => (
                  <div key={questionId} className="border-l-2 border-gray-200 pl-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                      {getQuestionText(category.id, questionId)}
                    </h3>
                    <p className="text-base text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {formatResponse(response.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="inline-block bg-gray-100 rounded-lg px-6 py-4">
          <p className="text-xs text-gray-600 mb-1">
            Want to create your own "How to Work With Me" profile?
          </p>
          <a
            href="/"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Get Started →
          </a>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 text-xs text-gray-400 text-center">
        <p>Last updated: {new Date(profile.updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  )
}
