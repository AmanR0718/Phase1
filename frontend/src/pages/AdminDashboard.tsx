import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import { farmerService } from '@/services/farmer.service'

export default function AdminDashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalOperators: 0,
    pendingVerifications: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // ✅ FIX: Pass limit and skip as separate parameters, not an object
      const data = await farmerService.getFarmers(5, 0)
      const farmersList = data.results || []
      setFarmers(farmersList)
      setStats({
        totalFarmers: data.count || farmersList.length,
        totalOperators: 0,
        pendingVerifications: 0,
      })
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">🛡️ Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.email} (Admin)
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Farmers</p>
                <p className="text-3xl font-bold">{stats.totalFarmers}</p>
              </div>
              <div className="text-4xl">🌾</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Operators</p>
                <p className="text-3xl font-bold">{stats.totalOperators}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Verifications</p>
                <p className="text-3xl font-bold">{stats.pendingVerifications}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/farmers/create')}
              className="p-4 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition"
            >
              <div className="text-3xl mb-2">🌾</div>
              <h3 className="font-bold">Create New Farmer</h3>
              <p className="text-sm text-gray-600">Register a new farmer profile</p>
            </button>
            
            <button
              onClick={() => navigate('/operators/manage')}
              className="p-4 border-2 border-green-600 rounded-lg hover:bg-green-50 transition"
            >
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-bold">Manage Operators</h3>
              <p className="text-sm text-gray-600">Create and manage operator accounts</p>
            </button>
            
            <button
              onClick={() => navigate('/farmers')}
              className="p-4 border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition"
            >
              <div className="text-3xl mb-2">📋</div>
              <h3 className="font-bold">View All Farmers</h3>
              <p className="text-sm text-gray-600">Browse and search farmer records</p>
            </button>
            
            <button
              onClick={() => navigate('/reports')}
              className="p-4 border-2 border-orange-600 rounded-lg hover:bg-orange-50 transition"
            >
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-bold">Reports & Analytics</h3>
              <p className="text-sm text-gray-600">View system reports and statistics</p>
            </button>
          </div>
        </div>

        {/* Recent Farmers */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Farmers</h2>
            <button
              onClick={() => navigate('/farmers')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All →
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : farmers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No farmers registered yet</p>
              <button
                onClick={() => navigate('/farmers/create')}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Create your first farmer →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* ✅ FIX: Added key prop */}
              {farmers.map((farmer: any) => (
                <div
                  key={farmer.farmer_id || farmer._id} 
                  className="border rounded p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/farmers/${farmer.farmer_id}`)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">
                        {farmer.personal_info?.first_name || farmer.first_name} {farmer.personal_info?.last_name || farmer.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        ID: {farmer.farmer_id} | Phone: {farmer.personal_info?.phone_primary || farmer.primary_phone || farmer.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {farmer.registration_status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
