export interface TierItem {
  id: string
  imageUrl: string
  label?: string
}

export interface Tier {
  id: string
  label: string
  color: string
  items: TierItem[]
}

export interface TierList {
  id: string
  title: string
  tiers: Tier[]
  unrankedItems: TierItem[]
}
