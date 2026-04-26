import { get, post, patch, del } from './client'

export function listSessions() {
  return get('/sessions')
}

export function createSession(name) {
  return post('/sessions', name ? { name } : {})
}

export function renameSession(id, name) {
  return patch(`/sessions/${id}`, { name })
}

export function deleteSession(id) {
  return del(`/sessions/${id}`)
}

export function getSessionMessages(sessionId, limit = 100) {
  return get(`/sessions/${sessionId}/messages?limit=${limit}`)
}
