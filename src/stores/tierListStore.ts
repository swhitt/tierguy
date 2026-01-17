import { create } from 'zustand'
import type { Item, Tier, TierList } from '../types'
import { DEFAULT_TIER_COLORS } from '../types'
import {
  debouncedSave,
  loadFromStorage,
  flushSave,
  type SaveResult,
} from '../utils/persistence'

type Snapshot = TierList | null
type SaveError = 'quota' | 'serialization' | 'unknown' | null

interface TierListState {
  tierList: TierList | null

  // History for undo/redo
  past: Snapshot[]
  future: Snapshot[]

  // Persistence state
  saveError: SaveError
  isHydrated: boolean

  // Tier list management
  createTierList: (name: string) => void
  setTierList: (tierList: TierList | null) => void
  renameTierList: (name: string) => void

  // Tier actions
  addTier: (name: string, color: string) => void
  removeTier: (tierId: string) => void
  reorderTiers: (fromIndex: number, toIndex: number) => void
  renameTier: (tierId: string, name: string) => void
  setTierColor: (tierId: string, color: string) => void

  // Item actions
  addItem: (item: Omit<Item, 'order'>) => void
  removeItem: (itemId: string) => void
  moveItem: (
    itemId: string,
    targetTierId: string | null,
    targetIndex: number
  ) => void
  updateItemLabel: (itemId: string, label: string) => void

  // Undo/redo
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // Persistence actions
  clearSaveError: () => void
  _setSaveError: (error: SaveError) => void
  _setHydrated: () => void

  // Reset
  reset: () => void
}

const generateId = () => crypto.randomUUID()

const createDefaultTiers = (): Tier[] =>
  Object.entries(DEFAULT_TIER_COLORS).map(([name, color], index) => ({
    id: generateId(),
    name,
    color,
    items: [],
    order: index,
  }))

const saveSnapshot = (
  state: TierListState
): Pick<TierListState, 'past' | 'future'> => ({
  past: state.tierList
    ? [...state.past.slice(-49), structuredClone(state.tierList)]
    : state.past,
  future: [],
})

const updateTimestamp = (tierList: TierList): TierList => ({
  ...tierList,
  updatedAt: Date.now(),
})

export const useTierListStore = create<TierListState>((set, get) => ({
  tierList: null,
  past: [],
  future: [],
  saveError: null,
  isHydrated: false,

  createTierList: (name) => {
    const now = Date.now()
    set({
      tierList: {
        id: generateId(),
        name,
        tiers: createDefaultTiers(),
        unrankedItems: [],
        createdAt: now,
        updatedAt: now,
      },
      past: [],
      future: [],
    })
  },

  setTierList: (tierList) => set({ tierList, past: [], future: [] }),

  renameTierList: (name) =>
    set((state) => {
      if (!state.tierList) return state
      return {
        ...saveSnapshot(state),
        tierList: updateTimestamp({ ...state.tierList, name }),
      }
    }),

  addTier: (name, color) =>
    set((state) => {
      if (!state.tierList) return state
      const newTier: Tier = {
        id: generateId(),
        name,
        color,
        items: [],
        order: state.tierList.tiers.length,
      }
      return {
        ...saveSnapshot(state),
        tierList: updateTimestamp({
          ...state.tierList,
          tiers: [...state.tierList.tiers, newTier],
        }),
      }
    }),

  removeTier: (tierId) =>
    set((state) => {
      if (!state.tierList) return state
      const tier = state.tierList.tiers.find((t) => t.id === tierId)
      if (!tier) return state

      // Move items from removed tier to unranked
      const itemsToMove = tier.items.map((item, idx) => ({
        ...item,
        order: state.tierList!.unrankedItems.length + idx,
      }))

      return {
        ...saveSnapshot(state),
        tierList: updateTimestamp({
          ...state.tierList,
          tiers: state.tierList.tiers
            .filter((t) => t.id !== tierId)
            .map((t, idx) => ({ ...t, order: idx })),
          unrankedItems: [...state.tierList.unrankedItems, ...itemsToMove],
        }),
      }
    }),

  reorderTiers: (fromIndex, toIndex) =>
    set((state) => {
      if (!state.tierList) return state
      const tiers = [...state.tierList.tiers]
      const [moved] = tiers.splice(fromIndex, 1)
      tiers.splice(toIndex, 0, moved)
      return {
        ...saveSnapshot(state),
        tierList: updateTimestamp({
          ...state.tierList,
          tiers: tiers.map((t, idx) => ({ ...t, order: idx })),
        }),
      }
    }),

  renameTier: (tierId, name) =>
    set((state) => {
      if (!state.tierList) return state
      return {
        ...saveSnapshot(state),
        tierList: updateTimestamp({
          ...state.tierList,
          tiers: state.tierList.tiers.map((t) =>
            t.id === tierId ? { ...t, name } : t
          ),
        }),
      }
    }),

  setTierColor: (tierId, color) =>
    set((state) => {
      if (!state.tierList) return state
      return {
        ...saveSnapshot(state),
        tierList: updateTimestamp({
          ...state.tierList,
          tiers: state.tierList.tiers.map((t) =>
            t.id === tierId ? { ...t, color } : t
          ),
        }),
      }
    }),

  addItem: (item) =>
    set((state) => {
      if (!state.tierList) return state
      const newItem: Item = {
        ...item,
        order: state.tierList.unrankedItems.length,
      }
      return {
        ...saveSnapshot(state),
        tierList: updateTimestamp({
          ...state.tierList,
          unrankedItems: [...state.tierList.unrankedItems, newItem],
        }),
      }
    }),

  removeItem: (itemId) =>
    set((state) => {
      if (!state.tierList) return state

      // Check unranked items
      const inUnranked = state.tierList.unrankedItems.some(
        (i) => i.id === itemId
      )
      if (inUnranked) {
        return {
          ...saveSnapshot(state),
          tierList: updateTimestamp({
            ...state.tierList,
            unrankedItems: state.tierList.unrankedItems
              .filter((i) => i.id !== itemId)
              .map((i, idx) => ({ ...i, order: idx })),
          }),
        }
      }

      // Check tiers
      return {
        ...saveSnapshot(state),
        tierList: updateTimestamp({
          ...state.tierList,
          tiers: state.tierList.tiers.map((tier) => ({
            ...tier,
            items: tier.items
              .filter((i) => i.id !== itemId)
              .map((i, idx) => ({ ...i, order: idx })),
          })),
        }),
      }
    }),

  moveItem: (itemId, targetTierId, targetIndex) =>
    set((state) => {
      if (!state.tierList) return state

      // Find the item and its current location
      let item: Item | undefined
      let sourceTierId: string | null = null

      // Check unranked
      item = state.tierList.unrankedItems.find((i) => i.id === itemId)
      if (!item) {
        // Check tiers
        for (const tier of state.tierList.tiers) {
          item = tier.items.find((i) => i.id === itemId)
          if (item) {
            sourceTierId = tier.id
            break
          }
        }
      }

      if (!item) return state

      // Remove from source
      let newUnranked = state.tierList.unrankedItems
      let newTiers = state.tierList.tiers

      if (sourceTierId === null) {
        newUnranked = newUnranked.filter((i) => i.id !== itemId)
      } else {
        newTiers = newTiers.map((tier) =>
          tier.id === sourceTierId
            ? { ...tier, items: tier.items.filter((i) => i.id !== itemId) }
            : tier
        )
      }

      // Add to target
      if (targetTierId === null) {
        // Moving to unranked
        newUnranked = [
          ...newUnranked.slice(0, targetIndex),
          { ...item, order: targetIndex },
          ...newUnranked.slice(targetIndex),
        ].map((i, idx) => ({ ...i, order: idx }))
      } else {
        // Moving to a tier
        newTiers = newTiers.map((tier) => {
          if (tier.id !== targetTierId) return tier
          const items = [
            ...tier.items.slice(0, targetIndex),
            { ...item!, order: targetIndex },
            ...tier.items.slice(targetIndex),
          ].map((i, idx) => ({ ...i, order: idx }))
          return { ...tier, items }
        })
      }

      return {
        ...saveSnapshot(state),
        tierList: updateTimestamp({
          ...state.tierList,
          unrankedItems: newUnranked.map((i, idx) => ({ ...i, order: idx })),
          tiers: newTiers,
        }),
      }
    }),

  updateItemLabel: (itemId, label) =>
    set((state) => {
      if (!state.tierList) return state

      // Check unranked
      const inUnranked = state.tierList.unrankedItems.some(
        (i) => i.id === itemId
      )
      if (inUnranked) {
        return {
          ...saveSnapshot(state),
          tierList: updateTimestamp({
            ...state.tierList,
            unrankedItems: state.tierList.unrankedItems.map((i) =>
              i.id === itemId ? { ...i, label } : i
            ),
          }),
        }
      }

      // Check tiers
      return {
        ...saveSnapshot(state),
        tierList: updateTimestamp({
          ...state.tierList,
          tiers: state.tierList.tiers.map((tier) => ({
            ...tier,
            items: tier.items.map((i) =>
              i.id === itemId ? { ...i, label } : i
            ),
          })),
        }),
      }
    }),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        past: state.past.slice(0, -1),
        future: state.tierList
          ? [structuredClone(state.tierList), ...state.future]
          : state.future,
        tierList: previous,
      }
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        past: state.tierList
          ? [...state.past, structuredClone(state.tierList)]
          : state.past,
        future: state.future.slice(1),
        tierList: next,
      }
    }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  clearSaveError: () => set({ saveError: null }),
  _setSaveError: (error) => set({ saveError: error }),
  _setHydrated: () => set({ isHydrated: true }),

  reset: () => set({ tierList: null, past: [], future: [], saveError: null }),
}))

/**
 * Initialize persistence: load saved state and subscribe to changes.
 * Call this once on app startup.
 */
export function setupPersistence(): () => void {
  const store = useTierListStore

  // Load saved state
  const saved = loadFromStorage()
  if (saved) {
    store.setState({ tierList: saved, past: [], future: [] })
  }
  store.getState()._setHydrated()

  // Subscribe to tierList changes and auto-save
  const unsubscribe = store.subscribe((state, prevState) => {
    if (state.tierList !== prevState.tierList) {
      debouncedSave(state.tierList).then((result: SaveResult) => {
        if (!result.success && result.error) {
          store.getState()._setSaveError(result.error)
        } else if (store.getState().saveError) {
          // Clear error on successful save
          store.getState().clearSaveError()
        }
      })
    }
  })

  // Save immediately on page unload
  const handleBeforeUnload = () => {
    const { tierList } = store.getState()
    flushSave(tierList)
  }
  window.addEventListener('beforeunload', handleBeforeUnload)

  return () => {
    unsubscribe()
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}
