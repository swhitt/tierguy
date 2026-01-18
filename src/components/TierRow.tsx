import { memo, useCallback, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { Tier, Item } from '../types'
import { SortableItem } from './SortableItem'

interface TierRowProps {
  tier: Tier
  onItemClick?: (item: Item) => void
  selectedItemId?: string
  isOverContainer?: boolean
  activeItemId?: string | null
}

export const TierRow = memo(function TierRow({
  tier,
  onItemClick,
  selectedItemId,
  isOverContainer,
  activeItemId,
}: TierRowProps) {
  const containerId = `tier-${tier.id}`
  const droppableData = useMemo(() => ({ tierId: tier.id }), [tier.id])

  const { setNodeRef, isOver } = useDroppable({
    id: containerId,
    data: droppableData,
  })

  const handleItemClick = useCallback(
    (item: Item) => {
      onItemClick?.(item)
    },
    [onItemClick]
  )

  // Get item IDs for SortableContext
  const itemIds = useMemo(() => tier.items.map((item) => item.id), [tier.items])

  // Show container highlight when dragging over the tier container (not over an item)
  const showContainerHighlight = isOver || isOverContainer

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
          flex-1 min-h-[88px] sm:min-h-[72px] p-3 sm:p-2 flex flex-wrap gap-3 sm:gap-2 content-start
          transition-colors duration-200
          ${showContainerHighlight ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}
        `}
      >
        <SortableContext items={itemIds} strategy={horizontalListSortingStrategy}>
          {tier.items.length === 0 && !showContainerHighlight && (
            <span className="text-gray-400 dark:text-gray-500 text-sm self-center">
              Drop items here
            </span>
          )}
          {tier.items.map((item) => (
            <TierItem
              key={item.id}
              item={item}
              containerId={containerId}
              isSelected={selectedItemId === item.id}
              onItemClick={handleItemClick}
              isBeingDragged={activeItemId === item.id}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
})

// Inner component to avoid inline callback creation
const TierItem = memo(function TierItem({
  item,
  containerId,
  isSelected,
  onItemClick,
  isBeingDragged,
}: {
  item: Item
  containerId: string
  isSelected: boolean
  onItemClick: (item: Item) => void
  isBeingDragged?: boolean
}) {
  const handleClick = useCallback(() => {
    onItemClick(item)
  }, [onItemClick, item])

  return (
    <SortableItem
      item={item}
      containerId={containerId}
      isSelected={isSelected}
      onClick={handleClick}
    />
  )
})
