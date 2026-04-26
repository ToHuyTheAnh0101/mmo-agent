const BASE_URL = '/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('access_token')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Handle 401 — try refresh
  if (response.status === 401 && !options._retried) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      return request(endpoint, { ...options, _retried: true })
    }
    // Refresh failed — clear auth and redirect
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_id')
    window.location.href = '/login'
    throw new Error('Session expired')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  // Handle 204 No Content
  if (response.status === 204) return null

  return response.json()
}

async function tryRefreshToken() {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) return false

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) return false

    const data = await response.json()
    localStorage.setItem('access_token', data.access_token)
    return true
  } catch {
    return false
  }
}

export function get(endpoint) {
  return request(endpoint)
}

export function post(endpoint, data) {
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function put(endpoint, data) {
  return request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function patch(endpoint, data) {
  return request(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function del(endpoint) {
  return request(endpoint, { method: 'DELETE' })
}
