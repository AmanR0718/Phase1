import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { farmerService } from '@/services/farmer.service'

export default function FarmerRegistration() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Form data for all steps
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    first_name: '',
    last_name: '',
    primary_phone: '',
    alternate_phone: '',
    email: '',
    date_of_birth: '',
    gender: 'Male',
    permanent_address: {
      street: '',
      village: '',
      district: '',
      state: '',
      pincode: '',
    },
    farm_address_same: true,
    farm_address: {
      street: '',
      village: '',
      district: '',
      state: '',
      pincode: '',
    },
    government_id: {
      type: 'aadhaar',
      number: '',
    },
    
    // Step 2: Land Details
    land_parcels: [{
      area: 0,
      area_unit: 'acres',
      land_type: 'irrigated',
      ownership_status: 'owned',
      soil_type: '',
      water_sources: [],
    }],
    
    // Step 3: Farming Details
    current_crops: [{
      crop_name: '',
      variety: '',
      cultivation_area: 0,
      planting_date: '',
      expected_harvest_date: '',
      irrigation_method: '',
    }],
    
    // Step 4: Documents
    documents: [],
  })

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const result = await farmerService.createFarmer(formData)
      alert(`Farmer created successfully! ID: ${result.farmer_id}`)
      navigate('/admin-dashboard')
    } catch (error: any) {
      alert('Failed to create farmer: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">🌾 Farmer Registration</h1>
        
        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex-1 ${step < 4 ? 'mr-2' : ''}`}
            >
              <div
                className={`h-2 rounded ${
                  step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
              <p className={`text-xs mt-1 text-center ${
                step <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'
              }`}>
                Step {step}
              </p>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => updateFormData('first_name', e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => updateFormData('last_name', e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Primary Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.primary_phone}
                    onChange={(e) => updateFormData('primary_phone', e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.date_of_birth}
                    onChange={(e) => updateFormData('date_of_birth', e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateFormData('gender', e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-bold mb-2">Permanent Address</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Village/Street"
                    value={formData.permanent_address.village}
                    onChange={(e) => updateFormData('permanent_address', {
                      ...formData.permanent_address,
                      village: e.target.value
                    })}
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    placeholder="District"
                    value={formData.permanent_address.district}
                    onChange={(e) => updateFormData('permanent_address', {
                      ...formData.permanent_address,
                      district: e.target.value
                    })}
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    placeholder="State"
                    value={formData.permanent_address.state}
                    onChange={(e) => updateFormData('permanent_address', {
                      ...formData.permanent_address,
                      state: e.target.value
                    })}
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    placeholder="Pincode"
                    value={formData.permanent_address.pincode}
                    onChange={(e) => updateFormData('permanent_address', {
                      ...formData.permanent_address,
                      pincode: e.target.value
                    })}
                    className="px-3 py-2 border rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Land Details</h2>
              <p className="text-gray-600 mb-4">Add land parcel information</p>
              
              {formData.land_parcels.map((parcel, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded mb-4">
                  <h3 className="font-bold mb-2">Land Parcel {index + 1}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Area</label>
                      <input
                        type="number"
                        step="0.1"
                        value={parcel.area}
                        onChange={(e) => {
                          const updated = [...formData.land_parcels]
                          updated[index].area = parseFloat(e.target.value)
                          updateFormData('land_parcels', updated)
                        }}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Land Type</label>
                      <select
                        value={parcel.land_type}
                        onChange={(e) => {
                          const updated = [...formData.land_parcels]
                          updated[index].land_type = e.target.value
                          updateFormData('land_parcels', updated)
                        }}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="irrigated">Irrigated</option>
                        <option value="non-irrigated">Non-irrigated</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => updateFormData('land_parcels', [
                  ...formData.land_parcels,
                  { area: 0, land_type: 'irrigated', ownership_status: 'owned' }
                ])}
                className="text-blue-600 hover:text-blue-800"
              >
                + Add Another Parcel
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Farming Details</h2>
              <p className="text-gray-600 mb-4">Current crops and cultivation details</p>
              
              {formData.current_crops.map((crop, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded mb-4">
                  <h3 className="font-bold mb-2">Crop {index + 1}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Crop Name"
                      value={crop.crop_name}
                      onChange={(e) => {
                        const updated = [...formData.current_crops]
                        updated[index].crop_name = e.target.value
                        updateFormData('current_crops', updated)
                      }}
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      placeholder="Variety"
                      value={crop.variety}
                      onChange={(e) => {
                        const updated = [...formData.current_crops]
                        updated[index].variety = e.target.value
                        updateFormData('current_crops', updated)
                      }}
                      className="px-3 py-2 border rounded"
                    />
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => updateFormData('current_crops', [
                  ...formData.current_crops,
                  { crop_name: '', variety: '', cultivation_area: 0 }
                ])}
                className="text-blue-600 hover:text-blue-800"
              >
                + Add Another Crop
              </button>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Document Collection</h2>
              <p className="text-gray-600 mb-4">Upload required documents</p>
              
              <div className="space-y-4">
                <div className="p-4 border-2 border-dashed rounded text-center">
                  <p className="text-gray-500">Photo upload will be available after creating farmer</p>
                  <p className="text-sm text-gray-400">You can upload documents in the next step</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded">
                <h3 className="font-bold mb-2">Review & Submit</h3>
                <p className="text-sm text-gray-600">
                  ✓ Personal Information<br />
                  ✓ Land Details: {formData.land_parcels.length} parcel(s)<br />
                  ✓ Crops: {formData.current_crops.length} crop(s)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Farmer'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
