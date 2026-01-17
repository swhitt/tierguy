import { useState, useRef, useEffect } from 'react'
import { useTierListStore } from '../stores/tierListStore'

export function SaveMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const newInputRef = useRef<HTMLInputElement>(null)

  const {
    tierList,
    savedTierLists,
    renameTierList,
    createTierList,
    loadSavedTierList,
    deleteSavedTierList,
  } = useTierListStore()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setIsCreating(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (isCreating && newInputRef.current) {
      newInputRef.current.focus()
    }
  }, [isCreating])

  const handleStartEdit = () => {
    if (tierList) {
      setEditName(tierList.name)
      setIsEditing(true)
    }
  }

  const handleSaveEdit = () => {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== tierList?.name) {
      renameTierList(trimmed)
    }
    setIsEditing(false)
  }

  const handleStartCreate = () => {
    setNewName('')
    setIsCreating(true)
  }

  const handleCreate = () => {
    const trimmed = newName.trim()
    if (trimmed) {
      createTierList(trimmed)
      setIsCreating(false)
      setIsOpen(false)
    }
  }

  const handleLoad = (id: string) => {
    loadSavedTierList(id)
    setIsOpen(false)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteSavedTierList(id)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
      >
        {tierList ? (
          <>
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit()
                  if (e.key === 'Escape') setIsEditing(false)
                }}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent border-b border-blue-500 outline-none text-gray-900 dark:text-white font-medium w-32"
              />
            ) : (
              <span
                className="text-gray-900 dark:text-white font-medium cursor-text"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartEdit()
                }}
              >
                {tierList.name}
              </span>
            )}
          </>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">No list</span>
        )}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200/80 dark:border-gray-700/50 z-50 overflow-hidden">
          {isCreating ? (
            <div className="p-3">
              <input
                ref={newInputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate()
                  if (e.key === 'Escape') setIsCreating(false)
                }}
                placeholder="Tier list name..."
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="flex-1 px-3 py-1.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Create
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={handleStartCreate}
                className="w-full px-4 py-2.5 text-left text-blue-600 dark:text-blue-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700/50 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Tier List
              </button>

              {savedTierLists.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  No saved tier lists
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {savedTierLists.map((save) => (
                    <div
                      key={save.id}
                      onClick={() => handleLoad(save.id)}
                      className={`px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between group ${
                        tierList?.id === save.id
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {save.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(save.updatedAt)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, save.id)}
                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete tier list"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
