import { get, put } from './client'

export function getSettings() {
  return get('/settings')
}

export function updateSettings(data) {
  return put('/settings', data)
}
