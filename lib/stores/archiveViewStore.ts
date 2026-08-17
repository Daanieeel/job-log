import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ArchiveViewMode = 'compact' | 'extended';

type ArchiveViewStore = {
  mode: ArchiveViewMode;
  toggle: () => void;
};

export const useArchiveViewStore = create<ArchiveViewStore>()(
  persist(
    (set, get) => ({
      mode: 'compact',
      toggle: () => set({ mode: get().mode === 'compact' ? 'extended' : 'compact' }),
    }),
    {
      name: 'joblog.archive-view-mode',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
