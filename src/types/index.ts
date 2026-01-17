export interface Item {
  id: string
  imageData: string // base64 or data URL
  label?: string
  order: number
}

export interface Tier {
  id: string
  name: string
  color: string
  items: Item[]
  order: number
}

export interface TierList {
  id: string
  name: string
  tiers: Tier[]
  unrankedItems: Item[]
  createdAt: number
  updatedAt: number
}

// Gacha-style tier colors
export const DEFAULT_TIER_COLORS = {
  SSS: '#ff69b4', // pink/magenta
  SS: '#ffa500', // orange/gold
  S: '#ef4444', // red
  A: '#eab308', // yellow
  B: '#06b6d4', // cyan/sky blue
  C: '#14b8a6', // green/teal
  D: '#a855f7', // purple
  E: '#6b7280', // gray
  F: '#374151', // dark gray/charcoal
} as const

export type TierLabel = keyof typeof DEFAULT_TIER_COLORS

export const DEFAULT_TIER_ORDER: TierLabel[] = [
  'SSS',
  'SS',
  'S',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
]

// Metadata for listing saved tier lists (without full data)
export interface SavedTierListMeta {
  id: string
  name: string
  updatedAt: number
  createdAt: number
}
