export function sendMessage(sessionId, message) {
  const token = localStorage.getItem('access_token')
  return fetch(`/api/chat/${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  })
}
