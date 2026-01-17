import { useState, useEffect, useRef } from 'react'
import type { Item } from '../types'

interface ItemEditModalProps {
  item: Item
  isInTier: boolean
  onSave: (label: string) => void
  onDelete: () => void
  onClose: () => void
}

export function ItemEditModal({
  item,
  isInTier,
  onSave,
  onDelete,
  onClose,
}: ItemEditModalProps) {
  const [label, setLabel] = useState(item.label || '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleSave = () => {
    onSave(label)
    onClose()
  }

  const handleDelete = () => {
    if (isInTier && !showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }
    onDelete()
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm mx-4 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-4 mb-4">
          <img
            src={item.imageData}
            alt={item.label || 'Item'}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Label
            </label>
            <input
              ref={inputRef}
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter label..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              This item is ranked in a tier. Are you sure you want to delete it?
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handleDelete}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showDeleteConfirm
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
            }`}
          >
            {showDeleteConfirm ? 'Confirm Delete' : 'Delete'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
