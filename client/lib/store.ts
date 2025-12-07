import { create } from 'zustand'

interface UIState {
    sidebarOpen: boolean
    toggleSidebar: () => void
    orderModalOpen: boolean
    setOrderModalOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    orderModalOpen: false,
    setOrderModalOpen: (open: boolean) => set({ orderModalOpen: open }),
}))
