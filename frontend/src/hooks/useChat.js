import { useState, useEffect, useCallback } from 'react'
import { listSessions, createSession, renameSession, deleteSession } from '../api/sessions'

export function useChat() {
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [streaming, setStreaming] = useState(false)

  const fetchSessions = useCallback(async () => {
    try {
      const data = await listSessions()
      setSessions(data)
      return data
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
      return []
    }
  }, [])

  useEffect(() => {
    fetchSessions().then((data) => {
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id)
      }
      setLoading(false)
    })
  }, [fetchSessions, activeSessionId])

  const handleCreateSession = async () => {
    try {
      const session = await createSession()
      setSessions((prev) => [session, ...prev])
      setActiveSessionId(session.id)
      setMessages([])
    } catch (err) {
      console.error('Failed to create session:', err)
    }
  }

  const handleRenameSession = async (id, name) => {
    try {
      const updated = await renameSession(id, name)
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)))
    } catch (err) {
      console.error('Failed to rename session:', err)
    }
  }

  const handleDeleteSession = async (id) => {
    try {
      await deleteSession(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
      if (activeSessionId === id) {
        const remaining = sessions.filter((s) => s.id !== id)
        setActiveSessionId(remaining.length > 0 ? remaining[0].id : null)
        setMessages([])
      }
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    setMessages,
    loading,
    streaming,
    setStreaming,
    fetchSessions,
    handleCreateSession,
    handleRenameSession,
    handleDeleteSession,
  }
}
