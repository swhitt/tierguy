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
      {...listeners}
      {...attributes}
      className={`relative group transition-all duration-200 cursor-grab active:cursor-grabbing touch-none ${isDragging ? 'scale-105' : ''}`}
    >
      {/* Drop position indicator - shows on left side when item is hovered */}
      {isOver && !isDragging && (
        <div className="absolute -left-1.5 top-0 bottom-0 w-1 bg-blue-500 rounded-full z-20" />
      )}

      <Item item={item} size={size} isSelected={isSelected} onClick={onClick} />
    </div>
  )
})
