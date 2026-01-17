import { memo, useCallback, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { Tier, Item } from '../types'
import { DraggableItem } from './DraggableItem'

interface TierRowProps {
  tier: Tier
  onItemClick?: (item: Item) => void
  selectedItemId?: string
}

export const TierRow = memo(function TierRow({
  tier,
  onItemClick,
  selectedItemId,
}: TierRowProps) {
  const droppableData = useMemo(() => ({ tierId: tier.id }), [tier.id])

  const { setNodeRef, isOver } = useDroppable({
    id: `tier-${tier.id}`,
    data: droppableData,
  })

  const handleItemClick = useCallback(
    (item: Item) => {
      onItemClick?.(item)
    },
    [onItemClick]
  )

  return (
    <div className="flex items-stretch rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
      {/* Tier label */}
      <div
        className="w-20 sm:w-24 flex items-center justify-center font-bold text-white shrink-0 transition-transform duration-200"
        style={{ backgroundColor: tier.color }}
      >
        {tier.name}
      </div>
      {/* Tier items drop zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 min-h-[80px] p-2 flex flex-wrap gap-2 content-start
          transition-colors duration-200
          ${isOver ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}
        `}
      >
        {tier.items.length === 0 && !isOver && (
          <span className="text-gray-400 dark:text-gray-500 text-sm self-center">
            Drop items here
          </span>
        )}
        {tier.items.map((item) => (
          <TierItem
            key={item.id}
            item={item}
            isSelected={selectedItemId === item.id}
            onItemClick={handleItemClick}
          />
        ))}
      </div>
    </div>
  )
})

// Inner component to avoid inline callback creation
const TierItem = memo(function TierItem({
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
    <DraggableItem item={item} isSelected={isSelected} onClick={handleClick} />
  )
})
