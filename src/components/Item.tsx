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
        rounded-lg
        overflow-hidden
        bg-gray-200 dark:bg-gray-700
        shadow-sm
        cursor-pointer
        hover:shadow-md
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
        <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5">
          <span className="text-white text-xs truncate block text-center">
            {item.label}
          </span>
        </div>
      )}
    </div>
  )
}
