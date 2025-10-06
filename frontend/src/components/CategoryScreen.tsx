import { useState, useEffect } from 'react'
import { Question } from '../types/api'
import { QuestionInput } from './QuestionInput'

interface CategoryScreenProps {
  categoryId: string
  categoryName: string
  questions: Question[]
  initialResponses?: Record<string, string | string[]>
  onNext: (responses: Record<string, string | string[]>) => void
  onBack?: () => void
  showBack?: boolean
}

export function CategoryScreen({
  categoryId,
  categoryName,
  questions,
  initialResponses = {},
  onNext,
  onBack,
  showBack = false,
}: CategoryScreenProps) {
  const [responses, setResponses] = useState<Record<string, string | string[]>>(initialResponses)

  // Update responses when initialResponses changes (e.g., when navigating back)
  useEffect(() => {
    setResponses(initialResponses)
  }, [initialResponses])

  const handleResponseChange = (questionId: string, value: string | string[]) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const isComplete = questions.every((question) => {
    const response = responses[question.questionId]
    if (typeof response === 'string') {
      return response.trim().length > 0
    }
    if (Array.isArray(response)) {
      return response.length > 0
    }
    return false
  })

  const handleNext = () => {
    if (isComplete) {
      onNext(responses)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Category header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{categoryName}</h2>
        <p className="text-sm text-gray-600">
          Please answer all questions to continue
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question) => (
          <QuestionInput
            key={question.questionId}
            question={question}
            value={responses[question.questionId] || (question.type === 'MULTICHOICE' ? [] : '')}
            onChange={(value) => handleResponseChange(question.questionId, value)}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        {showBack && onBack ? (
          <button
            onClick={onBack}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            ← Back
          </button>
        ) : (
          <div /> // Empty div to maintain flex spacing
        )}

        <button
          onClick={handleNext}
          disabled={!isComplete}
          className={`px-6 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
            isComplete
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Next →
        </button>
      </div>

      {/* Completion indicator */}
      {!isComplete && (
        <p className="text-xs text-gray-500 text-center mt-4">
          Please answer all questions to enable the Next button
        </p>
      )}
    </div>
  )
}
