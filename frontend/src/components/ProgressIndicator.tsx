interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const percentage = (currentStep / totalSteps) * 100

  return (
    <div className="w-full mb-6">
      {/* Step counter */}
      <div className="text-sm font-medium text-gray-700 mb-2 text-center md:text-left">
        Step {currentStep} of {totalSteps}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-label={`Progress: step ${currentStep} of ${totalSteps}`}
        />
      </div>

      {/* Step indicators (optional, for larger screens) */}
      <div className="hidden md:flex justify-between mt-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={`text-xs font-medium ${
              step <= currentStep ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  )
}
