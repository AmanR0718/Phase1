// frontend/src/pages/OperatorDashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { farmerService } from '../services/farmer.service';
import { Farmer } from '../types/types';

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    myFarmers: 0,
    thisMonth: 0,
    pendingDocs: 0,
    totalLand: 0,
  });

  const loadOperatorData = useCallback(async () => {
    try {
      const data = await farmerService.list(0, 100);
      setFarmers(data.results);

      // Calculate stats
      const now = new Date();
      const thisMonth = data.results.filter((f: Farmer) => {
        const created = new Date(f.created_at);
        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      });

      setStats({
        myFarmers: data.results.length,
        thisMonth: thisMonth.length,
        pendingDocs: Math.floor(Math.random() * 10), // Replace with real data
        totalLand: data.results.reduce(
          (sum: number, f: Farmer) => sum + (f.farm_info?.farm_size_hectares || 0),
          0
        ),
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, []);

  useEffect(() => {
    loadOperatorData();
  }, [loadOperatorData]);

  const filteredFarmers = farmers.filter((farmer) =>
    `${farmer.personal_info?.first_name} ${farmer.personal_info?.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    farmer.personal_info?.phone_primary?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Operator Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/farmers/create')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <span>➕</span> Add Farmer
            </button>
            <button
              onClick={() => navigate('/documents')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <span>📄</span> Documents
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('access_token');
                navigate('/login');
              }}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
            <div className="text-4xl font-bold">{stats.myFarmers}</div>
            <div className="text-blue-100 text-sm">My Farmers</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
            <div className="text-4xl font-bold">{stats.thisMonth}</div>
            <div className="text-green-100 text-sm">This Month</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl">
            <div className="text-4xl font-bold">{stats.pendingDocs}</div>
            <div className="text-yellow-100 text-sm">Pending Docs</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
            <div className="text-4xl font-bold">{stats.totalLand.toFixed(1)}</div>
            <div className="text-purple-100 text-sm">Total Land (ha)</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search farmers by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Farmers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarmers.map((farmer: Farmer) => (
            <div
              key={farmer.farmer_id}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {farmer.personal_info?.first_name} {farmer.personal_info?.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">{farmer.farmer_id}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    farmer.registration_status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {farmer.registration_status}
                </span>
              </div>

              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p>📞 {farmer.personal_info?.phone_primary}</p>
                <p>📍 {farmer.address?.district}</p>
                <p>🌾 {farmer.farm_info?.farm_size_hectares || 0} hectares</p>
                <p>🌱 {farmer.farm_info?.crops_grown?.join(', ') || 'N/A'}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/farmers/${farmer.farmer_id}`)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
                >
                  View
                </button>
                <button
                  onClick={() => navigate(`/farmers/edit/${farmer.farmer_id}`)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => navigate(`/farmers/${farmer.farmer_id}/id-card`)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm"
                >
                  ID
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredFarmers.length === 0 && (
          <div className="text-center py-20 text-white">
            <div className="text-6xl mb-4">🌾</div>
            <h3 className="text-2xl font-bold mb-2">No farmers found</h3>
            <p className="text-blue-100 mb-6">
              {searchTerm ? 'Try a different search term' : 'Add your first farmer to get started'}
            </p>
            <button
              onClick={() => navigate('/farmers/create')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50"
            >
              Add Farmer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
