# 🌾 ZAMBIAN FARMER MANAGEMENT SYSTEM - COMPLETE PROJECT DOCUMENTATION
**Generated:** $(date)
**Author:** Codespace Extraction Script

---

## 📋 TABLE OF CONTENTS
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Backend Documentation](#backend-documentation)
5. [Frontend Documentation](#frontend-documentation)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Docker Configuration](#docker-configuration)
9. [Environment Variables](#environment-variables)
10. [Setup Instructions](#setup-instructions)

---

## 1. PROJECT OVERVIEW

### Description
Zambian Farmer Data Collection and Management System for tracking farmers, agricultural inputs, yields, and membership information.

### Repository
backup	https://github.com/AmanR0718/agri-phase1-backup.git (fetch)
backup	https://github.com/AmanR0718/agri-phase1-backup.git (push)
origin	https://github.com/AmanR0718/Phase1 (fetch)
origin	https://github.com/AmanR0718/Phase1 (push)

---

## 2. TECH STACK

### Backend
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.13.1",
    "localforage": "^1.10.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.5",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@eslint/js": "^9.36.0",
    "@types/node": "^24.10.0",
    "@types/react": "^19.1.16",
    "@types/react-dom": "^19.1.9",
    "@vitejs/plugin-react": "^5.0.4",
    "eslint": "^9.36.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.22",
    "globals": "^16.4.0",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.45.0",
    "vite": "^7.1.7"
  }
}
```

---




.
├── PROJECT_COMPLETE_DOCUMENTATION.md
├── Project Flow.txt
├── README.md
├── ZM1BFFA0F9_card.pdf
├── ZM5CC08BB8_card.pdf
├── ZM6AAC0450_card.pdf
├── backend
│   ├── Dockerfile
│   ├── app
│   │   ├── __pycache__
│   │   │   ├── config.cpython-311.pyc
│   │   │   ├── config.cpython-312.pyc
│   │   │   ├── database.cpython-311.pyc
│   │   │   ├── database.cpython-312.pyc
│   │   │   ├── main.cpython-311.pyc
│   │   │   └── main.cpython-312.pyc
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies
│   │   │   ├── __pycache__
│   │   │   └── roles.py
│   │   ├── main.py
│   │   ├── main.py.backup2
│   │   ├── models
│   │   │   ├── __pycache__
│   │   │   ├── farmer.py
│   │   │   └── user.py
│   │   ├── routes
│   │   │   ├── __pycache__
│   │   │   ├── auth.py
│   │   │   ├── farmers.py
│   │   │   ├── farmers.py.backup
│   │   │   ├── farmers_qr.py
│   │   │   ├── health.py
│   │   │   ├── sync.py
│   │   │   ├── uploads.py
│   │   │   └── users.py
│   │   ├── services
│   │   │   ├── __pycache__
│   │   │   └── farmer_service.py
│   │   ├── tasks
│   │   │   ├── __pycache__
│   │   │   ├── celery_app.py
│   │   │   ├── id_card_task.py
│   │   │   └── sync_tasks.py
│   │   └── utils
│   │       ├── __pycache__
│   │       ├── crypto_utils.py
│   │       └── security.py
│   ├── requirements.txt
│   ├── scripts
│   │   └── seed_admin.py
│   └── uploads
├── backend_routes.txt
├── c.monthlyfeeid
├── dependencies.txt
├── docker-compose.yml
├── fastapi_endpoints.txt
├── fix_cors.py
├── frontend
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   └── vite.svg
│   ├── src
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── components
│   │   │   ├── Header.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── RoleRoute.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── pages
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── CreateFarmer.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EditFarmer.tsx
│   │   │   ├── FarmerRegistration.tsx
│   │   │   ├── FarmerRegistration.tsx.bak
│   │   │   ├── FarmersList.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── OperatorDashboard.tsx
│   │   │   └── OperatorManagement.tsx
│   │   ├── services
│   │   │   ├── auth.service.ts
│   │   │   ├── farmer.service.ts
│   │   │   └── user.service.ts
│   │   ├── store
│   │   │   └── authStore.ts
│   │   └── utils
│   │       └── axios.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── frontend_api_calls.txt
├── frontend_backup
│   ├── app.js
│   ├── index.html
│   ├── package-lock.json
│   └── style.css
├── generate_docs.sh
├── mongo_clean.json
├── mongo_output.json
├── mongo_output.log
├── project_structure.txt
├── qr_test.json
├── qr_verify.json
├── requirements.txt
├── sync_payload.json
├── test_farmer.json
├── test_phase1_validation.sh
├── test_uploads
│   └── photo.jpg
└── uploads
    ├── idcards
    │   ├── ZM1BFFA0F9_card.pdf
    │   ├── ZM5CC08BB8_card.pdf
    │   └── ZM6AAC0450_card.pdf
    ├── photos
    │   ├── ZM1BFFA0F9
    │   │   └── ZM1BFFA0F9_photo.jpg
    │   ├── ZM5CC08BB8
    │   │   └── ZM5CC08BB8_photo.jpg
    │   └── ZM6AAC0450
    │       └── ZM6AAC0450_photo.jpg
    └── qr
        ├── ZM1BFFA0F9_qr.png
        ├── ZM5CC08BB8_qr.png
        └── ZM6AAC0450_qr.png

36 directories, 102 files
```
backend/scripts/seed_admin.py
backend/app/utils/security.py
backend/app/utils/crypto_utils.py
backend/app/main.py
backend/app/services/farmer_service.py
backend/app/routes/users.py
backend/app/routes/farmers_qr.py
backend/app/routes/health.py
backend/app/routes/uploads.py
backend/app/routes/sync.py
backend/app/routes/farmers.py
backend/app/routes/auth.py
backend/app/config.py
backend/app/dependencies/roles.py
backend/app/database.py
backend/app/models/user.py
backend/app/models/farmer.py
backend/app/tasks/id_card_task.py
backend/app/tasks/sync_tasks.py
backend/app/tasks/celery_app.py
```

### Main Application (main.py)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, farmers, sync, uploads, farmers_qr, health, users

app = FastAPI(title="Zambian Farmer System")

# CORS must be first middleware!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)

# Routes
app.include_router(health.router)
app.include_router(sync.router)
app.include_router(auth.router)
app.include_router(farmers.router)
app.include_router(uploads.router)
app.include_router(users.router)
app.include_router(farmers_qr.router)

@app.get("/")
async def root():
    return {"message": "API Running"}
```
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class PersonalInfo(BaseModel):
    first_name: str
    last_name: str
    phone_primary: str
class Address(BaseModel):
    province: str
    district: str
class FarmerCreate(BaseModel):
    temp_id: Optional[str] = None
    personal_info: PersonalInfo
    address: Address
class FarmerOut(BaseModel):
    farmer_id: str
    created_at: datetime
    registration_status: str
    # … other fields …
    _id: Optional[str] = None   # now not required```

### Pydantic Schemas

# File not found
```


```

### App.tsx (Routing)

import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RoleRoute } from '@/components/RoleRoute'

// Pages
import Login from '@/pages/Login'
import AdminDashboard from '@/pages/AdminDashboard'
import OperatorDashboard from '@/pages/OperatorDashboard'
import Dashboard from '@/pages/Dashboard'
import FarmerRegistration from '@/pages/FarmerRegistration'
import FarmersList from '@/pages/FarmersList'
import EditFarmer from '@/pages/EditFarmer'
import OperatorManagement from '@/pages/OperatorManagement'

function App() {
  const { loadUser, token, user } = useAuthStore()

  useEffect(() => {
    if (token) {
      loadUser()
    }
  }, [token])

  // Redirect based on role
  const getDashboardRoute = () => {
    if (!user) return '/login'
    const role = user.roles?.[0]?.toLowerCase()
    if (role === 'admin') return '/admin-dashboard'
    if (role === 'operator') return '/operator-dashboard'
    if (role === 'farmer') return '/farmer-dashboard'
    return '/login'
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute requiredRole="admin">
                <AdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/operators/manage"
          element={
            <ProtectedRoute>
              <RoleRoute requiredRole="admin">
                <OperatorManagement />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Operator Routes */}
        <Route
          path="/operator-dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute requiredRole="operator">
                <OperatorDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Shared Routes (Admin + Operator) - Farmers Management */}
        <Route
          path="/farmers"
          element={
            <ProtectedRoute>
              <RoleRoute requiredRole={['admin', 'operator']}>
                <FarmersList />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmers/create"
          element={
            <ProtectedRoute>
              <RoleRoute requiredRole={['admin', 'operator']}>
                <FarmerRegistration />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmers/edit/:farmerId"
          element={
            <ProtectedRoute>
              <RoleRoute requiredRole={['admin', 'operator']}>
                <EditFarmer />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Farmer Routes */}
        <Route
          path="/farmer-dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute requiredRole="farmer">
                <Dashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route 
          path="/" 
          element={
            token ? <Navigate to={getDashboardRoute()} replace /> : <Navigate to="/login" replace />
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```
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
```

### Dashboard

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
```
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function FarmersList() {
  const navigate = useNavigate()
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFarmers()
  }, [])

  const fetchFarmers = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')
      if (!token) {
        setError('❌ No token!')
        setLoading(false)
        return
      }

      // Use relative path - will automatically use current domain
      const response = await fetch('/api/farmers/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        setError(`❌ Error ${response.status}`)
        setLoading(false)
        return
      }

      const data = await response.json()
      const farmerList = Array.isArray(data) ? data : (data.results || data.farmers || [])
      setFarmers(farmerList)
      setLoading(false)
    } catch (err: any) {
      console.error('Error:', err.message)
      setError(`❌ ${err.message}`)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ backgroundColor: '#2563EB', color: 'white', padding: '15px 20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button onClick={() => navigate('/')} style={{ backgroundColor: '#2563EB', color: 'white', border: '2px solid white', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>← BACK</button>
        <h1 style={{ margin: 0 }}>All Farmers</h1>
      </div>

      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
        <button onClick={() => navigate('/farmers/create')} style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#16A34A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>➕ Add New</button>

        {error && <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '15px', marginBottom: '20px', borderRadius: '6px' }}>{error}</div>}
        {loading && <div style={{ backgroundColor: 'white', padding: '40px', textAlign: 'center', borderRadius: '6px' }}>⏳ Loading...</div>}

        {!loading && (
          <div style={{ backgroundColor: 'white', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '15px', backgroundColor: '#1F2937', color: 'white', fontWeight: 'bold' }}>📊 Farmers ({farmers.length})</div>
            {farmers.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No farmers</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#F3F4F6' }}>
                  <tr>
                    <th style={{ padding: '15px', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>First Name</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Last Name</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.map((f: any, i: number) => (
                    <tr key={f.farmer_id || i} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '15px' }}>{i + 1}</td>
                      <td style={{ padding: '15px', fontWeight: 'bold' }}>{f.personal_info?.first_name || '-'}</td>
                      <td style={{ padding: '15px' }}>{f.personal_info?.last_name || '-'}</td>
                      <td style={{ padding: '15px' }}>{f.personal_info?.phone_primary || '-'}</td>
                      <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                        <button onClick={() => navigate(`/farmers/edit/${f.farmer_id}`)} style={{ color: '#2563EB', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>✏️</button>
                        <button style={{ color: '#DC2626', border: 'none', background: 'transparent', cursor: 'pointer' }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

### Create Farmer Form

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type FormData = {
  farmer_name: string; nrc_no: string; phone: string; email: string; gender: string; date_of_birth: string
  chiefdom: string; district: string; province: string; zone_no: string; zone_name: string; locality: string
  total_land_holding: number; crops: Array<{ product: string; area_farmed: number; yield_estimate: number; yield_actual: number }>
  has_qr: boolean; member_fee_paid: boolean; member_fee_type: string; active_member: boolean
  agri_input_fee_paid: boolean; agri_input_fee_amount: number; agri_input_season: string; distribution_model: string; status: string
}

const PROVINCES = ['Central', 'Copperbelt', 'Eastern', 'Luapula', 'Lusaka', 'Muchinga', 'Northern', 'North-Western', 'Southern', 'Western']
const CROPS = ['Maize', 'Soya Beans', 'Groundnuts', 'Sunflower', 'Cotton', 'Wheat', 'Rice', 'Cassava', 'Sweet Potato', 'Tobacco']

export default function CreateFarmer() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormData>({
    farmer_name: '', nrc_no: '', phone: '', email: '', gender: '', date_of_birth: '',
    chiefdom: '', district: '', province: '', zone_no: '', zone_name: '', locality: '',
    total_land_holding: 0, crops: [{ product: '', area_farmed: 0, yield_estimate: 0, yield_actual: 0 }],
    has_qr: true, member_fee_paid: false, member_fee_type: '', active_member: true,
    agri_input_fee_paid: false, agri_input_fee_amount: 0, agri_input_season: '', distribution_model: 'FIFO', status: 'Active'
  })

  const update = (key: keyof FormData, val: any) => setForm(p => ({ ...p, [key]: val }))
  const updateCrop = (i: number, k: string, v: any) => {
    const c = [...form.crops]; c[i] = { ...c[i], [k]: v }; setForm(p => ({ ...p, crops: c }))
  }
  const addCrop = () => setForm(p => ({ ...p, crops: [...p.crops, { product: '', area_farmed: 0, yield_estimate: 0, yield_actual: 0 }] }))
  const rmCrop = (i: number) => setForm(p => ({ ...p, crops: p.crops.filter((_, idx) => idx !== i) }))

  const submit = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/api/farmers/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!resp.ok) throw new Error('Failed')
      alert('✅ Farmer Added!'); navigate('/farmers')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    page: { minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' },
    container: { maxWidth: '600px', margin: '0 auto' },
    card: { background: 'white', borderRadius: '15px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', padding: '40px', marginBottom: '20px' },
    title: { fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '10px', textAlign: 'center' as const },
    subtitle: { color: '#666', textAlign: 'center' as const, marginBottom: '30px', fontSize: '14px' },
    grid: { display: 'grid' as const, gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' },
    fieldGroup: { marginBottom: '15px' },
    label: { display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333', fontSize: '14px' },
    input: { width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', transition: 'all 0.3s' },
    select: { width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' },
    btn: { padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' },
    btnPrimary: { background: '#667eea', color: 'white' },
    btnSecondary: { background: '#f0f0f0', color: '#333', marginRight: '10px' },
    error: { background: '#fee', color: '#c33', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' },
    cropBox: { background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '2px solid #e0e0e0', marginBottom: '15px' }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.title}>🌾 Register Farmer</div>
          <div style={styles.subtitle}>Step {step} of 4</div>

          {error && <div style={styles.error}>❌ {error}</div>}

          {/* STEP 1: Personal */}
          {step === 1 && (
            <>
              <div style={styles.grid}>
                <div style={styles.fieldGroup}><label style={styles.label}>👤 Name *</label><input style={styles.input} type="text" placeholder="Full name" value={form.farmer_name} onChange={e => update('farmer_name', e.target.value)} /></div>
                <div style={styles.fieldGroup}><label style={styles.label}>🆔 NRC *</label><input style={styles.input} type="text" placeholder="123456/10/1" value={form.nrc_no} onChange={e => update('nrc_no', e.target.value)} /></div>
              </div>
              <div style={styles.grid}>
                <div style={styles.fieldGroup}><label style={styles.label}>📱 Phone *</label><input style={styles.input} type="tel" placeholder="+260..." value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
                <div style={styles.fieldGroup}><label style={styles.label}>📧 Email</label><input style={styles.input} type="email" placeholder="email@example.com" value={form.email} onChange={e => update('email', e.target.value)} /></div>
              </div>
              <div style={styles.grid}>
                <div style={styles.fieldGroup}><label style={styles.label}>👫 Gender</label><select style={styles.select} value={form.gender} onChange={e => update('gender', e.target.value)}><option>Select</option><option>Male</option><option>Female</option></select></div>
                <div style={styles.fieldGroup}><label style={styles.label}>🎂 DOB</label><input style={styles.input} type="date" value={form.date_of_birth} onChange={e => update('date_of_birth', e.target.value)} /></div>
              </div>
            </>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <>
              <div style={styles.grid}>
                <div style={styles.fieldGroup}><label style={styles.label}>🗺️ Province *</label><select style={styles.select} value={form.province} onChange={e => update('province', e.target.value)}><option>Select</option>{PROVINCES.map(p => <option key={p}>{p}</option>)}</select></div>
                <div style={styles.fieldGroup}><label style={styles.label}>📍 District *</label><input style={styles.input} type="text" placeholder="District" value={form.district} onChange={e => update('district', e.target.value)} /></div>
              </div>
              <div style={styles.grid}>
                <div style={styles.fieldGroup}><label style={styles.label}>👑 Chiefdom</label><input style={styles.input} type="text" placeholder="Chiefdom" value={form.chiefdom} onChange={e => update('chiefdom', e.target.value)} /></div>
                <div style={styles.fieldGroup}><label style={styles.label}>🏘️ Locality *</label><input style={styles.input} type="text" placeholder="Village" value={form.locality} onChange={e => update('locality', e.target.value)} /></div>
              </div>
              <div style={styles.grid}>
                <div style={styles.fieldGroup}><label style={styles.label}>📛 Zone No</label><input style={styles.input} type="text" placeholder="Z001" value={form.zone_no} onChange={e => update('zone_no', e.target.value)} /></div>
                <div style={styles.fieldGroup}><label style={styles.label}>🔤 Zone Name</label><input style={styles.input} type="text" placeholder="Zone A" value={form.zone_name} onChange={e => update('zone_name', e.target.value)} /></div>
              </div>
            </>
          )}

          {/* STEP 3: Farming */}
          {step === 3 && (
            <>
              <div style={styles.fieldGroup}><label style={styles.label}>🌾 Land Holding (ha) *</label><input style={styles.input} type="number" placeholder="2.5" value={form.total_land_holding} onChange={e => update('total_land_holding', parseFloat(e.target.value) || 0)} /></div>
              <div style={{ marginBottom: '20px' }}><label style={{...styles.label, marginBottom: '10px' }}>🌱 Crops & Yields</label><button onClick={addCrop} style={{...styles.btn, ...styles.btnPrimary, width: '100%', marginBottom: '10px'}}>+ Add Crop</button></div>
              {form.crops.map((c, i) => (
                <div key={i} style={styles.cropBox}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div><label style={{...styles.label, marginBottom: '5px'}}>Crop</label><select style={{...styles.select}} value={c.product} onChange={e => updateCrop(i, 'product', e.target.value)}><option>Select</option>{CROPS.map(cr => <option key={cr}>{cr}</option>)}</select></div>
                    <div><label style={{...styles.label, marginBottom: '5px'}}>Area (Ha)</label><input style={{...styles.input}} type="number" value={c.area_farmed} onChange={e => updateCrop(i, 'area_farmed', parseFloat(e.target.value) || 0)} /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div><label style={{...styles.label, marginBottom: '5px'}}>Est. Yield</label><input style={{...styles.input}} type="number" value={c.yield_estimate} onChange={e => updateCrop(i, 'yield_estimate', parseFloat(e.target.value) || 0)} /></div>
                    <div><label style={{...styles.label, marginBottom: '5px'}}>Actual Yield</label><input style={{...styles.input}} type="number" value={c.yield_actual} onChange={e => updateCrop(i, 'yield_actual', parseFloat(e.target.value) || 0)} /></div>
                  </div>
                  {form.crops.length > 1 && <button onClick={() => rmCrop(i)} style={{...styles.btn, background: '#ff6b6b', color: 'white', marginTop: '10px', width: '100%'}}>Remove</button>}
                </div>
              ))}
            </>
          )}

          {/* STEP 4: Membership */}
          {step === 4 && (
            <>
              <div style={styles.grid}>
                <div style={styles.fieldGroup}><label style={styles.label}>📋 Status</label><select style={styles.select} value={form.status} onChange={e => update('status', e.target.value)}><option>Active</option><option>Inactive</option><option>Pending</option></select></div>
                <div style={styles.fieldGroup}><label style={styles.label}>💰 Fee Type</label><select style={styles.select} value={form.member_fee_type} onChange={e => update('member_fee_type', e.target.value)}><option>Select</option><option>Annual</option><option>Half-Yearly</option></select></div>
              </div>
              <div style={styles.grid}>
                <div style={styles.fieldGroup}><label style={styles.label}>💵 Input Fee Amount</label><input style={styles.input} type="number" value={form.agri_input_fee_amount} onChange={e => update('agri_input_fee_amount', parseFloat(e.target.value) || 0)} /></div>
                <div style={styles.fieldGroup}><label style={styles.label}>📅 Season</label><input style={styles.input} type="text" placeholder="2024/2025" value={form.agri_input_season} onChange={e => update('agri_input_season', e.target.value)} /></div>
              </div>
              <div style={styles.fieldGroup}><label style={styles.label}>📦 Distribution</label><select style={styles.select} value={form.distribution_model} onChange={e => update('distribution_model', e.target.value)}><option>FIFO</option><option>Priority</option></select></div>
              <div style={{ display: 'grid', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><input type="checkbox" checked={form.has_qr} onChange={e => update('has_qr', e.target.checked)} /> QR Code Capability</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><input type="checkbox" checked={form.member_fee_paid} onChange={e => update('member_fee_paid', e.target.checked)} /> Member Fee Paid</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><input type="checkbox" checked={form.active_member} onChange={e => update('active_member', e.target.checked)} /> Active Member</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><input type="checkbox" checked={form.agri_input_fee_paid} onChange={e => update('agri_input_fee_paid', e.target.checked)} /> Input Fee Paid</label>
              </div>
            </>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '30px', justifyContent: 'space-between' }}>
            <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/farmers')} style={{...styles.btn, ...styles.btnSecondary, flex: 1}}>← {step === 1 ? 'Back' : 'Previous'}</button>
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} style={{...styles.btn, ...styles.btnPrimary, flex: 1}}>Next →</button>
            ) : (
              <button onClick={submit} disabled={loading} style={{...styles.btn, ...styles.btnPrimary, flex: 1, opacity: loading ? 0.6 : 1}}>{loading ? '⏳ Creating...' : '✅ Create Farmer'}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```


-- Unable to connect to database
```

#### Users Table

-- Unable to connect to database
```
# backend/app/routes/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from ..database import get_database
from ..utils.security import decode_token
from fastapi import Header

router = APIRouter(prefix="/api/users", tags=["Users"])

async def get_current_user(authorization: str = Header(None)):
    """Extract user from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    try:
        payload = decode_token(token)
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/")
async def get_users(role: str = Query(None), current_user = Depends(get_current_user)):
    """Get users by role (ADMIN only)"""
    db = get_database()
    
    if role:
        users = await db.users.find({"roles": {"$in": [role]}}).to_list(100)
    else:
        users = await db.users.find().to_list(100)
    
    # Remove password hashes before returning
    for user in users:
        user.pop("password_hash", None)
        user["_id"] = str(user.get("_id", ""))
    
    return users

@router.post("/")
async def create_user(user_data: dict, current_user = Depends(get_current_user)):
    """Create new user (ADMIN only)"""
    from ..utils.security import hash_password
    
    db = get_database()
    
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.get("email")})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create new user
    new_user = {
        "email": user_data.get("email"),
        "password_hash": hash_password(user_data.get("password", "defaultpassword")),
        "roles": user_data.get("roles", []),
        "is_active": True
    }
    
    result = await db.users.insert_one(new_user)
    new_user["_id"] = str(result.inserted_id)
    new_user.pop("password_hash", None)
    
    return new_user
# backend/app/routes/farmers_qr.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from app.utils.security import verify_qr_signature
from app.database import get_database
from app.dependencies.roles import require_role
import os

router = APIRouter(prefix="/api/farmers", tags=["Farmers QR & ID"])

# ✅ Verify QR authenticity
@router.post("/verify-qr")
async def verify_qr(payload: dict, db=Depends(get_database)):
    """
    Verify a QR payload signed with server secret.
    Expected payload: {"farmer_id": "...", "timestamp": "...", "signature": "..."}
    """
    farmer_id = payload.get("farmer_id")
    timestamp = payload.get("timestamp")
    signature = payload.get("signature")

    if not farmer_id or not timestamp or not signature:
        raise HTTPException(status_code=400, detail="Missing fields in payload")

    if not verify_qr_signature(payload):
        raise HTTPException(status_code=400, detail="Invalid or tampered QR signature")

    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    return {
        "verified": True,
        "farmer_id": farmer_id,
        "name": f"{farmer['personal_info']['first_name']} {farmer['personal_info']['last_name']}",
        "province": farmer["address"].get("province"),
        "district": farmer["address"].get("district"),
    }

# ✅ Secure ID card PDF download
@router.get("/{farmer_id}/download-idcard",
            dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))])
async def download_idcard(farmer_id: str, db=Depends(get_database)):
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    file_path = farmer.get("id_card_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="ID card not generated yet")

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=f"{farmer_id}_card.pdf"
    )
# backend/app/routes/health.py
from fastapi import APIRouter
from pymongo import MongoClient
from redis import Redis
from celery import Celery
import os

router = APIRouter(prefix="/health", tags=["Health"])

# Initialize Celery
celery_app = Celery("farmer_sync", broker=os.getenv("REDIS_URL", "redis://redis:6379/0"))

@router.get("/full")
def full_health_check():
    status = {
        "mongo": False,
        "redis": False,
        "celery": False,
        "disk": False,
    }

    # MongoDB check
    try:
        mongo_url = os.getenv("MONGODB_URL")
        client = MongoClient(mongo_url, serverSelectionTimeoutMS=2000)
        client.server_info()
        status["mongo"] = True
    except Exception as e:
        status["mongo_error"] = str(e)

    # Redis check
    try:
        redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
        redis_client = Redis.from_url(redis_url)
        redis_client.ping()
        status["redis"] = True
    except Exception as e:
        status["redis_error"] = str(e)

    # Celery check
    try:
        ping = celery_app.control.ping(timeout=2)
        status["celery"] = bool(ping)
    except Exception as e:
        status["celery_error"] = str(e)

    # Disk write check
    try:
        test_path = os.path.join(os.getenv("UPLOAD_DIR", "./uploads"), "health_test.txt")
        with open(test_path, "w") as f:
            f.write("ok")
        os.remove(test_path)
        status["disk"] = True
    except Exception as e:
        status["disk_error"] = str(e)

    all_ok = all(status[k] for k in ["mongo", "redis", "celery", "disk"])
    return {"status": "ok" if all_ok else "degraded", "components": status}
# backend/app/routes/uploads.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from pathlib import Path
from app.database import get_database
from app.dependencies.roles import require_role
import shutil

router = APIRouter(prefix="/api/farmers", tags=["Uploads"])

UPLOAD_ROOT = Path("uploads")
MAX_FILE_SIZE_MB = 5
ALLOWED_PHOTO_TYPES = {"image/jpeg", "image/png"}
ALLOWED_DOC_TYPES = {"image/jpeg", "image/png", "application/pdf"}

async def save_file(file: UploadFile, dest: Path):
    dest.parent.mkdir(parents=True, exist_ok=True)
    with dest.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

@router.post("/{farmer_id}/upload-photo",
            dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))])
async def upload_photo(farmer_id: str, file: UploadFile = File(...),
                db=Depends(get_database)):
    if file.content_type not in ALLOWED_PHOTO_TYPES:
        raise HTTPException(400, "Invalid photo type")
    if file.size and file.size > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, "File too large")

    filename = f"{farmer_id}_photo{Path(file.filename).suffix}"
    dest = UPLOAD_ROOT / "photos" / farmer_id / filename
    await save_file(file, dest)

    path = f"/uploads/photos/{farmer_id}/{filename}"
    await db.farmers.update_one({"farmer_id": farmer_id},
                                {"$set": {"photo_path": path}})
    return {"message": "Photo uploaded", "photo_path": path}

@router.post("/{farmer_id}/upload-document",
            dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))])
async def upload_document(farmer_id: str, document_type: str,
                        file: UploadFile = File(...),
                        db=Depends(get_database)):
    if file.content_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(400, "Invalid document type")

    filename = f"{farmer_id}_{document_type}{Path(file.filename).suffix}"
    dest = UPLOAD_ROOT / "docs" / farmer_id / filename
    await save_file(file, dest)

    path = f"/uploads/docs/{farmer_id}/{filename}"
    await db.farmers.update_one(
        {"farmer_id": farmer_id},
        {"$push": {"identification_documents": {
            "doc_type": document_type,
            "file_path": path
        }}})
    return {"message": f"{document_type} uploaded", "path": path}
# backend/app/routes/sync.py
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from ..utils.security import decode_token
from ..tasks.celery_app import celery_app
from ..tasks.sync_tasks import process_sync_batch
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/sync", tags=["Sync"])

class SyncRecord(BaseModel):
    temp_id: Optional[str]
    nrc_number: Optional[str] = None
    personal_info: dict
    address: dict

class SyncRequest(BaseModel):
    farmers: List[SyncRecord]
    last_sync: Optional[str] = None

async def get_current_user(authorization: str | None = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        scheme, token = authorization.split()
        payload = decode_token(token)
        return payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/batch")
async def sync_batch(payload: SyncRequest, current_user=Depends(get_current_user)):
    # enqueue Celery job and return job id
    farmers_payload = [f.dict() for f in payload.farmers]
    task = process_sync_batch.apply_async(args=[current_user, farmers_payload])
    return {"job_id": task.id, "status": "queued"}

@router.get("/status")
async def sync_status(job_id: str = Query(...), current_user=Depends(get_current_user)):
    async_result = celery_app.AsyncResult(job_id)
    state = async_result.state
    result = None
    if async_result.ready():
        result = async_result.result
    return {"job_id": job_id, "state": state, "result": result}
# backend/app/routes/farmers.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from uuid import uuid4
from datetime import datetime
from app.tasks.id_card_task import generate_id_card

from ..models.farmer import FarmerCreate, FarmerOut
from ..database import get_database
from ..services.farmer_service import FarmerService
from ..dependencies.roles import require_role

router = APIRouter(prefix="/api/farmers", tags=["Farmers"])


# Helper function to convert MongoDB document to JSON-serializable dict
def farmer_helper(farmer) -> dict:
    """Convert MongoDB document to dict with string IDs"""
    farmer["_id"] = str(farmer["_id"])  # Convert ObjectId to string
    return farmer


# ✅ Create farmer (ADMIN or OPERATOR only)
@router.post("/", response_model=FarmerOut, status_code=201,
            dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))])
async def create_farmer(farmer: FarmerCreate, db=Depends(get_database)):
    data = farmer.dict()

    FarmerService.validate_farmer_data(data)
    data = FarmerService.encrypt_sensitive_fields(data)

    data["farmer_id"] = "ZM" + uuid4().hex[:8].upper()
    data["created_at"] = datetime.utcnow()
    data["registration_status"] = "pending"

    result = await db.farmers.insert_one(data)
    return FarmerOut(**data)


# ✅ Get list of farmers (ADMIN, OPERATOR, VIEWER) - FIXED
@router.get("/", dependencies=[Depends(require_role(["ADMIN", "OPERATOR", "VIEWER"]))])
async def list_farmers(skip: int = 0, limit: int = 10, db=Depends(get_database)):
    farmers = await db.farmers.find().skip(skip).limit(limit).to_list(length=limit)
    # Convert ObjectIds to strings
    farmers = [farmer_helper(farmer) for farmer in farmers]
    return {"count": len(farmers), "results": farmers}


# ✅ Get single farmer (any authenticated role) - FIXED
@router.get("/{farmer_id}", dependencies=[Depends(require_role(["ADMIN", "OPERATOR", "VIEWER"]))])
async def get_farmer(farmer_id: str, db=Depends(get_database)):
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return farmer_helper(farmer)


# ✅ Update farmer (ADMIN, OPERATOR)
@router.put("/{farmer_id}", dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))])
async def update_farmer(farmer_id: str, payload: dict, db=Depends(get_database)):
    result = await db.farmers.update_one({"farmer_id": farmer_id}, {"$set": payload})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Farmer not found or no changes made")
    
    # Return updated farmer
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    return farmer_helper(farmer)


# ✅ Delete farmer (ADMIN only)
@router.delete("/{farmer_id}", dependencies=[Depends(require_role(["ADMIN"]))])
async def delete_farmer(farmer_id: str, db=Depends(get_database)):
    result = await db.farmers.delete_one({"farmer_id": farmer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return {"message": "Farmer deleted successfully"}
# backend/app/routes/auth.py
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from fastapi import Header
from ..database import get_database
from ..utils.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class LoginIn(BaseModel):
    username: str
    password: str

class RefreshIn(BaseModel):
    refresh_token: str

@router.post("/login")
async def login(payload: LoginIn):
    db = get_database()
    user_doc = await db.users.find_one({"email": payload.username.lower().strip()})
    if not user_doc or not verify_password(payload.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(user_doc["email"])
    refresh_token = create_refresh_token(user_doc["email"])
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {"email": user_doc["email"], "roles": user_doc.get("roles", [])}
    }

@router.post("/refresh")
async def refresh_token(payload: RefreshIn):
    try:
        data = decode_token(payload.refresh_token)
        if data.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        new_access_token = create_access_token(data["sub"])
        return {"access_token": new_access_token, "token_type": "bearer"}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")


@router.get("/me")
async def get_current_user(authorization: str | None = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        scheme, token = authorization.split()
        payload = decode_token(token)
        email = payload.get("sub")
        db = get_database()
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "email": user["email"],
            "roles": user.get("roles", []),
            "token_type": payload.get("type")
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")```

### API Endpoint Summary

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

#### Farmers
- `GET /api/farmers/` - List all farmers
- `POST /api/farmers/` - Create farmer
- `GET /api/farmers/{id}` - Get farmer by ID
- `PUT /api/farmers/{id}` - Update farmer
- `DELETE /api/farmers/{id}` - Delete farmer
- `GET /api/farmers/qr/{qr_code}` - Get farmer by QR

#### Uploads
- `POST /api/uploads/` - Upload files

#### Sync
- `POST /api/sync/` - Sync offline data

---

## 8. DOCKER CONFIGURATION

### docker-compose.yml

services:
  farmer-backend:
    build:
      context: ./backend
    container_name: farmer-backend
    ports:
      - "8000:8000"
    depends_on:
      - farmer-mongo
      - farmer-redis
    env_file:
      - backend/.env
    volumes:
      - ./backend:/app
      - ./uploads:/app/uploads
    restart: always

  farmer-worker:
    build:
      context: ./backend
    container_name: farmer-worker
    command: >
      sh -c "celery -A app.tasks.celery_app.celery_app worker --loglevel=info"
    depends_on:
      - farmer-mongo
      - farmer-redis
    env_file:
      - backend/.env
    volumes:
      - ./backend:/app
      - ./uploads:/app/uploads
    restart: always
    healthcheck:
      test: ["CMD", "celery", "-A", "app.tasks.celery_app.celery_app", "inspect", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5


  farmer-redis:
    image: redis:7.0
    container_name: farmer-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  farmer-mongo:
    image: mongo:7.0
    container_name: farmer-mongo
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: Admin123
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mongo_data:
```
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# ---------- Install required system tools and image libraries ----------
RUN apt-get update && apt-get install -y \
    curl \
    netcat-openbsd \
    libjpeg-dev \
    zlib1g-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# ---------- Install Python dependencies ----------
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# ---------- Copy app code ----------
COPY app ./app
COPY .env ./.env
COPY scripts ./scripts

# ---------- Healthcheck ----------
HEALTHCHECK CMD curl --fail http://localhost:8000/health || exit 1

# ---------- Run server ----------
CMD ["sh", "-c", "until nc -z farmer-mongo 27017; do echo '⏳ Waiting for Mongo...'; sleep 3; done && \
echo '✅ Mongo is ready! Starting backend...' && \
python scripts/seed_admin.py || true && \
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
```

### Running Containers

NAMES            STATUS                     PORTS
farmer-backend   Up 6 minutes (unhealthy)   0.0.0.0:8000->8000/tcp, [::]:8000->8000/tcp
farmer-worker    Up 6 minutes (unhealthy)   
```
# ============================================
# MongoDB Configuration
# ============================================
MONGODB_URL=mongodb://admin:Admin123@farmer-mongo:27017/zambian_farmer_db?authSource=admin
MONGODB_DB_NAME=zambian_farmer_db

# ============================================
# JWT + Encryption
# ============================================
JWT_SECRET=58073eebc4dbe24af6de85a541363740bc82bab47eeccf7f90b4a1d52995418f
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ============================================
# Admin Seeder Credentials
# ============================================
SEED_ADMIN_EMAIL=admin@agrimanage.com
SEED_ADMIN_PASSWORD=admin123

# ============================================
# Redis (Celery)
# ============================================
REDIS_URL=redis://farmer-redis:6379/0

# ============================================
# App Settings
# ============================================
DEBUG=True
ALLOWED_ORIGINS=["http://localhost:8000","http://localhost:19006"]
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=10

# ============================================
# Optional Internal Secret
# ============================================
SECRET_KEY=supersecretkey_agrimanage_2025
```

### Frontend .env

# File not found or secured
```
 SETUP INSTRUCTIONS
Prerequisites
Docker & Docker Compose

Node.js 18+

Python 3.11+

Backend Setup
text
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Frontend Setup
text
cd frontend
npm install
npm run dev
Docker Setup
text
docker-compose up -d
docker-compose logs -f farmer-backend
Access Points
Frontend: http://localhost:5173

Backend API: http://localhost:8000

API Docs: http://localhost:8000/docs

Database: localhost:5432

📊 DATA FORMATS
Farmer Creation Request Body
text
{
  "farmer_name": "John Doe",
  "nrc_no": "123456/10/1",
  "phone": "+260977123456",
  "email": "john@example.com",
  "gender": "Male",
  "date_of_birth": "1990-01-01",
  "province": "Lusaka",
  "district": "Lusaka",
  "chiefdom": "Chief Nkomesha",
  "locality": "Kaunda Square",
  "zone_no": "Z001",
  "zone_name": "Zone A",
  "total_land_holding": 5.5,
  "crops": [
    {
      "product": "Maize",
      "area_farmed": 2.5,
      "yield_estimate": 10.0,
      "yield_actual": 9.5
    }
  ],
  "has_qr": true,
  "member_fee_paid": true,
  "member_fee_type": "Annual",
  "active_member": true,
  "agri_input_fee_paid": false,
  "agri_input_fee_amount": 500.0,
  "agri_input_season": "2024/2025",
  "distribution_model": "FIFO",
  "status": "Active"
}
Login Request
text
{
  "email": "admin@agrimanage.com",
  "password": "password123"
}
Login Response
text
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "bearer",
  "user": {
    "user_id": 1,
    "email": "admin@agrimanage.com",
    "full_name": "Admin User",
    "role": "admin"
  }
}
🔐 AUTHENTICATION
All protected endpoints require JWT Bearer token:

text
Authorization: Bearer <access_token>
📝 NOTES
Backend runs on port 8000

Frontend runs on port 5173

PostgreSQL on port 5432

Redis on port 6379

All API routes are prefixed with /api

CORS is enabled for all origins in development

cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000


