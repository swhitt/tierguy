import { create } from 'zustand'

interface ExportState {
  exportRef: HTMLElement | null
  setExportRef: (ref: HTMLElement | null) => void
}

export const useExportStore = create<ExportState>((set) => ({
  exportRef: null,
  setExportRef: (ref) => set({ exportRef: ref }),
}))
