import { create } from 'zustand'
import type { Tier, TierItem, TierList } from '../types'

interface TierListState {
  tierList: TierList | null
  setTierList: (tierList: TierList) => void
  addItem: (item: TierItem) => void
  moveItem: (itemId: string, targetTierId: string | null, index: number) => void
  updateTier: (tierId: string, updates: Partial<Tier>) => void
  reset: () => void
}

export const useTierListStore = create<TierListState>((set) => ({
  tierList: null,

  setTierList: (tierList) => set({ tierList }),

  addItem: (item) =>
    set((state) => {
      if (!state.tierList) return state
      return {
        tierList: {
          ...state.tierList,
          unrankedItems: [...state.tierList.unrankedItems, item],
        },
      }
    }),

  moveItem: (_itemId, _targetTierId, _index) =>
    set((state) => {
      if (!state.tierList) return state
      // Implementation will be expanded in data model task
      return state
    }),

  updateTier: (tierId, updates) =>
    set((state) => {
      if (!state.tierList) return state
      return {
        tierList: {
          ...state.tierList,
          tiers: state.tierList.tiers.map((tier) =>
            tier.id === tierId ? { ...tier, ...updates } : tier
          ),
        },
      }
    }),

  reset: () => set({ tierList: null }),
}))
