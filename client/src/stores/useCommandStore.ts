import { create } from "zustand";

interface CommandState {
  isSearchOpen: boolean;
  isQuickTaskOpen: boolean;
  isShortcutModalOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  openQuickTask: () => void;
  closeQuickTask: () => void;
  toggleShortcutModal: () => void;
}

export const useCommandStore = create<CommandState>((set) => ({
  isSearchOpen: false,
  isQuickTaskOpen: false,
  isShortcutModalOpen: false,

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  openQuickTask: () => set({ isQuickTaskOpen: true }),
  closeQuickTask: () => set({ isQuickTaskOpen: false }),
  toggleShortcutModal: () => set((s) => ({ isShortcutModalOpen: !s.isShortcutModalOpen })),
}));
