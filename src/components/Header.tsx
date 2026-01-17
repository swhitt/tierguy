import { useThemeStore } from '../stores/themeStore'
import { useExportStore } from '../stores/exportStore'
import { useTierListStore } from '../stores/tierListStore'
import { downloadAsPng, downloadAsJson, importJsonFile } from '../utils/export'
import { SaveMenu } from './SaveMenu'

export function Header() {
  const { theme, toggleTheme } = useThemeStore()
  const exportRef = useExportStore((s) => s.exportRef)
  const tierList = useTierListStore((s) => s.tierList)
  const setTierList = useTierListStore((s) => s.setTierList)

  const handlePngExport = async () => {
    if (!exportRef) return
    await downloadAsPng(exportRef)
  }

  const handleJsonExport = () => {
    if (!tierList) return
    downloadAsJson(tierList)
  }

  const handleJsonImport = async () => {
    try {
      const imported = await importJsonFile()
      setTierList(imported)
    } catch (err) {
      console.error('Failed to import tier list:', err)
    }
  }

  return (
    <header className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-200/80 dark:border-gray-700/50 bg-white dark:bg-gray-900/95 backdrop-blur-sm">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <h1 className="text-base sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent shrink-0">
          TierGuy
        </h1>
        <SaveMenu />
      </div>
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          onClick={handleJsonImport}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
          aria-label="Import JSON"
          title="Import JSON"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0L13 8m4-4v12"
            />
          </svg>
        </button>
        <button
          onClick={handleJsonExport}
          disabled={!tierList}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Export JSON"
          title="Export JSON"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
        <button
          onClick={handlePngExport}
          disabled={!exportRef}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Download as PNG"
          title="Download as PNG"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4 4m0 0l4-4m-4 4V4M20 8l-4-4m0 0l-4 4m4-4v16"
            />
          </svg>
        </button>
        <button
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
