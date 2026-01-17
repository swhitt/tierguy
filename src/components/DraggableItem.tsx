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
      {...listeners}
      {...attributes}
      className={`transition-all duration-200 ${isDragging ? 'scale-105' : ''}`}
    >
      <Item item={item} size={size} isSelected={isSelected} onClick={onClick} />
    </div>
  )
})
