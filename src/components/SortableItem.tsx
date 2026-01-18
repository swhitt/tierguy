import { memo, useMemo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Item as ItemType } from '../types'
import { Item } from './Item'

interface SortableItemProps {
  item: ItemType
  size?: 'sm' | 'md' | 'lg'
  isSelected?: boolean
  onClick?: () => void
  containerId: string
}

export const SortableItem = memo(function SortableItem({
  item,
  size = 'md',
  isSelected,
  onClick,
  containerId,
}: SortableItemProps) {
  const sortableData = useMemo(
    () => ({ item, containerId }),
    [item, containerId]
  )

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: item.id,
    data: sortableData,
  })

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : undefined,
    }),
    [transform, transition, isDragging]
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group transition-all duration-200 ${isDragging ? 'scale-105' : ''}`}
    >
      {/* Drop position indicator - shows on left side when item is hovered */}
      {isOver && !isDragging && (
        <div className="absolute -left-1.5 top-0 bottom-0 w-1 bg-blue-500 rounded-full z-20" />
      )}

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
