import { useEffect, useState } from 'react'
import useAuthStore from '@/store/authStore'
import { farmerService } from '@/services/farmer.service'

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFarmers()
  }, [])

  const loadFarmers = async () => {
    setLoading(true)
    try {
      const data = await farmerService.getFarmers()
      setFarmers(Array.isArray(data) ? data : data.farmers || [])
    } catch (error) {
      console.error('Failed to load farmers:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🌾 Farmer Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.username} ({user?.role})
            </span>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Farmers List</h2>
          
          {loading ? (
            <div className="text-center py-8">Loading farmers...</div>
          ) : (
            <div className="space-y-4">
              {farmers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No farmers found</p>
              ) : (
                farmers.map((farmer: any) => (
                  <div key={farmer.id || farmer.farmer_id} className="border rounded p-4">
                    <h3 className="font-bold">
                      {farmer.first_name} {farmer.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Phone: {farmer.phone || farmer.primary_phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      ID: {farmer.farmer_id}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
