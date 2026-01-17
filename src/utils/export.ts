import { toPng } from 'html-to-image'
import type { TierList, Tier, Item } from '../types'

export async function downloadAsPng(
  element: HTMLElement,
  filename = 'tierlist.png'
): Promise<void> {
  const dataUrl = await toPng(element, {
    backgroundColor: '#1f2937', // dark gray background
    pixelRatio: 2, // higher quality
  })

  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}

export function downloadAsJson(tierList: TierList, filename?: string): void {
  const json = JSON.stringify(tierList, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.download = filename ?? `${tierList.name.replace(/\s+/g, '_')}.json`
  link.href = url
  link.click()

  URL.revokeObjectURL(url)
}

function isItem(obj: unknown): obj is Item {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Item).id === 'string' &&
    typeof (obj as Item).imageData === 'string' &&
    typeof (obj as Item).order === 'number'
  )
}

function isTier(obj: unknown): obj is Tier {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Tier).id === 'string' &&
    typeof (obj as Tier).name === 'string' &&
    typeof (obj as Tier).color === 'string' &&
    Array.isArray((obj as Tier).items) &&
    (obj as Tier).items.every(isItem) &&
    typeof (obj as Tier).order === 'number'
  )
}

function isTierList(obj: unknown): obj is TierList {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as TierList).id === 'string' &&
    typeof (obj as TierList).name === 'string' &&
    Array.isArray((obj as TierList).tiers) &&
    (obj as TierList).tiers.every(isTier) &&
    Array.isArray((obj as TierList).unrankedItems) &&
    (obj as TierList).unrankedItems.every(isItem) &&
    typeof (obj as TierList).createdAt === 'number' &&
    typeof (obj as TierList).updatedAt === 'number'
  )
}

export function parseJsonTierList(json: string): TierList {
  const parsed = JSON.parse(json)
  if (!isTierList(parsed)) {
    throw new Error('Invalid tier list format')
  }
  return parsed
}

export function importJsonFile(): Promise<TierList> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) {
        reject(new Error('No file selected'))
        return
      }

      try {
        const text = await file.text()
        const tierList = parseJsonTierList(text)
        resolve(tierList)
      } catch (err) {
        reject(err)
      }
    }

    input.click()
  })
}
