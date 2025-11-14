// frontend/src/pages/FarmerRegistration/index.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Step1Personal from './Step1Personal'
import Step2Address from './Step2Address'
import Step3Farm from './Step3Farm'
import Step4Preview from './Step4Preview'
import Step5PhotoUpload from './Step5PhotoUpload'
import Step6DocumentUpload from './Step6DocumentUpload'
import farmerService from '@/services/farmer.service'

export default function FarmerRegistration() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [farmerId, setFarmerId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    personal_info: {},
    address: {},
    farm_info: {},
  })

  const steps = [
    { num: 1, name: 'Personal Info', component: Step1Personal },
    { num: 2, name: 'Address', component: Step2Address },
    { num: 3, name: 'Farm Details', component: Step3Farm },
    { num: 4, name: 'Preview', component: Step4Preview },
    { num: 5, name: 'Photo', component: Step5PhotoUpload },
    { num: 6, name: 'Documents', component: Step6DocumentUpload },
  ]

  const handleStepComplete = async (stepData: any) => {
    const newFormData = { ...formData, ...stepData }
    setFormData(newFormData)

    // If completing step 4 (preview), create farmer
    if (currentStep === 4) {
      try {
        const response = await farmerService.create(newFormData)
        setFarmerId(response.farmer_id)
        setCurrentStep(5) // Move to photo upload
      } catch (error: any) {
        console.error('Failed to create farmer:', error)
        alert(error.response?.data?.detail || 'Failed to create farmer')
      }
    } else if (currentStep === 6) {
      // Registration complete
      alert('🎉 Farmer registration completed successfully!')
      navigate(`/farmers/${farmerId}`)
    } else {
      // Move to next step
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const CurrentStepComponent = steps[currentStep - 1].component

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Farmer Registration
          </h1>
          <p className="text-gray-600">
            Complete all steps to register a new farmer
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                      currentStep > step.num
                        ? 'bg-green-500 text-white'
                        : currentStep === step.num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {currentStep > step.num ? '✓' : step.num}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      currentStep === step.num
                        ? 'text-blue-600 font-semibold'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition ${
                      currentStep > step.num ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div>
          {currentStep <= 4 ? (
            <CurrentStepComponent
              data={formData}
              onNext={handleStepComplete}
              onBack={handleBack}
            />
          ) : currentStep === 5 && farmerId ? (
            <Step5PhotoUpload
              farmerId={farmerId}
              onNext={() => setCurrentStep(6)}
              onBack={handleBack}
            />
          ) : currentStep === 6 && farmerId ? (
            <Step6DocumentUpload
              farmerId={farmerId}
              onComplete={() => handleStepComplete({})}
              onBack={handleBack}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          )}
        </div>

        {/* Help Text */}
        {farmerId && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Farmer ID:</strong> {farmerId}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Basic registration completed. Complete photo and document uploads to finish.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}