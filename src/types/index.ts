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

// Default tier colors (S through F)
export const DEFAULT_TIER_COLORS = {
  S: '#ff7f7f',
  A: '#ffbf7f',
  B: '#ffdf7f',
  C: '#ffff7f',
  D: '#bfff7f',
  F: '#7fbfff',
} as const

export type TierLabel = keyof typeof DEFAULT_TIER_COLORS
