import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  return token ? <>{children}</> : <Navigate to="/" replace />
}

function LoginPage() {
  const { login, loading, error } = useAuthStore()
  const [role, setRole] = useState<'admin' | 'operator' | 'farmer'>('admin')
  const [form, setForm] = useState<any>({ email: '', password: '', nrc: '', dob: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload =
      role === 'farmer'
        ? { nrc: form.nrc, dob: form.dob }
        : { email: form.email, password: form.password }
    await login(payload, role)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">🌾 Farmer Support System</h1>
        <p className="login-subtitle">Zambian Agricultural Management</p>

        <div className="role-tabs">
          {['admin', 'operator', 'farmer'].map((r) => (
            <button
              key={r}
              className={`role-tab ${role === r ? 'active' : ''}`}
              onClick={() => setRole(r as any)}
            >
              {r === 'operator' ? 'Extension Officer' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {role === 'farmer' ? (
            <>
              <input
                placeholder="NRC Number"
                className="form-control mb-4"
                value={form.nrc}
                onChange={(e) => setForm({ ...form, nrc: e.target.value })}
              />
              <input
                type="date"
                className="form-control mb-4"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
            </>
          ) : (
            <>
              <input
                type="email"
                placeholder="Email"
                className="form-control mb-4"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                className="form-control mb-4"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
          {error && <p className="form-error mt-2">{error}</p>}
        </form>
      </div>
    </div>
  )
}


<Routes>
  <Route path="/" element={<LoginPage />} />
  <Route
    path="/dashboard"
    element={
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    }
  />
</Routes>
