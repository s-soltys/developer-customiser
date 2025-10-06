import { Question } from '../types/api'

interface QuestionInputProps {
  question: Question
  value: string | string[]
  onChange: (value: string | string[]) => void
}

export function QuestionInput({ question, value, onChange }: QuestionInputProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const handleChoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleMultiChoiceChange = (selectedValue: string) => {
    const currentValues = Array.isArray(value) ? value : []
    const newValues = currentValues.includes(selectedValue)
      ? currentValues.filter((v) => v !== selectedValue)
      : [...currentValues, selectedValue]
    onChange(newValues)
  }

  // TEXT type - textarea
  if (question.type === 'TEXT') {
    return (
      <div className="mb-6">
        <label htmlFor={question.questionId} className="block text-sm font-medium text-gray-700 mb-2">
          {question.text}
        </label>
        <textarea
          id={question.questionId}
          value={typeof value === 'string' ? value : ''}
          onChange={handleTextChange}
          placeholder={question.placeholder}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
    )
  }

  // CHOICE type - radio buttons
  if (question.type === 'CHOICE') {
    return (
      <div className="mb-6">
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-3">
            {question.text}
          </legend>
          <div className="space-y-2">
            {question.choices?.map((choice) => (
              <label
                key={choice}
                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name={question.questionId}
                  value={choice}
                  checked={value === choice}
                  onChange={handleChoiceChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-900">{choice}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    )
  }

  // MULTICHOICE type - checkboxes
  if (question.type === 'MULTICHOICE') {
    const selectedValues = Array.isArray(value) ? value : []

    return (
      <div className="mb-6">
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-3">
            {question.text}
          </legend>
          <div className="space-y-2">
            {question.choices?.map((choice) => (
              <label
                key={choice}
                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  value={choice}
                  checked={selectedValues.includes(choice)}
                  onChange={() => handleMultiChoiceChange(choice)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-900">{choice}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    )
  }

  return null
}
