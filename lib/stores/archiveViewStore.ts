import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ArchiveViewMode = 'compact' | 'extended';

type ArchiveViewStore = {
  mode: ArchiveViewMode;
  toggle: () => void;
  setMode: (mode: ArchiveViewMode) => void;
};

export const useArchiveViewStore = create<ArchiveViewStore>()(
  persist(
    (set, get) => ({
      mode: 'compact',
      toggle: () => set({ mode: get().mode === 'compact' ? 'extended' : 'compact' }),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'joblog.archive-view-mode',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
