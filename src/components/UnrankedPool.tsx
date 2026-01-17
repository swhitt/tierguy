import { useRef, useState, useCallback } from 'react'
import { useTierListStore } from '../stores/tierListStore'
import { Item } from './Item'
import { CropModal } from './CropModal'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const WARN_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

interface PendingImage {
  src: string
  fileName: string
}

interface UnrankedPoolProps {
  onItemClick?: (item: import('../types').Item) => void
  selectedItemId?: string
}

export function UnrankedPool({
  onItemClick,
  selectedItemId,
}: UnrankedPoolProps) {
  const { tierList, addItem } = useTierListStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null)
  const [sizeWarning, setSizeWarning] = useState<string | null>(null)

  const processFile = useCallback((file: File) => {
    // Check file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert('Please select a PNG or JPG image.')
      return
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      alert('Image is too large (max 5MB). Please choose a smaller image.')
      return
    }

    if (file.size > WARN_FILE_SIZE) {
      setSizeWarning(
        `Large image (${(file.size / 1024 / 1024).toFixed(1)}MB) - may affect performance.`
      )
    } else {
      setSizeWarning(null)
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      if (imageData) {
        setPendingImage({ src: imageData, fileName: file.name })
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    processFile(files[0])
    e.target.value = ''
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        processFile(files[0])
      }
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
          if (file) {
            processFile(file)
            break
          }
        }
      }
    },
    [processFile]
  )

  const handleCropConfirm = (croppedImageData: string, label: string) => {
    addItem({
      id: crypto.randomUUID(),
      imageData: croppedImageData,
      label,
    })
    setPendingImage(null)
    setSizeWarning(null)
  }

  const handleCropCancel = () => {
    setPendingImage(null)
    setSizeWarning(null)
  }

  if (!tierList) return null

  const isEmpty = tierList.unrankedItems.length === 0

  return (
    <>
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
            accept="image/png,image/jpeg"
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
              <Item
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                onClick={() => onItemClick?.(item)}
              />
            ))
          )}
        </div>
      </div>

      {pendingImage && (
        <CropModal
          imageSrc={pendingImage.src}
          fileName={pendingImage.fileName}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      {sizeWarning && pendingImage && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg shadow-lg z-50">
          {sizeWarning}
        </div>
      )}
    </>
  )
}
