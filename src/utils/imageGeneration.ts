const STORAGE_KEY = 'tierguy_openai_api_key'

const STYLE_SUFFIX =
  'simple icon style, centered subject, square format, clean background, suitable for tier list'

export interface GenerateImageResult {
  success: true
  imageData: string // base64 data URL
}

export interface GenerateImageError {
  success: false
  error: string
}

export type GenerateImageResponse = GenerateImageResult | GenerateImageError

/**
 * Get stored OpenAI API key
 */
export function getApiKey(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

/**
 * Store OpenAI API key
 */
export function setApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key)
}

/**
 * Clear stored API key
 */
export function clearApiKey(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Check if API key is configured
 */
export function hasApiKey(): boolean {
  const key = getApiKey()
  return key !== null && key.length > 0
}

/**
 * Enhance user prompt with tier-list-friendly styling
 */
function enhancePrompt(userPrompt: string): string {
  return `${userPrompt.trim()}, ${STYLE_SUFFIX}`
}

/**
 * Generate an image using OpenAI DALL-E API
 */
export async function generateImage(
  prompt: string
): Promise<GenerateImageResponse> {
  const apiKey = getApiKey()

  if (!apiKey) {
    return {
      success: false,
      error: 'No API key configured. Please add your OpenAI API key.',
    }
  }

  const enhancedPrompt = enhancePrompt(prompt)

  try {
    const response = await fetch(
      'https://api.openai.com/v1/images/generations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: enhancedPrompt,
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json',
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage =
        errorData.error?.message || `API error: ${response.status}`

      if (response.status === 401) {
        return {
          success: false,
          error: 'Invalid API key. Please check your OpenAI API key.',
        }
      }
      if (response.status === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        }
      }
      if (response.status === 400) {
        return { success: false, error: `Request rejected: ${errorMessage}` }
      }

      return { success: false, error: errorMessage }
    }

    const data = await response.json()
    const base64Image = data.data?.[0]?.b64_json

    if (!base64Image) {
      return { success: false, error: 'No image data in response' }
    }

    return {
      success: true,
      imageData: `data:image/png;base64,${base64Image}`,
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' }
      }
      return { success: false, error: `Network error: ${err.message}` }
    }
    return { success: false, error: 'Unknown error occurred' }
  }
}
