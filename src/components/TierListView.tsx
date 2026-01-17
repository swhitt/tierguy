import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
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
    })
  )

  const tierRowsRef = useCallback(
    (node: HTMLDivElement | null) => {
      setExportRef(node)
    },
    [setExportRef]
  )

  const handleItemClick = useCallback((item: ItemType, isInTier: boolean) => {
    setEditingItem({ item, isInTier })
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

      if (!over) return

      const itemId = active.id as string
      const overId = over.id as string

      // Determine target tier
      let targetTierId: string | null = null
      if (overId === 'unranked') {
        targetTierId = null
      } else if (overId.startsWith('tier-')) {
        targetTierId = overId.replace('tier-', '')
      } else {
        return
      }

      // Move to end of target
      const targetItems =
        targetTierId === null
          ? tierList?.unrankedItems || []
          : tierList?.tiers.find((t) => t.id === targetTierId)?.items || []

      moveItem(itemId, targetTierId, targetItems.length)
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
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No tier list loaded
        </p>
        <button
          onClick={() => createTierList('My Tier List')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Tier List
        </button>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">
        {/* Tier rows area */}
        <div ref={tierRowsRef} className="flex-1 p-4 space-y-2 overflow-auto">
          {tierList.tiers.map((tier) => (
            <TierRow
              key={tier.id}
              tier={tier}
              onItemClick={(item) => handleItemClick(item, true)}
              selectedItemId={editingItem?.item.id}
            />
          ))}
        </div>

        <UnrankedPool
          onItemClick={(item) => handleItemClick(item, false)}
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
        {activeItem ? <Item item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
