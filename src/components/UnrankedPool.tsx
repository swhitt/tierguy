import { useRef, useState, useCallback } from 'react'
import { useTierListStore } from '../stores/tierListStore'
import { Item } from './Item'

export function UnrankedPool() {
  const { tierList, addItem } = useTierListStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        if (imageData) {
          addItem({
            id: crypto.randomUUID(),
            imageData,
            label: file.name.replace(/\.[^/.]+$/, ''),
          })
        }
      }
      reader.readAsDataURL(file)
    },
    [addItem]
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(processFile)
    e.target.value = ''
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      Array.from(files).forEach(processFile)
    },
    [processFile]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) processFile(file)
        }
      }
    },
    [processFile]
  )

  if (!tierList) return null

  const isEmpty = tierList.unrankedItems.length === 0

  return (
    <div
      className={`
        border-t border-gray-200 dark:border-gray-700
        bg-gray-100 dark:bg-gray-900
        p-4
        transition-colors
        ${isDragOver ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400' : ''}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onPaste={handlePaste}
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Unranked
        </h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Add Images
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div
        className={`
          min-h-[100px]
          flex flex-wrap gap-2
          rounded-lg
          ${isDragOver ? 'ring-2 ring-blue-400 ring-dashed' : ''}
          ${isEmpty ? 'items-center justify-center' : ''}
        `}
      >
        {isEmpty ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm text-center">
            {isDragOver
              ? 'Drop images here'
              : 'Drag images here, paste from clipboard, or click "Add Images"'}
          </p>
        ) : (
          tierList.unrankedItems.map((item) => (
            <Item key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  )
}
