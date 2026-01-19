import type { TierList, SavedTierListMeta } from '../types'

const STORAGE_KEY = 'tierguy-saves'
const DEBOUNCE_MS = 1000

let saveTimeout: ReturnType<typeof setTimeout> | null = null
let pendingResolve: ((result: SaveResult) => void) | null = null

export interface SaveResult {
  success: boolean
  error?: 'quota' | 'serialization' | 'unknown'
}

interface StorageData {
  currentId: string | null
  lists: Record<string, TierList>
}

function getStorageData(): StorageData {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (!json) return { currentId: null, lists: {} }

    const parsed = JSON.parse(json) as StorageData
    if (!parsed.lists || typeof parsed.lists !== 'object') {
      return { currentId: null, lists: {} }
    }
    return parsed
  } catch {
    return { currentId: null, lists: {} }
  }
}

function setStorageData(data: StorageData): SaveResult {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return { success: true }
  } catch (err) {
    if (err instanceof DOMException) {
      if (
        err.name === 'QuotaExceededError' ||
        err.code === 22 ||
        err.code === 1014
      ) {
        console.warn('localStorage quota exceeded')
        return { success: false, error: 'quota' }
      }
    }
    if (err instanceof TypeError) {
      console.error('Failed to serialize tier lists:', err)
      return { success: false, error: 'serialization' }
    }
    console.error('Failed to save to localStorage:', err)
    return { success: false, error: 'unknown' }
  }
}

/**
 * Save tier list to storage with debouncing.
 * Superseded saves resolve immediately with success (newer data will be saved).
 */
export function debouncedSave(tierList: TierList | null): Promise<SaveResult> {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    pendingResolve?.({ success: true })
  }

  return new Promise((resolve) => {
    pendingResolve = resolve
    saveTimeout = setTimeout(() => {
      saveTimeout = null
      pendingResolve = null
      resolve(saveTierList(tierList))
    }, DEBOUNCE_MS)
  })
}

/**
 * Save a tier list immediately.
 */
export function saveTierList(tierList: TierList | null): SaveResult {
  const data = getStorageData()

  if (tierList === null) {
    data.currentId = null
  } else {
    data.lists[tierList.id] = tierList
    data.currentId = tierList.id
  }

  return setStorageData(data)
}

/**
 * Load the current tier list from storage.
 */
export function loadFromStorage(): TierList | null {
  const data = getStorageData()
  if (!data.currentId) return null

  const tierList = data.lists[data.currentId]
  if (
    !tierList ||
    !tierList.id ||
    !tierList.name ||
    !Array.isArray(tierList.tiers)
  ) {
    return null
  }
  return tierList
}

/**
 * Load a specific tier list by ID.
 */
export function loadTierListById(id: string): TierList | null {
  const data = getStorageData()
  const tierList = data.lists[id]
  if (
    !tierList ||
    !tierList.id ||
    !tierList.name ||
    !Array.isArray(tierList.tiers)
  ) {
    return null
  }
  return tierList
}

/**
 * Get metadata for all saved tier lists.
 */
export function getSavedTierLists(): SavedTierListMeta[] {
  const data = getStorageData()
  return Object.values(data.lists)
    .map((list) => ({
      id: list.id,
      name: list.name,
      updatedAt: list.updatedAt,
      createdAt: list.createdAt,
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

/**
 * Delete a tier list by ID.
 */
export function deleteTierList(id: string): SaveResult {
  const data = getStorageData()

  if (!data.lists[id]) {
    return { success: true }
  }

  delete data.lists[id]

  if (data.currentId === id) {
    data.currentId = null
  }

  return setStorageData(data)
}

/**
 * Clear any pending debounced save.
 */
export function cancelPendingSave(): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
  }
}

/**
 * Force immediate save (cancels pending debounce and saves now).
 */
export function flushSave(tierList: TierList | null): SaveResult {
  cancelPendingSave()
  return saveTierList(tierList)
}

/**
 * Migrate from old single-list storage format.
 */
export function migrateFromLegacy(): void {
  const legacyKey = 'tierguy-autosave'
  try {
    const json = localStorage.getItem(legacyKey)
    if (!json) return

    const parsed = JSON.parse(json) as TierList
    if (!parsed.id || !parsed.name || !Array.isArray(parsed.tiers)) {
      return
    }

    // Only migrate if new storage is empty
    const data = getStorageData()
    if (Object.keys(data.lists).length === 0) {
      data.lists[parsed.id] = parsed
      data.currentId = parsed.id
      setStorageData(data)
    }

    localStorage.removeItem(legacyKey)
  } catch {
    // Ignore migration errors
  }
}
