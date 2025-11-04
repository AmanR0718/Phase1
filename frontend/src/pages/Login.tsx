import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState('admin')
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(username, password)
      navigate(`/${userType}-dashboard`)
    } catch (err) {
      console.error('Login failed')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl w-96">
        <h1 className="text-3xl font-bold mb-6 text-center">🌾 Farmer System</h1>

        {/* Role Tabs */}
        <div className="flex gap-2 mb-6">
          {['admin', 'operator', 'farmer'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setUserType(role)}
              className={`flex-1 py-2 rounded font-medium transition ${
                userType === role
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        {/* Form Fields */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {/* Demo Credentials */}
        <div className="mt-6 p-3 bg-gray-50 rounded text-xs">
          <p className="font-medium mb-1">Demo Credentials:</p>
          <p>Admin: admin / password</p>
        </div>
      </form>
    </div>
  )
}
