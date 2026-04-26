import { useState } from 'react'

export default function SessionList({ sessions, activeSessionId, onSelect, onCreate, onRename, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const startEditing = (session) => {
    setEditingId(session.id)
    setEditName(session.name)
  }

  const submitRename = (id) => {
    if (editName.trim()) {
      onRename(id, editName.trim())
    }
    setEditingId(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-800">
        <button
          onClick={onCreate}
          className="w-full py-2.5 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-200 font-medium transition-colors duration-150 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">No conversations yet</p>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelect(session.id)}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150 ${
              session.id === activeSessionId
                ? 'bg-gray-800 text-gray-100'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
            }`}
          >
            {editingId === session.id ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => submitRename(session.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitRename(session.id)
                  if (e.key === 'Escape') setEditingId(null)
                }}
                autoFocus
                className="flex-1 bg-gray-700 px-2 py-0.5 rounded text-sm text-gray-100 outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="flex-1 truncate text-sm">{session.name}</span>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); startEditing(session) }}
                    className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-gray-300 transition-colors"
                    title="Rename"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(session.id) }}
                    className="p-1 rounded hover:bg-red-900/40 text-gray-500 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
