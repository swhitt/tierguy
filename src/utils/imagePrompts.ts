/**
 * AI image generation prompt templates for tier list items.
 *
 * Design goals:
 * - Square aspect ratio (1:1)
 * - Centered subject with clear focus
 * - Clean, simple backgrounds (solid color or minimal gradient)
 * - Icon-like aesthetic suitable for tier list display at small sizes
 * - Works across categories: games, food, people, animals, concepts
 */

export type ImageStyle = 'icon' | 'cartoon' | 'pixel' | 'realistic'

export interface StylePreset {
  id: ImageStyle
  name: string
  description: string
  promptTemplate: string
  negativePrompt: string
}

/**
 * Core prompt structure that works across styles:
 * [style modifiers] + [subject] + [composition] + [background] + [quality]
 */
const COMPOSITION = 'centered in frame, single subject, front-facing'
const BACKGROUND = 'solid color background, clean background, no clutter'
const QUALITY = 'high quality, detailed, sharp focus'
const ASPECT = '1:1 aspect ratio, square format'

export const STYLE_PRESETS: Record<ImageStyle, StylePreset> = {
  icon: {
    id: 'icon',
    name: 'Icon',
    description: 'Clean, simple icons with flat colors',
    promptTemplate: `flat design icon of {subject}, ${COMPOSITION}, ${BACKGROUND}, minimalist style, vector art style, bold outlines, simple shapes, vibrant colors, ${ASPECT}, ${QUALITY}`,
    negativePrompt:
      'photorealistic, 3d render, complex background, busy, cluttered, multiple subjects, text, watermark, signature, blurry',
  },

  cartoon: {
    id: 'cartoon',
    name: 'Cartoon',
    description: 'Expressive cartoon style with personality',
    promptTemplate: `cartoon illustration of {subject}, ${COMPOSITION}, ${BACKGROUND}, expressive, stylized, bold colors, clean linework, character design style, ${ASPECT}, ${QUALITY}`,
    negativePrompt:
      'photorealistic, hyperrealistic, complex background, busy scene, multiple characters, text, watermark, blurry, low quality',
  },

  pixel: {
    id: 'pixel',
    name: 'Pixel Art',
    description: 'Retro pixel art style',
    promptTemplate: `pixel art of {subject}, ${COMPOSITION}, ${BACKGROUND}, 32-bit style, retro game sprite, limited color palette, crisp pixels, ${ASPECT}, ${QUALITY}`,
    negativePrompt:
      'blurry, anti-aliased, smooth gradients, photorealistic, complex background, text, watermark',
  },

  realistic: {
    id: 'realistic',
    name: 'Realistic',
    description: 'Clean realistic style with studio lighting',
    promptTemplate: `professional photograph of {subject}, ${COMPOSITION}, studio lighting, ${BACKGROUND}, product photography style, ${ASPECT}, ${QUALITY}`,
    negativePrompt:
      'cartoon, illustration, drawing, complex background, busy, cluttered, multiple subjects, text, watermark, low quality, blurry',
  },
}

/**
 * Generate a complete prompt for image generation.
 */
export function generatePrompt(
  subject: string,
  style: ImageStyle = 'icon'
): { prompt: string; negativePrompt: string } {
  const preset = STYLE_PRESETS[style]
  return {
    prompt: preset.promptTemplate.replace('{subject}', subject),
    negativePrompt: preset.negativePrompt,
  }
}

/**
 * Subject-specific prompt enhancements for better results.
 * These are optional prefixes that improve generation for specific categories.
 */
export const SUBJECT_HINTS: Record<string, string> = {
  // For character/person subjects
  person: 'portrait of',
  character: 'character portrait of',

  // For food subjects
  food: 'appetizing',

  // For game subjects
  game: 'video game',

  // For animal subjects
  animal: 'cute',

  // For abstract concepts
  concept: 'symbolic representation of',
}

/**
 * Recommended generation parameters for consistent results.
 */
export const GENERATION_PARAMS = {
  width: 512,
  height: 512,
  steps: 30,
  guidance: 7.5,
}
