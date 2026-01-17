import { useDroppable } from '@dnd-kit/core'
import type { Tier, Item } from '../types'
import { DraggableItem } from './DraggableItem'

interface TierRowProps {
  tier: Tier
  onItemClick?: (item: Item) => void
  selectedItemId?: string
}

export function TierRow({ tier, onItemClick, selectedItemId }: TierRowProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `tier-${tier.id}`,
    data: { tierId: tier.id },
  })

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
          ${isOver ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}
        `}
      >
        {tier.items.length === 0 && !isOver && (
          <span className="text-gray-400 dark:text-gray-500 text-sm self-center">
            Drop items here
          </span>
        )}
        {tier.items.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            isSelected={selectedItemId === item.id}
            onClick={() => onItemClick?.(item)}
          />
        ))}
      </div>
    </div>
  )
}
