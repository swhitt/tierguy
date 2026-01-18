import { memo, useMemo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Item as ItemType } from '../types'
import { Item } from './Item'

interface DraggableItemProps {
  item: ItemType
  size?: 'sm' | 'md' | 'lg'
  isSelected?: boolean
  onClick?: () => void
}

export const DraggableItem = memo(function DraggableItem({
  item,
  size = 'md',
  isSelected,
  onClick,
}: DraggableItemProps) {
  const draggableData = useMemo(() => ({ item }), [item])

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: item.id,
      data: draggableData,
    })

  const style = useMemo(
    () => ({
      transform: CSS.Translate.toString(transform),
      transition: 'transform 200ms ease',
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : undefined,
    }),
    [transform, isDragging]
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group transition-all duration-200 ${isDragging ? 'scale-105' : ''}`}
    >
      {/* Drag handle - visible on hover/touch, positioned at top-left */}
      <div
        {...listeners}
        {...attributes}
        className="
          absolute top-0.5 left-0.5 z-10
          w-7 h-7 sm:w-6 sm:h-6
          flex items-center justify-center
          bg-gray-800/80 dark:bg-gray-200/80
          text-white dark:text-gray-800
          rounded-md
          cursor-grab active:cursor-grabbing
          opacity-0 group-hover:opacity-100
          touch-none
          transition-opacity duration-150
          shadow-md
          [@media(hover:none)]:opacity-70
        "
        aria-label="Drag handle"
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
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      <Item item={item} size={size} isSelected={isSelected} onClick={onClick} />
    </div>
  )
})
