import type { Item as ItemType } from '../types'

interface ItemProps {
  item: ItemType
  size?: 'sm' | 'md' | 'lg'
  isSelected?: boolean
  onClick?: () => void
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
}

export function Item({ item, size = 'md', isSelected, onClick }: ItemProps) {
  return (
    <div
      className={`
        ${sizeClasses[size]}
        relative
        rounded-md
        overflow-hidden
        bg-gray-200 dark:bg-gray-700
        shadow-md
        ring-1 ring-black/10 dark:ring-white/10
        cursor-grab
        active:cursor-grabbing
        hover:shadow-lg
        hover:ring-2 hover:ring-blue-400/50 dark:hover:ring-blue-400/40
        hover:scale-105
        hover:z-10
        transition-all
        duration-150
        select-none
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800' : ''}
      `}
      onClick={onClick}
    >
      <img
        src={item.imageData}
        alt={item.label || 'Tier item'}
        className="w-full h-full object-cover"
        draggable={false}
      />
      {item.label && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-black/0 px-1 py-1 pt-3">
          <span className="text-white text-xs font-medium truncate block text-center drop-shadow-sm">
            {item.label}
          </span>
        </div>
      )}
    </div>
  )
}
