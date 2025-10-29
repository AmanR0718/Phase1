import { useEffect, useState } from "react";
import api from "../services/api";

export default function Farmers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFarmers = async () => {
    try {
      const res = await api.get("/api/farmers");
      setFarmers(res.data.results);
    } catch (err) {
      console.error("Failed to fetch farmers", err);
    } finally {
      setLoading(false);
    }
  };

  const generateID = async (farmerId) => {
    await api.post(`/api/farmers/${farmerId}/generate-idcard`);
    alert("ID Card generation started!");
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Farmer Management</h1>
      <table className="w-full border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Farmer ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">District</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {farmers.map((f) => (
            <tr key={f.farmer_id}>
              <td className="border p-2">{f.farmer_id}</td>
              <td className="border p-2">
                {f.personal_info?.first_name} {f.personal_info?.last_name}
              </td>
              <td className="border p-2">{f.address?.district}</td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => generateID(f.farmer_id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Generate ID
                </button>
                <a
                  href={`http://localhost:8000/api/farmers/${f.farmer_id}/download-idcard`}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
