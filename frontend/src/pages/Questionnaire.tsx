import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGetQuestions, useUpdateProfile } from '../services/api'
import { ProgressIndicator } from '../components/ProgressIndicator'
import { CategoryScreen } from '../components/CategoryScreen'
import { CATEGORIES } from '../types/api'
import type { Response } from '../types/api'

interface LocationState {
  profileId: string
  existingResponses?: Record<string, Record<string, Response>>
}

export function Questionnaire() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const profileId = state?.profileId
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [allResponses, setAllResponses] = useState<Record<string, Record<string, Response>>>(
    state?.existingResponses || {}
  )

  const { data: questions, isLoading, error } = useGetQuestions()
  const updateProfile = useUpdateProfile(profileId || '')

  // Redirect if no profile ID
  useEffect(() => {
    if (!profileId) {
      navigate('/')
    }
  }, [profileId, navigate])

  if (!profileId) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error.message}</p>
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

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No questions available</p>
      </div>
    )
  }

  const currentCategory = CATEGORIES[currentCategoryIndex]
  const categoryQuestions = questions
    .filter((q) => q.categoryId === currentCategory.id)
    .sort((a, b) => a.order - b.order)

  const handleNext = (responses: Record<string, string | string[]>) => {
    // Convert responses to API format with timestamps
    const formattedResponses: Record<string, Response> = {}
    Object.entries(responses).forEach(([questionId, value]) => {
      formattedResponses[questionId] = {
        value,
        answeredAt: new Date().toISOString(),
      }
    })

    // Update all responses with current category
    const updatedResponses = {
      ...allResponses,
      [currentCategory.id]: formattedResponses,
    }
    setAllResponses(updatedResponses)

    // Check if this was the last category
    if (currentCategoryIndex === CATEGORIES.length - 1) {
      // Submit to API and navigate to summary
      handleComplete(updatedResponses)
    } else {
      // Move to next category
      setCurrentCategoryIndex(currentCategoryIndex + 1)
    }
  }

  const handleBack = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1)
    }
  }

  const handleComplete = async (responses: Record<string, Record<string, Response>>) => {
    try {
      await updateProfile.mutateAsync({ responses })
      navigate('/summary', { state: { profileId } })
    } catch (err) {
      alert(`Failed to save responses: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Convert stored responses back to component format
  const initialResponses: Record<string, string | string[]> = {}
  const categoryResponses = allResponses[currentCategory.id]
  if (categoryResponses) {
    Object.entries(categoryResponses).forEach(([questionId, response]) => {
      initialResponses[questionId] = response.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress indicator */}
        <ProgressIndicator
          currentStep={currentCategoryIndex + 1}
          totalSteps={CATEGORIES.length}
        />

        {/* Category screen */}
        <div className="bg-white rounded-lg shadow-lg">
          <CategoryScreen
            categoryId={currentCategory.id}
            categoryName={currentCategory.displayName}
            questions={categoryQuestions}
            initialResponses={initialResponses}
            onNext={handleNext}
            onBack={handleBack}
            showBack={currentCategoryIndex > 0}
          />
        </div>

        {/* Status message */}
        {updateProfile.isPending && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
            Saving your responses...
          </div>
        )}
      </div>
    </div>
  )
}
