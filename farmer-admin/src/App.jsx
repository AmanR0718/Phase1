import React, { useState, useEffect } from 'react';
import { Users, FileText, Package, LogOut, Plus, Search, Eye, Edit } from 'lucide-react';

// API helper with fetch
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
};

export default function FarmerSupportPWA() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState('login');
  const [farmers, setFarmers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Check existing session
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('current_user');
    
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setPage(`${user.role}-dashboard`);
      } catch (e) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('current_user');
      }
    }
  }, []);

  // Fetch data when logged in
  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'operator')) {
      loadFarmers();
    }
  }, [currentUser]);

  const loadFarmers = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/farmers');
      setFarmers(data);
    } catch (error) {
      console.error('Error loading farmers:', error);
      showToast('Failed to load farmers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadOperators = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/users?role=operator');
      setOperators(data);
    } catch (error) {
      console.error('Error loading operators:', error);
      showToast('Failed to load operators', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      
      const body = credentials.nrc 
        ? { username: credentials.nrc, password: credentials.dob }
        : { username: credentials.email, password: credentials.password };

      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      
      const userData = credentials.nrc 
        ? { role: 'farmer', ...data.user }
        : data.user;
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('current_user', JSON.stringify(userData));
      setCurrentUser(userData);
      setPage(`${userData.role}-dashboard`);
      showToast(`Welcome ${userData.role}! 🎉`);
    } catch (error) {
      showToast(error.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    setCurrentUser(null);
    setPage('login');
    setFarmers([]);
    setOperators([]);
    showToast('Logged out successfully! 👋');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const LoginPage = () => {
    const [loginTab, setLoginTab] = useState('admin');
    const [credentials, setCredentials] = useState({
      email: '',
      password: '',
      nrc: '',
      dob: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleLogin(credentials);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-purple-600 mb-2">🌾 Farmer Support</h1>
            <p className="text-gray-600">Management System</p>
          </div>

          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            {['admin', 'operator', 'farmer'].map(tab => (
              <button
                key={tab}
                onClick={() => setLoginTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                  loginTab === tab ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab === 'admin' ? '👨‍💼 Admin' : tab === 'operator' ? '📋 Operator' : '👨‍🌾 Farmer'}
              </button>
            ))}
          </div>

          <div onSubmit={handleSubmit}>
            {(loginTab === 'admin' || loginTab === 'operator') ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📧 Email</label>
                  <input
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🔒 Password</label>
                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                    required
                    disabled={loading}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🆔 NRC Number</label>
                  <input
                    type="text"
                    value={credentials.nrc}
                    onChange={(e) => setCredentials({ ...credentials, nrc: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                    placeholder="123456/12/1"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🎂 Date of Birth</label>
                  <input
                    type="date"
                    value={credentials.dob}
                    onChange={(e) => setCredentials({ ...credentials, dob: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                `🚀 Login as ${loginTab}`
              )}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="mb-1">🔐 Connected to Backend API</p>
            <p className="text-xs">Status: Ready</p>
          </div>
        </div>
      </div>
    );
  };

  const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('farmers');

    useEffect(() => {
      if (activeTab === 'operators') {
        loadOperators();
      }
    }, [activeTab]);

    const stats = {
      totalOperators: operators.length,
      totalFarmers: farmers.length,
      totalLand: farmers.reduce((sum, f) => sum + parseFloat(f.land_size || 0), 0).toFixed(1)
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl md:text-3xl font-bold">🔧 Admin Dashboard</h1>
              <button
                onClick={handleLogout}
                className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-3xl font-bold mb-1">{stats.totalOperators}</div>
                <div className="text-sm opacity-90">👨‍💼 Operators</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-3xl font-bold mb-1">{stats.totalFarmers}</div>
                <div className="text-sm opacity-90">👨‍🌾 Farmers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-3xl font-bold mb-1">0</div>
                <div className="text-sm opacity-90">⏳ Pending</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-3xl font-bold mb-1">{stats.totalLand}</div>
                <div className="text-sm opacity-90">🌾 Land (ha)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
            <div className="flex">
              {[
                { key: 'farmers', label: '👨‍🌾 Farmers', count: farmers.length },
                { key: 'operators', label: '👨‍💼 Operators', count: operators.length },
                { key: 'supplies', label: '📦 Supplies', count: 0 }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3 px-4 font-semibold text-sm whitespace-nowrap ${
                    activeTab === tab.key ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'farmers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {farmers.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-600">
                      <Users size={48} className="mx-auto mb-4 text-gray-400" />
                      <p>No farmers registered yet.</p>
                    </div>
                  ) : (
                    farmers.map(farmer => (
                      <div key={farmer._id || farmer.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {farmer.first_name} {farmer.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">{farmer.nrc}</p>
                          </div>
                          <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                            active
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 space-y-1">
                          <p>📞 {farmer.phone}</p>
                          <p>📍 {farmer.district}</p>
                          <p>🌾 {farmer.land_size} ha</p>
                          <p className="text-xs text-gray-500">📅 {formatDate(farmer.created_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'operators' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {operators.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-600">
                      <Users size={48} className="mx-auto mb-4 text-gray-400" />
                      <p>No operators found.</p>
                    </div>
                  ) : (
                    operators.map(operator => (
                      <div key={operator._id || operator.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{operator.name || operator.email}</h3>
                            <p className="text-sm text-gray-600">{operator.email}</p>
                          </div>
                          <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                            {operator.role}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 space-y-1">
                          <p>👨‍🌾 {farmers.filter(f => f.operator_id === operator._id).length} farmers</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'supplies' && (
                <div className="text-center py-12 text-gray-600">
                  <Package size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>Supply requests feature coming soon</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const OperatorDashboard = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFarmers = searchQuery
      ? farmers.filter(f =>
          f.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.phone?.includes(searchQuery) ||
          f.nrc?.includes(searchQuery)
        )
      : farmers;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl md:text-3xl font-bold">📋 Operator Dashboard</h1>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-3xl font-bold mb-1">{farmers.length}</div>
                <div className="text-sm opacity-90">👨‍🌾 My Farmers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-3xl font-bold mb-1">
                  {farmers.filter(f => new Date(f.created_at).getMonth() === new Date().getMonth()).length}
                </div>
                <div className="text-sm opacity-90">📅 This Month</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-3xl font-bold mb-1">0</div>
                <div className="text-sm opacity-90">📄 Pending</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-3xl font-bold mb-1">
                  {farmers.reduce((sum, f) => sum + parseFloat(f.land_size || 0), 0).toFixed(1)}
                </div>
                <div className="text-sm opacity-90">🌾 Land</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="🔍 Search farmers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={() => showToast('Add farmer form coming soon', 'info')}
              className="bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 justify-center"
            >
              <Plus size={18} />
              Add Farmer
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFarmers.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-600">
                  {searchQuery ? 'No farmers found matching your search.' : 'No farmers assigned yet.'}
                </div>
              ) : (
                filteredFarmers.map(farmer => (
                  <div key={farmer._id || farmer.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {farmer.first_name} {farmer.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{farmer.nrc}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                        active
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1 mb-4">
                      <p>📞 {farmer.phone}</p>
                      <p>📧 {farmer.email || 'N/A'}</p>
                      <p>📍 {farmer.province}</p>
                      <p>🏘️ {farmer.district}</p>
                      <p>🌾 {farmer.land_size} ha</p>
                      <p className="text-xs text-gray-500">📅 {formatDate(farmer.created_at)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                        <Eye size={14} className="inline mr-1" />
                        View
                      </button>
                      <button className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
                        <Edit size={14} className="inline mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const FarmerDashboard = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold">👨‍🌾 My Profile</h1>
              <button
                onClick={handleLogout}
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Welcome, {currentUser?.first_name || 'Farmer'}!</h2>
            <p className="text-gray-600">Your farmer dashboard is connected to the backend.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-600' : 
          toast.type === 'error' ? 'bg-red-600' : 
          'bg-blue-600'
        } text-white font-semibold`}>
          {toast.message}
        </div>
      )}

      {page === 'login' && <LoginPage />}
      {page === 'admin-dashboard' && <AdminDashboard />}
      {page === 'operator-dashboard' && <OperatorDashboard />}
      {page === 'farmer-dashboard' && <FarmerDashboard />}
    </div>
  );
}