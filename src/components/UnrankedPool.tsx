import { useRef, useState, useCallback, memo, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useTierListStore } from '../stores/tierListStore'
import { SortableItem } from './SortableItem'
import { CropModal } from './CropModal'
import { GenerateImageModal } from './GenerateImageModal'
import type { Item } from '../types'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const WARN_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

interface PendingImage {
  src: string
  fileName: string
}

interface ImageQueueItem extends PendingImage {
  id: string
}

interface UnrankedPoolProps {
  onItemClick?: (item: Item) => void
  selectedItemId?: string
}

// Recursively get files from a directory entry (for folder drag support)
async function getFilesFromEntry(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    return new Promise((resolve) => {
      ;(entry as FileSystemFileEntry).file(
        (file) => resolve([file]),
        () => resolve([])
      )
    })
  } else if (entry.isDirectory) {
    const dirReader = (entry as FileSystemDirectoryEntry).createReader()
    const entries = await new Promise<FileSystemEntry[]>((resolve) => {
      const allEntries: FileSystemEntry[] = []
      const readEntries = () => {
        dirReader.readEntries(
          (results) => {
            if (results.length === 0) {
              resolve(allEntries)
            } else {
              allEntries.push(...results)
              readEntries()
            }
          },
          () => resolve(allEntries)
        )
      }
      readEntries()
    })
    const files = await Promise.all(entries.map(getFilesFromEntry))
    return files.flat()
  }
  return []
}

export const UnrankedPool = memo(function UnrankedPool({
  onItemClick,
  selectedItemId,
}: UnrankedPoolProps) {
  const { tierList, addItem } = useTierListStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFileDragOver, setIsFileDragOver] = useState(false)
  const [imageQueue, setImageQueue] = useState<ImageQueueItem[]>([])
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0)
  const [sizeWarning, setSizeWarning] = useState<string | null>(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  const currentImage = imageQueue[currentQueueIndex] || null
  const queueLength = imageQueue.length

  // dnd-kit droppable for item drag-drop
  const droppableData = useMemo(() => ({ tierId: null }), [])
  const { setNodeRef, isOver: isItemDragOver } = useDroppable({
    id: 'unranked',
    data: droppableData,
  })

  const handleItemClick = useCallback(
    (item: Item) => {
      onItemClick?.(item)
    },
    [onItemClick]
  )

  const processFile = useCallback(
    (file: File): Promise<ImageQueueItem | null> => {
      return new Promise((resolve) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          resolve(null)
          return
        }

        if (file.size > MAX_FILE_SIZE) {
          resolve(null)
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const imageData = e.target?.result as string
          if (imageData) {
            resolve({
              id: crypto.randomUUID(),
              src: imageData,
              fileName: file.name,
            })
          } else {
            resolve(null)
          }
        }
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(file)
      })
    },
    []
  )

  const processFiles = useCallback(
    async (files: File[]) => {
      const validFiles = files.filter(
        (f) => ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE
      )

      if (validFiles.length === 0) {
        alert(
          'No valid images found. Please select PNG or JPG images under 5MB.'
        )
        return
      }

      const skipped = files.length - validFiles.length
      if (skipped > 0) {
        console.warn(`Skipped ${skipped} invalid files`)
      }

      // Check for large files
      const largeFiles = validFiles.filter((f) => f.size > WARN_FILE_SIZE)
      if (largeFiles.length > 0) {
        setSizeWarning(
          `${largeFiles.length} large image(s) may affect performance.`
        )
      } else {
        setSizeWarning(null)
      }

      const queueItems = await Promise.all(validFiles.map(processFile))
      const validItems = queueItems.filter(
        (item): item is ImageQueueItem => item !== null
      )

      if (validItems.length > 0) {
        setImageQueue(validItems)
        setCurrentQueueIndex(0)
      }
    },
    [processFile]
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    processFiles(Array.from(files))
    e.target.value = ''
  }

  // Native file drop (not dnd-kit) - supports folders via webkitGetAsEntry
  const handleFileDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsFileDragOver(false)

      const items = e.dataTransfer.items
      const allFiles: File[] = []

      // Try to get entries for folder support
      for (const item of items) {
        const entry = item.webkitGetAsEntry?.()
        if (entry) {
          const files = await getFilesFromEntry(entry)
          allFiles.push(...files)
        } else if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file) allFiles.push(file)
        }
      }

      // Fallback to files if no items
      if (allFiles.length === 0 && e.dataTransfer.files.length > 0) {
        allFiles.push(...Array.from(e.dataTransfer.files))
      }

      if (allFiles.length > 0) {
        processFiles(allFiles)
      }
    },
    [processFiles]
  )

  const handleFileDragOver = (e: React.DragEvent) => {
    // Only show file drag feedback if dragging files (not dnd-kit items)
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault()
      setIsFileDragOver(true)
    }
  }

  const handleFileDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsFileDragOver(false)
  }

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items
      const files: File[] = []
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            files.push(file)
          }
        }
      }
      if (files.length > 0) {
        processFiles(files)
      }
    },
    [processFiles]
  )

  const handleCropConfirm = (croppedImageData: string, label: string) => {
    addItem({
      id: crypto.randomUUID(),
      imageData: croppedImageData,
      label,
    })
    // Move to next image in queue or clear
    if (currentQueueIndex < queueLength - 1) {
      setCurrentQueueIndex((prev) => prev + 1)
    } else {
      setImageQueue([])
      setCurrentQueueIndex(0)
      setSizeWarning(null)
    }
  }

  const handleCropSkip = () => {
    // Skip to next image or clear queue
    if (currentQueueIndex < queueLength - 1) {
      setCurrentQueueIndex((prev) => prev + 1)
    } else {
      setImageQueue([])
      setCurrentQueueIndex(0)
      setSizeWarning(null)
    }
  }

  const handleCropCancel = () => {
    // Cancel entire queue
    setImageQueue([])
    setCurrentQueueIndex(0)
    setSizeWarning(null)
  }

  const handleGenerateConfirm = (imageData: string, label: string) => {
    addItem({
      id: crypto.randomUUID(),
      imageData,
      label,
    })
    setShowGenerateModal(false)
  }

  if (!tierList) return null

  const isEmpty = tierList.unrankedItems.length === 0
  const showDragFeedback = isFileDragOver || isItemDragOver

  return (
    <>
      <div
        className={`
          border-t border-gray-200 dark:border-gray-700
          bg-gray-100 dark:bg-gray-900
          p-4
          transition-colors duration-200
          ${showDragFeedback ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400' : ''}
        `}
        onDrop={handleFileDrop}
        onDragOver={handleFileDragOver}
        onDragLeave={handleFileDragLeave}
        onPaste={handlePaste}
        tabIndex={0}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Unranked
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="text-sm px-4 py-2 sm:px-3 sm:py-1 bg-purple-600 text-white rounded-lg sm:rounded hover:bg-purple-700 active:scale-95 transition-all flex items-center gap-1.5 min-h-[44px] sm:min-h-0"
            >
              <svg
                className="w-5 h-5 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Generate
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm px-4 py-2 sm:px-3 sm:py-1 bg-blue-600 text-white rounded-lg sm:rounded hover:bg-blue-700 active:scale-95 transition-all min-h-[44px] sm:min-h-0"
            >
              Add Images
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div
          ref={setNodeRef}
          className={`
            min-h-[120px] sm:min-h-[100px]
            flex flex-wrap gap-3 sm:gap-2
            rounded-lg
            transition-colors duration-200
            ${showDragFeedback ? 'ring-2 ring-blue-400 ring-dashed' : ''}
            ${isEmpty ? 'items-center justify-center' : ''}
          `}
        >
          <SortableContext
            items={tierList.unrankedItems.map((item) => item.id)}
            strategy={horizontalListSortingStrategy}
          >
            {isEmpty ? (
              <p className="text-gray-400 dark:text-gray-500 text-sm text-center">
                {showDragFeedback
                  ? 'Drop here'
                  : 'Drag images here, paste from clipboard, or click "Add Images"'}
              </p>
            ) : (
              tierList.unrankedItems.map((item) => (
                <UnrankedItem
                  key={item.id}
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onItemClick={handleItemClick}
                />
              ))
            )}
          </SortableContext>
        </div>
      </div>

      {currentImage && (
        <CropModal
          key={currentImage.id}
          imageSrc={currentImage.src}
          fileName={currentImage.fileName}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
          onSkip={queueLength > 1 ? handleCropSkip : undefined}
          queuePosition={queueLength > 1 ? currentQueueIndex + 1 : undefined}
          queueTotal={queueLength > 1 ? queueLength : undefined}
        />
      )}

      {sizeWarning && currentImage && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg shadow-lg z-50">
          {sizeWarning}
        </div>
      )}

      {showGenerateModal && (
        <GenerateImageModal
          onConfirm={handleGenerateConfirm}
          onCancel={() => setShowGenerateModal(false)}
        />
      )}
    </>
  )
})

// Inner component to avoid inline callback creation
const UnrankedItem = memo(function UnrankedItem({
  item,
  isSelected,
  onItemClick,
}: {
  item: Item
  isSelected: boolean
  onItemClick: (item: Item) => void
}) {
  const handleClick = useCallback(() => {
    onItemClick(item)
  }, [onItemClick, item])

  return (
    <SortableItem
      item={item}
      containerId="unranked"
      isSelected={isSelected}
      onClick={handleClick}
    />
  )
})
