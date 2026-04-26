import { post } from './client'

export function login(email, password) {
  return post('/auth/login', { email, password })
}

export function register(email, password) {
  return post('/auth/register', { email, password })
}

export function refreshToken(refresh_token) {
  return post('/auth/refresh', { refresh_token })
}
