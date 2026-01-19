import { memo } from 'react'
import type { Item as ItemType } from '../types'

interface ItemProps {
  item: ItemType
  size?: 'sm' | 'md' | 'lg'
  isSelected?: boolean
  onClick?: () => void
}

// Touch-first sizing: larger on mobile (touch), can be smaller on desktop (mouse)
// Items are wider than tall (roughly 4:3) to give labels more horizontal room
const sizeClasses = {
  sm: 'w-14 h-12 sm:w-12 sm:h-10',
  md: 'w-20 h-16 sm:w-16 sm:h-14',
  lg: 'w-24 h-20 sm:w-20 sm:h-16',
}

export const Item = memo(function Item({
  item,
  size = 'md',
  isSelected,
  onClick,
}: ItemProps) {
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
        cursor-pointer
        hover:shadow-lg
        hover:ring-2 hover:ring-blue-400/50 dark:hover:ring-blue-400/40
        hover:scale-105
        hover:z-10
        active:scale-95
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
        loading="lazy"
        decoding="async"
      />
      {item.label && (
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-1 py-0.5 pt-4"
          title={item.label}
        >
          <span className="text-white text-[10px] leading-tight font-medium line-clamp-2 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {item.label}
          </span>
        </div>
      )}
    </div>
  )
})
