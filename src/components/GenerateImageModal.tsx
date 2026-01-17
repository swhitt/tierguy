import { useState, useRef, useEffect } from 'react'
import {
  generateImage,
  hasApiKey,
  setApiKey,
  clearApiKey,
} from '../utils/imageGeneration'

type ModalState = 'api-key' | 'prompt' | 'generating' | 'preview' | 'error'

interface GenerateImageModalProps {
  onConfirm: (imageData: string, label: string) => void
  onCancel: () => void
}

export function GenerateImageModal({
  onConfirm,
  onCancel,
}: GenerateImageModalProps) {
  const [state, setState] = useState<ModalState>(() =>
    hasApiKey() ? 'prompt' : 'api-key'
  )
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [prompt, setPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const promptInputRef = useRef<HTMLInputElement>(null)
  const apiKeyInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state === 'prompt') {
      promptInputRef.current?.focus()
    } else if (state === 'api-key') {
      apiKeyInputRef.current?.focus()
    }
  }, [state])

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim()
    if (!trimmed) return

    setApiKey(trimmed)
    setApiKeyInput('')
    setState('prompt')
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setState('generating')
    setError(null)

    const result = await generateImage(prompt)

    if (result.success) {
      setGeneratedImage(result.imageData)
      setState('preview')
    } else {
      setError(result.error)
      if (result.error.includes('API key')) {
        setState('api-key')
      } else {
        setState('error')
      }
    }
  }

  const handleRegenerate = () => {
    setGeneratedImage(null)
    handleGenerate()
  }

  const handleAccept = () => {
    if (generatedImage) {
      onConfirm(generatedImage, prompt.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (state === 'api-key') {
        handleSaveApiKey()
      } else if (state === 'prompt') {
        handleGenerate()
      }
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  const handleClearApiKey = () => {
    clearApiKey()
    setState('api-key')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Generate Image with AI
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {state === 'api-key' &&
              'Enter your OpenAI API key to generate images'}
            {state === 'prompt' && 'Describe what you want to generate'}
            {state === 'generating' && 'Creating your image...'}
            {state === 'preview' && 'Preview your generated image'}
            {state === 'error' && 'Something went wrong'}
          </p>
        </div>

        <div className="p-4">
          {state === 'api-key' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  OpenAI API Key
                </label>
                <input
                  ref={apiKeyInputRef}
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Get your API key from{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    platform.openai.com
                  </a>
                  . Your key is stored locally.
                </p>
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>
          )}

          {state === 'prompt' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  ref={promptInputRef}
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., pizza, basketball, red car"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  We'll enhance your description for icon-style output
                </p>
              </div>
              <button
                onClick={handleClearApiKey}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Change API key
              </button>
            </div>
          )}

          {state === 'generating' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generating "{prompt}"...
              </p>
            </div>
          )}

          {state === 'preview' && generatedImage && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={generatedImage}
                  alt={prompt}
                  className="w-48 h-48 rounded-lg object-cover shadow-lg"
                />
              </div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                "{prompt}"
              </p>
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          {state === 'api-key' && (
            <>
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKeyInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save & Continue
              </button>
            </>
          )}

          {state === 'prompt' && (
            <>
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate
              </button>
            </>
          )}

          {state === 'generating' && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}

          {state === 'preview' && (
            <>
              <button
                onClick={handleRegenerate}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Regenerate
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Use Image
              </button>
            </>
          )}

          {state === 'error' && (
            <>
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setState('prompt')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
