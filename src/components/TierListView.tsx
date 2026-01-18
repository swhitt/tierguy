import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useTierListStore } from '../stores/tierListStore'
import { useExportStore } from '../stores/exportStore'
import { Item } from './Item'
import { TierRow } from './TierRow'
import { UnrankedPool } from './UnrankedPool'
import { ItemEditModal } from './ItemEditModal'
import type { Item as ItemType } from '../types'

interface EditingItem {
  item: ItemType
  isInTier: boolean
}

export function TierListView() {
  const { tierList, createTierList, removeItem, updateItemLabel, moveItem } =
    useTierListStore()
  const setExportRef = useExportStore((s) => s.setExportRef)
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null)
  const [activeItem, setActiveItem] = useState<ItemType | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const tierRowsRef = useCallback(
    (node: HTMLDivElement | null) => {
      setExportRef(node)
    },
    [setExportRef]
  )

  const handleTierItemClick = useCallback((item: ItemType) => {
    setEditingItem({ item, isInTier: true })
  }, [])

  const handleUnrankedItemClick = useCallback((item: ItemType) => {
    setEditingItem({ item, isInTier: false })
  }, [])

  const handleSave = useCallback(
    (label: string) => {
      if (editingItem) {
        updateItemLabel(editingItem.item.id, label)
      }
    },
    [editingItem, updateItemLabel]
  )

  const handleDelete = useCallback(() => {
    if (editingItem) {
      removeItem(editingItem.item.id)
    }
  }, [editingItem, removeItem])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    setActiveItem(active.data.current?.item || null)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveItem(null)

      if (!over || !tierList) return

      const itemId = active.id as string
      const overId = over.id as string

      // Don't do anything if dropped on itself
      if (itemId === overId) return

      // Determine if we're dropping over an item or a container
      const overData = over.data.current as
        | { containerId?: string; item?: { id: string }; tierId?: string }
        | undefined

      let targetTierId: string | null = null
      let targetIndex: number

      if (overData?.containerId) {
        // Dropping over an item - insert at that position
        const containerId = overData.containerId

        if (containerId === 'unranked') {
          targetTierId = null
          const items = tierList.unrankedItems
          targetIndex = items.findIndex((i) => i.id === overId)
          if (targetIndex === -1) targetIndex = items.length
        } else if (containerId.startsWith('tier-')) {
          targetTierId = containerId.replace('tier-', '')
          const tier = tierList.tiers.find((t) => t.id === targetTierId)
          if (!tier) return
          targetIndex = tier.items.findIndex((i) => i.id === overId)
          if (targetIndex === -1) targetIndex = tier.items.length
        } else {
          return
        }
      } else if (overId === 'unranked' || overData?.tierId === null) {
        // Dropping on unranked container
        targetTierId = null
        targetIndex = tierList.unrankedItems.length
      } else if (overId.startsWith('tier-')) {
        // Dropping on tier container
        targetTierId = overId.replace('tier-', '')
        const tier = tierList.tiers.find((t) => t.id === targetTierId)
        targetIndex = tier?.items.length || 0
      } else if (overData?.tierId) {
        // Dropping on tier container via data
        targetTierId = overData.tierId
        const tier = tierList.tiers.find((t) => t.id === targetTierId)
        targetIndex = tier?.items.length || 0
      } else {
        return
      }

      moveItem(itemId, targetTierId, targetIndex)
    },
    [tierList, moveItem]
  )

  // Keyboard delete support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        editingItem &&
        (e.key === 'Delete' || e.key === 'Backspace') &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        if (editingItem.isInTier) {
          return
        }
        removeItem(editingItem.item.id)
        setEditingItem(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingItem, removeItem])

  if (!tierList) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">
          No tier list loaded
        </p>
        <button
          onClick={() => createTierList('My Tier List')}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all shadow-md hover:shadow-lg"
        >
          Create New Tier List
        </button>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">
        {/* Tier rows area */}
        <div
          ref={tierRowsRef}
          className="flex-1 p-2 sm:p-4 space-y-1.5 sm:space-y-2 overflow-auto bg-gray-100 dark:bg-gray-900"
        >
          {tierList.tiers.map((tier) => (
            <TierRow
              key={tier.id}
              tier={tier}
              onItemClick={handleTierItemClick}
              selectedItemId={editingItem?.item.id}
            />
          ))}
        </div>

        <UnrankedPool
          onItemClick={handleUnrankedItemClick}
          selectedItemId={editingItem?.item.id}
        />

        {editingItem && (
          <ItemEditModal
            item={editingItem.item}
            isInTier={editingItem.isInTier}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={() => setEditingItem(null)}
          />
        )}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="rounded-md overflow-hidden shadow-2xl ring-2 ring-blue-500 scale-110 opacity-90">
            <Item item={activeItem} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
