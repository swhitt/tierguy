import { toPng } from 'html-to-image'

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
