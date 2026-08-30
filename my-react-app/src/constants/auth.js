import { API_URL } from './api'

// Get stored token
export const getToken = () => localStorage.getItem('token')

// Check if user is logged in
export const isAuthenticated = () => !!getToken()

// Store auth data after login/signup
export const setAuth = (token, userId) => {
  localStorage.setItem('token', token)
  localStorage.setItem('userId', userId)
}

// Clear auth data on logout
export const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  _profileCache = null
}

// Authenticated fetch wrapper — auto-attaches Bearer token,
// handles 401 (expired/invalid) by clearing auth and redirecting
export const authFetch = async (url, options = {}) => {
  const token = getToken()
  const headers = { ...options.headers }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }

  const res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    const data = await res.clone().json().catch(() => ({}))
    if (data.expired) {
      clearAuth()
      window.location.href = '/'
      throw new Error('Session expired. Please login again.')
    }
  }

  return res
}

// Profile API — session-level cache, re-fetches only after update/logout
let _profileCache = null

export const fetchProfile = async () => {
  if (_profileCache) {
    return _profileCache.clone()
  }
  const res = await authFetch(`${API_URL}/profile`)
  if (res.ok) {
    _profileCache = res.clone()
  }
  return res
}

export const invalidateProfileCache = () => {
  _profileCache = null
}

export const updateProfile = async (body) => {
  _profileCache = null
  const res = await authFetch(`${API_URL}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (res.ok) {
    // Re-fetch fresh profile and cache it
    const fresh = await authFetch(`${API_URL}/profile`)
    if (fresh.ok) _profileCache = fresh.clone()
    return fresh
  }
  return res
}
export const addAddress = (body) => {
  _profileCache = null
  return authFetch(`${API_URL}/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
export const updateAddress = (addressId, body) => {
  _profileCache = null
  return authFetch(`${API_URL}/addresses/${addressId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
export const deleteAddress = (addressId) => {
  _profileCache = null
  return authFetch(`${API_URL}/addresses/${addressId}`, {
    method: 'DELETE',
  })
}
