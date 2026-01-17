import type { TierList } from '../types'

const STORAGE_KEY = 'tierguy-autosave'
const DEBOUNCE_MS = 1000

let saveTimeout: ReturnType<typeof setTimeout> | null = null

export interface SaveResult {
  success: boolean
  error?: 'quota' | 'serialization' | 'unknown'
}

/**
 * Save tier list to localStorage with debouncing.
 * Returns a promise that resolves when the debounced save executes.
 */
export function debouncedSave(tierList: TierList | null): Promise<SaveResult> {
  return new Promise((resolve) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    saveTimeout = setTimeout(() => {
      saveTimeout = null
      resolve(saveToStorage(tierList))
    }, DEBOUNCE_MS)
  })
}

/**
 * Immediately save to localStorage (bypasses debounce).
 */
export function saveToStorage(tierList: TierList | null): SaveResult {
  try {
    if (tierList === null) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      const json = JSON.stringify(tierList)
      localStorage.setItem(STORAGE_KEY, json)
    }
    return { success: true }
  } catch (err) {
    if (err instanceof DOMException) {
      if (
        err.name === 'QuotaExceededError' ||
        err.code === 22 || // Legacy quota error code
        err.code === 1014 // Firefox quota error
      ) {
        console.warn('localStorage quota exceeded')
        return { success: false, error: 'quota' }
      }
    }
    if (err instanceof TypeError) {
      console.error('Failed to serialize tier list:', err)
      return { success: false, error: 'serialization' }
    }
    console.error('Failed to save to localStorage:', err)
    return { success: false, error: 'unknown' }
  }
}

/**
 * Load tier list from localStorage.
 * Returns null if nothing saved or on parse error.
 */
export function loadFromStorage(): TierList | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (!json) return null

    const parsed = JSON.parse(json) as TierList

    // Basic validation
    if (!parsed.id || !parsed.name || !Array.isArray(parsed.tiers)) {
      console.warn('Invalid tier list in localStorage, ignoring')
      return null
    }

    return parsed
  } catch (err) {
    console.error('Failed to load from localStorage:', err)
    return null
  }
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
  return saveToStorage(tierList)
}
