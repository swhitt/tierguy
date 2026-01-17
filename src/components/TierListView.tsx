import { useCallback } from 'react'
import { useTierListStore } from '../stores/tierListStore'
import { useExportStore } from '../stores/exportStore'
import { Item } from './Item'

export function TierListView() {
  const { tierList, createTierList } = useTierListStore()
  const setExportRef = useExportStore((s) => s.setExportRef)

  const tierRowsRef = useCallback(
    (node: HTMLDivElement | null) => {
      setExportRef(node)
    },
    [setExportRef]
  )

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
    <div className="flex flex-col h-full">
      {/* Tier rows area */}
      <div ref={tierRowsRef} className="flex-1 p-4 space-y-2 overflow-auto">
        {tierList.tiers.map((tier) => (
          <div
            key={tier.id}
            className="flex items-stretch rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Tier label */}
            <div
              className="w-20 sm:w-24 flex items-center justify-center font-bold text-white shrink-0"
              style={{ backgroundColor: tier.color }}
            >
              {tier.name}
            </div>
            {/* Tier items */}
            <div className="flex-1 min-h-[80px] bg-gray-100 dark:bg-gray-800 p-2 flex flex-wrap gap-2">
              {tier.items.length === 0 && (
                <span className="text-gray-400 dark:text-gray-500 text-sm self-center">
                  Drop items here
                </span>
              )}
              {tier.items.map((item) => (
                <Item key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Unranked pool */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 p-4">
        <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          Unranked
        </h2>
        <div className="min-h-[100px] flex flex-wrap gap-2">
          {tierList.unrankedItems.length === 0 && (
            <span className="text-gray-400 dark:text-gray-500 text-sm">
              Add images to start ranking
            </span>
          )}
          {tierList.unrankedItems.map((item) => (
            <Item key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
